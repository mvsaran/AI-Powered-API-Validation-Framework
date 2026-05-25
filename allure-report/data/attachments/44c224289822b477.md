# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: claimValidation.spec.ts >> Healthcare Pharmacy Claim Adjudication - AI Validation >> Scenario 3: Rejected Non-Formulary Nexium (Expected FAIL - Drug Excluded)
- Location: src\tests\claimValidation.spec.ts:161:7

# Error details

```
Error: listen EADDRINUSE: address already in use :::3001
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as http from 'http';
  3   | import { ApiClient } from '../utils/apiClient';
  4   | import { ValidationService } from '../ai/validationService';
  5   | import { ReportHelper } from '../utils/reportHelper';
  6   | import { mockClaimsData } from './fixtures/mockClaimsData';
  7   | import logger from '../utils/logger';
  8   | 
  9   | let server: http.Server;
  10  | const PORT = 3001;
  11  | const BASE_MOCK_URL = `http://localhost:${PORT}`;
  12  | 
  13  | test.beforeAll(async () => {
  14  |   logger.info('Starting local mock pharmacy API server...');
  15  |   
  16  |   // Set up mock HTTP responses for claim, eligibility, and pricing tests
  17  |   server = http.createServer((req, res) => {
  18  |     res.setHeader('Content-Type', 'application/json');
  19  |     res.setHeader('Access-Control-Allow-Origin', '*');
  20  | 
  21  |     logger.debug(`Mock server received request: ${req.method} ${req.url}`);
  22  | 
  23  |     if (req.method === 'POST' && req.url === '/api/claims/metformin') {
  24  |       res.writeHead(200);
  25  |       res.end(JSON.stringify(mockClaimsData.metforminSuccess));
  26  |     } else if (req.method === 'POST' && req.url === '/api/claims/humira') {
  27  |       res.writeHead(200);
  28  |       res.end(JSON.stringify(mockClaimsData.humiraRejectedPA));
  29  |     } else if (req.method === 'POST' && req.url === '/api/claims/nexium') {
  30  |       res.writeHead(200);
  31  |       res.end(JSON.stringify(mockClaimsData.nexiumRejectedFormulary));
  32  |     } else if (req.method === 'GET' && req.url === '/api/eligibility/active') {
  33  |       res.writeHead(200);
  34  |       res.end(JSON.stringify({
  35  |         status: 'ACTIVE',
  36  |         memberId: 'MBR100021',
  37  |         effectiveStartDate: '2025-01-01',
  38  |         effectiveEndDate: '2026-12-31',
  39  |         groupNumber: 'RX8821',
  40  |         planName: 'PPO-GOLD',
  41  |         accumulators: {
  42  |           deductibleMax: 1500.00,
  43  |           deductibleMet: 350.00,
  44  |           oopMax: 5000.00,
  45  |           oopMet: 1200.00
  46  |         }
  47  |       }));
  48  |     } else if (req.method === 'GET' && req.url === '/api/eligibility/inactive') {
  49  |       res.writeHead(200);
  50  |       res.end(JSON.stringify({
  51  |         status: 'INACTIVE',
  52  |         memberId: 'MBR100021',
  53  |         effectiveStartDate: '2024-01-01',
  54  |         effectiveEndDate: '2026-04-30', // Coverage terminated
  55  |         groupNumber: 'RX8821',
  56  |         planName: 'PPO-GOLD',
  57  |         accumulators: {}
  58  |       }));
  59  |     } else if (req.method === 'GET' && req.url === '/api/pricing/correct') {
  60  |       res.writeHead(200);
  61  |       res.end(JSON.stringify({
  62  |         ndc: '50090-2849-0',
  63  |         contractDiscount: 0.15, // AWP - 15%
  64  |         awpPrice: 100.00,
  65  |         ingredientCost: 85.00, // Correctly matches 100 * 0.85
  66  |         dispensingFee: 2.50,
  67  |         allowedAmount: 87.50, // 85.00 + 2.50
  68  |         patientCopay: 10.00,
  69  |         planPaid: 77.50 // 87.50 - 10.00
  70  |       }));
  71  |     } else if (req.method === 'GET' && req.url === '/api/pricing/incorrect') {
  72  |       res.writeHead(200);
  73  |       res.end(JSON.stringify({
  74  |         ndc: '50090-2849-0',
  75  |         contractDiscount: 0.15,
  76  |         awpPrice: 100.00,
  77  |         ingredientCost: 95.00, // ERROR: Discrepancy! Should be 85.00 based on contract discount (AWP - 15%)
  78  |         dispensingFee: 2.50,
  79  |         allowedAmount: 97.50,
  80  |         patientCopay: 10.00,
  81  |         planPaid: 77.50 // ERROR: 10.00 + 77.50 = 87.50, which doesn't balance with allowed amount 97.50
  82  |       }));
  83  |     } else {
  84  |       res.writeHead(404);
  85  |       res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
  86  |     }
  87  |   });
  88  | 
  89  |   await new Promise<void>((resolve) => {
> 90  |     server.listen(PORT, () => {
      |            ^ Error: listen EADDRINUSE: address already in use :::3001
  91  |       logger.info(`Mock pharmacy server listening on ${BASE_MOCK_URL}`);
  92  |       resolve();
  93  |     });
  94  |   });
  95  | });
  96  | 
  97  | test.afterAll(async () => {
  98  |   logger.info('Shutting down local mock pharmacy server...');
  99  |   await new Promise<void>((resolve) => {
  100 |     server.close(() => {
  101 |       logger.info('Mock server stopped.');
  102 |       resolve();
  103 |     });
  104 |   });
  105 | });
  106 | 
  107 | test.describe('Healthcare Pharmacy Claim Adjudication - AI Validation', () => {
  108 |   
  109 |   test('Scenario 1: Paid Metformin Generic Claim (Expected PASS)', async ({ request }) => {
  110 |     const client = new ApiClient(request);
  111 |     
  112 |     // 1. Submit the claim via the API
  113 |     const context = await client.post(`${BASE_MOCK_URL}/api/claims/metformin`, {
  114 |       data: {
  115 |         memberId: "MBR100021",
  116 |         groupId: "RX8821",
  117 |         ndc: "50090-2849-0",
  118 |         quantity: 60,
  119 |         daysSupply: 30
  120 |       }
  121 |     });
  122 | 
  123 |     // 2. Validate the claim using the AI Service
  124 |     const aiResult = await ValidationService.validateClaimResponse(context.response.body);
  125 | 
  126 |     // 3. Attach report assets to Allure
  127 |     await ReportHelper.attachTestContext(context, aiResult);
  128 | 
  129 |     // 4. Assertions
  130 |     expect(aiResult.status).toBe('PASS');
  131 |     expect(aiResult.reasoning).toContain('PAID');
  132 |     expect(aiResult.reasoning.toLowerCase()).toContain('copay');
  133 |   });
  134 | 
  135 |   test('Scenario 2: Rejected Specialty Drug Humira (Expected FAIL - Missing PA)', async ({ request }) => {
  136 |     const client = new ApiClient(request);
  137 |     
  138 |     // 1. Submit the claim via the API
  139 |     const context = await client.post(`${BASE_MOCK_URL}/api/claims/humira`, {
  140 |       data: {
  141 |         memberId: "MBR100021",
  142 |         groupId: "RX8821",
  143 |         ndc: "00074-4339-02",
  144 |         quantity: 2,
  145 |         daysSupply: 30
  146 |       }
  147 |     });
  148 | 
  149 |     // 2. Validate the claim using the AI Service
  150 |     const aiResult = await ValidationService.validateClaimResponse(context.response.body);
  151 | 
  152 |     // 3. Attach report assets to Allure
  153 |     await ReportHelper.attachTestContext(context, aiResult);
  154 | 
  155 |     // 4. Assertions
  156 |     expect(aiResult.status).toBe('FAIL');
  157 |     expect(aiResult.reasoning).toContain('75');
  158 |     expect(aiResult.possibleRootCause).toContain('Prior Authorization');
  159 |   });
  160 | 
  161 |   test('Scenario 3: Rejected Non-Formulary Nexium (Expected FAIL - Drug Excluded)', async ({ request }) => {
  162 |     const client = new ApiClient(request);
  163 |     
  164 |     // 1. Submit the claim via the API
  165 |     const context = await client.post(`${BASE_MOCK_URL}/api/claims/nexium`, {
  166 |       data: {
  167 |         memberId: "MBR100021",
  168 |         groupId: "RX8821",
  169 |         ndc: "0186-5040-31",
  170 |         quantity: 30,
  171 |         daysSupply: 30
  172 |       }
  173 |     });
  174 | 
  175 |     // 2. Validate the claim using the AI Service
  176 |     const aiResult = await ValidationService.validateClaimResponse(context.response.body);
  177 | 
  178 |     // 3. Attach report assets to Allure
  179 |     await ReportHelper.attachTestContext(context, aiResult);
  180 | 
  181 |     // 4. Assertions
  182 |     expect(aiResult.status).toBe('FAIL');
  183 |     expect(aiResult.reasoning).toContain('70');
  184 |     expect(aiResult.possibleRootCause).toContain('formulary');
  185 |   });
  186 | });
  187 | 
  188 | test.describe('Healthcare Member Eligibility - AI Validation', () => {
  189 | 
  190 |   test('Scenario 4: Active Member Eligibility Check (Expected PASS)', async ({ request }) => {
```