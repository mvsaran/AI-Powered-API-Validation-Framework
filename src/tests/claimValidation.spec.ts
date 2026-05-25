import { test, expect } from '@playwright/test';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { ApiClient } from '../utils/apiClient';
import { ValidationService } from '../ai/validationService';
import { ReportHelper } from '../utils/reportHelper';
import { mockClaimsData } from './fixtures/mockClaimsData';
import logger from '../utils/logger';

let server: http.Server;
const PORT = 3001;
const BASE_MOCK_URL = `http://localhost:${PORT}`;

test.beforeAll(async () => {
  logger.info('Writing Allure reporting metadata...');
  const allureResultsDir = path.resolve(__dirname, '../../allure-results');
  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(allureResultsDir, 'environment.properties'),
    `Environment=QA\nExecutor=Saran\n`
  );
  fs.writeFileSync(
    path.join(allureResultsDir, 'executor.json'),
    JSON.stringify({
      name: "Saran",
      type: "local",
      buildName: "Local Run"
    }, null, 2)
  );

  logger.info('Starting local mock pharmacy API server...');
  
  // Set up mock HTTP responses for claim, eligibility, and pricing tests
  server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    logger.debug(`Mock server received request: ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/api/claims/metformin') {
      res.writeHead(200);
      res.end(JSON.stringify(mockClaimsData.metforminSuccess));
    } else if (req.method === 'POST' && req.url === '/api/claims/humira') {
      res.writeHead(200);
      res.end(JSON.stringify(mockClaimsData.humiraRejectedPA));
    } else if (req.method === 'POST' && req.url === '/api/claims/nexium') {
      res.writeHead(200);
      res.end(JSON.stringify(mockClaimsData.nexiumRejectedFormulary));
    } else if (req.method === 'GET' && req.url === '/api/eligibility/active') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ACTIVE',
        memberId: 'MBR100021',
        effectiveStartDate: '2025-01-01',
        effectiveEndDate: '2026-12-31',
        groupNumber: 'RX8821',
        planName: 'PPO-GOLD',
        accumulators: {
          deductibleMax: 1500.00,
          deductibleMet: 350.00,
          oopMax: 5000.00,
          oopMet: 1200.00
        }
      }));
    } else if (req.method === 'GET' && req.url === '/api/eligibility/inactive') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'INACTIVE',
        memberId: 'MBR100021',
        effectiveStartDate: '2024-01-01',
        effectiveEndDate: '2026-04-30', // Coverage terminated
        groupNumber: 'RX8821',
        planName: 'PPO-GOLD',
        accumulators: {}
      }));
    } else if (req.method === 'GET' && req.url === '/api/pricing/correct') {
      res.writeHead(200);
      res.end(JSON.stringify({
        ndc: '50090-2849-0',
        contractDiscount: 0.15, // AWP - 15%
        awpPrice: 100.00,
        ingredientCost: 85.00, // Correctly matches 100 * 0.85
        dispensingFee: 2.50,
        allowedAmount: 87.50, // 85.00 + 2.50
        patientCopay: 10.00,
        planPaid: 77.50 // 87.50 - 10.00
      }));
    } else if (req.method === 'GET' && req.url === '/api/pricing/incorrect') {
      res.writeHead(200);
      res.end(JSON.stringify({
        ndc: '50090-2849-0',
        contractDiscount: 0.15,
        awpPrice: 100.00,
        ingredientCost: 95.00, // ERROR: Discrepancy! Should be 85.00 based on contract discount (AWP - 15%)
        dispensingFee: 2.50,
        allowedAmount: 97.50,
        patientCopay: 10.00,
        planPaid: 77.50 // ERROR: 10.00 + 77.50 = 87.50, which doesn't balance with allowed amount 97.50
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      logger.info(`Mock pharmacy server listening on ${BASE_MOCK_URL}`);
      resolve();
    });
  });
});

test.afterAll(async () => {
  logger.info('Shutting down local mock pharmacy server...');
  await new Promise<void>((resolve) => {
    server.close(() => {
      logger.info('Mock server stopped.');
      resolve();
    });
  });
});

test.describe('Healthcare Pharmacy Claim Adjudication - AI Validation', () => {
  
  test('Scenario 1: Paid Metformin Generic Claim (Expected PASS)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Submit the claim via the API
    const context = await client.post(`${BASE_MOCK_URL}/api/claims/metformin`, {
      data: {
        memberId: "MBR100021",
        groupId: "RX8821",
        ndc: "50090-2849-0",
        quantity: 60,
        daysSupply: 30
      }
    });

    // 2. Validate the claim using the AI Service
    const aiResult = await ValidationService.validateClaimResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('PASS');
    expect(aiResult.reasoning).toContain('PAID');
    expect(aiResult.reasoning.toLowerCase()).toContain('copay');
  });

  test('Scenario 2: Rejected Specialty Drug Humira (Expected FAIL - Missing PA)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Submit the claim via the API
    const context = await client.post(`${BASE_MOCK_URL}/api/claims/humira`, {
      data: {
        memberId: "MBR100021",
        groupId: "RX8821",
        ndc: "00074-4339-02",
        quantity: 2,
        daysSupply: 30
      }
    });

    // 2. Validate the claim using the AI Service
    const aiResult = await ValidationService.validateClaimResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('FAIL');
    expect(aiResult.reasoning).toContain('75');
    expect(aiResult.possibleRootCause?.toLowerCase()).toContain('prior authorization');
  });

  test('Scenario 3: Rejected Non-Formulary Nexium (Expected FAIL - Drug Excluded)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Submit the claim via the API
    const context = await client.post(`${BASE_MOCK_URL}/api/claims/nexium`, {
      data: {
        memberId: "MBR100021",
        groupId: "RX8821",
        ndc: "0186-5040-31",
        quantity: 30,
        daysSupply: 30
      }
    });

    // 2. Validate the claim using the AI Service
    const aiResult = await ValidationService.validateClaimResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('FAIL');
    expect(aiResult.reasoning).toContain('70');
    expect(aiResult.possibleRootCause).toContain('formulary');
  });
});

test.describe('Healthcare Member Eligibility - AI Validation', () => {

  test('Scenario 4: Active Member Eligibility Check (Expected PASS)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Execute eligibility endpoint
    const context = await client.get(`${BASE_MOCK_URL}/api/eligibility/active`);

    // 2. Validate using the AI service
    const aiResult = await ValidationService.validateEligibilityResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('PASS');
    expect(aiResult.reasoning).toContain('ACTIVE');
  });

  test('Scenario 5: Terminated Member Eligibility Check (Expected FAIL)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Execute eligibility endpoint
    const context = await client.get(`${BASE_MOCK_URL}/api/eligibility/inactive`);

    // 2. Validate using the AI service
    const aiResult = await ValidationService.validateEligibilityResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('FAIL');
    expect(aiResult.possibleRootCause).toContain('terminated');
  });
});

test.describe('Pharmacy Drug Pricing - AI Validation', () => {

  test('Scenario 6: Contract Pricing Calculations - Consistent (Expected PASS)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Execute pricing endpoint
    const context = await client.get(`${BASE_MOCK_URL}/api/pricing/correct`);

    // 2. Validate using the AI service
    const aiResult = await ValidationService.validatePricingResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('PASS');
    expect(aiResult.reasoning.toLowerCase()).toContain('pricing');
  });

  test('Scenario 7: Contract Pricing Calculations - Discrepancy (Expected FAIL)', async ({ request }) => {
    const client = new ApiClient(request);
    
    // 1. Execute pricing endpoint
    const context = await client.get(`${BASE_MOCK_URL}/api/pricing/incorrect`);

    // 2. Validate using the AI service
    const aiResult = await ValidationService.validatePricingResponse(context.response.body);

    // 3. Attach report assets to Allure
    await ReportHelper.attachTestContext(context, aiResult);

    // 4. Assertions
    expect(aiResult.status).toBe('FAIL');
    expect(aiResult.possibleRootCause).toContain('AWP');
  });
});
