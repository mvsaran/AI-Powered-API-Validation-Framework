# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: claimValidation.spec.ts >> Pharmacy Drug Pricing - AI Validation >> Scenario 6: Contract Pricing Calculations - Consistent (Expected PASS)
- Location: src\tests\claimValidation.spec.ts:247:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "pricing"
Received string:    "ingredient cost calculation validated: (average wholesale price (awp) * (1 - discount_percentage)) = 85.00. dispensing fee and sales tax calculations added to produce the correct final allowed amount of 87.50. patient copay + plan paid equals the allowed amount, confirming accurate reimbursement."
```

# Test source

```ts
  161 |         memberId: "MBR100021",
  162 |         groupId: "RX8821",
  163 |         ndc: "00074-4339-02",
  164 |         quantity: 2,
  165 |         daysSupply: 30
  166 |       }
  167 |     });
  168 | 
  169 |     // 2. Validate the claim using the AI Service
  170 |     const aiResult = await ValidationService.validateClaimResponse(context.response.body);
  171 | 
  172 |     // 3. Attach report assets to Allure
  173 |     await ReportHelper.attachTestContext(context, aiResult);
  174 | 
  175 |     // 4. Assertions
  176 |     expect(aiResult.status).toBe('FAIL');
  177 |     expect(aiResult.reasoning).toContain('75');
  178 |     expect(aiResult.possibleRootCause?.toLowerCase()).toContain('prior authorization');
  179 |   });
  180 | 
  181 |   test('Scenario 3: Rejected Non-Formulary Nexium (Expected FAIL - Drug Excluded)', async ({ request }) => {
  182 |     const client = new ApiClient(request);
  183 |     
  184 |     // 1. Submit the claim via the API
  185 |     const context = await client.post(`${BASE_MOCK_URL}/api/claims/nexium`, {
  186 |       data: {
  187 |         memberId: "MBR100021",
  188 |         groupId: "RX8821",
  189 |         ndc: "0186-5040-31",
  190 |         quantity: 30,
  191 |         daysSupply: 30
  192 |       }
  193 |     });
  194 | 
  195 |     // 2. Validate the claim using the AI Service
  196 |     const aiResult = await ValidationService.validateClaimResponse(context.response.body);
  197 | 
  198 |     // 3. Attach report assets to Allure
  199 |     await ReportHelper.attachTestContext(context, aiResult);
  200 | 
  201 |     // 4. Assertions
  202 |     expect(aiResult.status).toBe('FAIL');
  203 |     expect(aiResult.reasoning).toContain('70');
  204 |     expect(aiResult.possibleRootCause).toContain('formulary');
  205 |   });
  206 | });
  207 | 
  208 | test.describe('Healthcare Member Eligibility - AI Validation', () => {
  209 | 
  210 |   test('Scenario 4: Active Member Eligibility Check (Expected PASS)', async ({ request }) => {
  211 |     const client = new ApiClient(request);
  212 |     
  213 |     // 1. Execute eligibility endpoint
  214 |     const context = await client.get(`${BASE_MOCK_URL}/api/eligibility/active`);
  215 | 
  216 |     // 2. Validate using the AI service
  217 |     const aiResult = await ValidationService.validateEligibilityResponse(context.response.body);
  218 | 
  219 |     // 3. Attach report assets to Allure
  220 |     await ReportHelper.attachTestContext(context, aiResult);
  221 | 
  222 |     // 4. Assertions
  223 |     expect(aiResult.status).toBe('PASS');
  224 |     expect(aiResult.reasoning).toContain('ACTIVE');
  225 |   });
  226 | 
  227 |   test('Scenario 5: Terminated Member Eligibility Check (Expected FAIL)', async ({ request }) => {
  228 |     const client = new ApiClient(request);
  229 |     
  230 |     // 1. Execute eligibility endpoint
  231 |     const context = await client.get(`${BASE_MOCK_URL}/api/eligibility/inactive`);
  232 | 
  233 |     // 2. Validate using the AI service
  234 |     const aiResult = await ValidationService.validateEligibilityResponse(context.response.body);
  235 | 
  236 |     // 3. Attach report assets to Allure
  237 |     await ReportHelper.attachTestContext(context, aiResult);
  238 | 
  239 |     // 4. Assertions
  240 |     expect(aiResult.status).toBe('FAIL');
  241 |     expect(aiResult.possibleRootCause).toContain('terminated');
  242 |   });
  243 | });
  244 | 
  245 | test.describe('Pharmacy Drug Pricing - AI Validation', () => {
  246 | 
  247 |   test('Scenario 6: Contract Pricing Calculations - Consistent (Expected PASS)', async ({ request }) => {
  248 |     const client = new ApiClient(request);
  249 |     
  250 |     // 1. Execute pricing endpoint
  251 |     const context = await client.get(`${BASE_MOCK_URL}/api/pricing/correct`);
  252 | 
  253 |     // 2. Validate using the AI service
  254 |     const aiResult = await ValidationService.validatePricingResponse(context.response.body);
  255 | 
  256 |     // 3. Attach report assets to Allure
  257 |     await ReportHelper.attachTestContext(context, aiResult);
  258 | 
  259 |     // 4. Assertions
  260 |     expect(aiResult.status).toBe('PASS');
> 261 |     expect(aiResult.reasoning.toLowerCase()).toContain('pricing');
      |                                              ^ Error: expect(received).toContain(expected) // indexOf
  262 |   });
  263 | 
  264 |   test('Scenario 7: Contract Pricing Calculations - Discrepancy (Expected FAIL)', async ({ request }) => {
  265 |     const client = new ApiClient(request);
  266 |     
  267 |     // 1. Execute pricing endpoint
  268 |     const context = await client.get(`${BASE_MOCK_URL}/api/pricing/incorrect`);
  269 | 
  270 |     // 2. Validate using the AI service
  271 |     const aiResult = await ValidationService.validatePricingResponse(context.response.body);
  272 | 
  273 |     // 3. Attach report assets to Allure
  274 |     await ReportHelper.attachTestContext(context, aiResult);
  275 | 
  276 |     // 4. Assertions
  277 |     expect(aiResult.status).toBe('FAIL');
  278 |     expect(aiResult.possibleRootCause).toContain('AWP');
  279 |   });
  280 | });
  281 | 
```