import { AiValidator, AiValidationResult } from './aiValidator';
import logger from '../utils/logger';

export class ValidationService {
  /**
   * Validates healthcare/pharmacy claim responses.
   * Checks adjudication status (PAID/REJECTED), reject codes, formulary rules, and prior auth needs.
   */
  static async validateClaimResponse(claimResponse: any): Promise<AiValidationResult> {
    logger.info('Starting AI claim response validation...');
    const context = `
Healthcare Pharmacy Claim Adjudication Response:
- Validate if the claim is PAID or REJECTED.
- If REJECTED, confirm that the reject codes (e.g. Code 75: Prior Authorization Required, Code 70: Drug Not Covered) and explanations are logical.
- Check if copay, deductible, and patient responsibility amounts match standard configurations (e.g., $10 for generic, $35 for brand, or specialty drug restrictions).
- Detail any business logic issues, such as missing reject details or incorrect pricing adjustments.
`;
    return AiValidator.validate(context, claimResponse);
  }

  /**
   * Validates healthcare eligibility check responses.
   * Verifies member coverage, effective dates, network alignment, and active status.
   */
  static async validateEligibilityResponse(eligibilityResponse: any): Promise<AiValidationResult> {
    logger.info('Starting AI eligibility response validation...');
    const context = `
Healthcare Eligibility Verification Response:
- Check if the member status is ACTIVE or INACTIVE.
- Validate that effective coverage dates encompass the current transaction date.
- Verify benefit identifiers (Group ID, Plan Code, Network designations).
- Check that deductible, copay accumulator limits, and remaining balances are correctly initialized.
`;
    return AiValidator.validate(context, eligibilityResponse);
  }

  /**
   * Validates drug pricing calculations.
   * Checks ingredient costs, dispensing fees, discounts, and total drug pricing correctness.
   */
  static async validatePricingResponse(pricingResponse: any): Promise<AiValidationResult> {
    logger.info('Starting AI pricing response validation...');
    const context = `
Pharmacy Drug Pricing & Reimbursement Calculation:
- Validate that the ingredient cost calculation is correct: (Average Wholesale Price (AWP) * (1 - Discount_Percentage)).
- Verify dispensing fee and sales tax calculations are added to produce the correct Final Allowed Amount.
- Compare Patient Copay + Plan Paid to confirm they equal the Allowed Amount.
`;
    return AiValidator.validate(context, pricingResponse);
  }
}
