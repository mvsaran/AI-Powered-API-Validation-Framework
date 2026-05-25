# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: claimValidation.spec.ts >> Pharmacy Drug Pricing - AI Validation >> Scenario 7: Contract Pricing Calculations - Discrepancy (Expected FAIL)
- Location: src\tests\claimValidation.spec.ts:244:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "FAIL"
Received: "PASS"
```

# Test source

```ts
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
  191 |     const client = new ApiClient(request);
  192 |     
  193 |     // 1. Execute eligibility endpoint
  194 |     const context = await client.get(`${BASE_MOCK_URL}/api/eligibility/active`);
  195 | 
  196 |     // 2. Validate using the AI service
  197 |     const aiResult = await ValidationService.validateEligibilityResponse(context.response.body);
  198 | 
  199 |     // 3. Attach report assets to Allure
  200 |     await ReportHelper.attachTestContext(context, aiResult);
  201 | 
  202 |     // 4. Assertions
  203 |     expect(aiResult.status).toBe('PASS');
  204 |     expect(aiResult.reasoning).toContain('ACTIVE');
  205 |   });
  206 | 
  207 |   test('Scenario 5: Terminated Member Eligibility Check (Expected FAIL)', async ({ request }) => {
  208 |     const client = new ApiClient(request);
  209 |     
  210 |     // 1. Execute eligibility endpoint
  211 |     const context = await client.get(`${BASE_MOCK_URL}/api/eligibility/inactive`);
  212 | 
  213 |     // 2. Validate using the AI service
  214 |     const aiResult = await ValidationService.validateEligibilityResponse(context.response.body);
  215 | 
  216 |     // 3. Attach report assets to Allure
  217 |     await ReportHelper.attachTestContext(context, aiResult);
  218 | 
  219 |     // 4. Assertions
  220 |     expect(aiResult.status).toBe('FAIL');
  221 |     expect(aiResult.possibleRootCause).toContain('terminated');
  222 |   });
  223 | });
  224 | 
  225 | test.describe('Pharmacy Drug Pricing - AI Validation', () => {
  226 | 
  227 |   test('Scenario 6: Contract Pricing Calculations - Consistent (Expected PASS)', async ({ request }) => {
  228 |     const client = new ApiClient(request);
  229 |     
  230 |     // 1. Execute pricing endpoint
  231 |     const context = await client.get(`${BASE_MOCK_URL}/api/pricing/correct`);
  232 | 
  233 |     // 2. Validate using the AI service
  234 |     const aiResult = await ValidationService.validatePricingResponse(context.response.body);
  235 | 
  236 |     // 3. Attach report assets to Allure
  237 |     await ReportHelper.attachTestContext(context, aiResult);
  238 | 
  239 |     // 4. Assertions
  240 |     expect(aiResult.status).toBe('PASS');
  241 |     expect(aiResult.reasoning.toLowerCase()).toContain('pricing');
  242 |   });
  243 | 
  244 |   test('Scenario 7: Contract Pricing Calculations - Discrepancy (Expected FAIL)', async ({ request }) => {
  245 |     const client = new ApiClient(request);
  246 |     
  247 |     // 1. Execute pricing endpoint
  248 |     const context = await client.get(`${BASE_MOCK_URL}/api/pricing/incorrect`);
  249 | 
  250 |     // 2. Validate using the AI service
  251 |     const aiResult = await ValidationService.validatePricingResponse(context.response.body);
  252 | 
  253 |     // 3. Attach report assets to Allure
  254 |     await ReportHelper.attachTestContext(context, aiResult);
  255 | 
  256 |     // 4. Assertions
> 257 |     expect(aiResult.status).toBe('FAIL');
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  258 |     expect(aiResult.possibleRootCause).toContain('AWP');
  259 |   });
  260 | });
  261 | 
```