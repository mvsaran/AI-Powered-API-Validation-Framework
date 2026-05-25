import { allure } from 'allure-playwright';
import { ApiCallContext } from './apiClient';
import { AiValidationResult } from '../ai/aiValidator';
import logger from './logger';

export class ReportHelper {
  /**
   * Attaches the complete API and AI context to the current Allure report.
   */
  static async attachTestContext(apiContext: ApiCallContext, aiResult: AiValidationResult): Promise<void> {
    try {
      logger.info('Attaching context metadata to Allure report...');

      // 1. Attach Request Context
      const requestData = {
        url: apiContext.request.url,
        method: apiContext.request.method,
        headers: apiContext.request.headers,
        body: apiContext.request.data || null,
      };
      await allure.attachment(
        'API Request Details',
        JSON.stringify(requestData, null, 2),
        'application/json'
      );

      // 2. Attach Response Context
      const responseData = {
        status: apiContext.response.status,
        statusText: apiContext.response.statusText,
        headers: apiContext.response.headers,
        body: apiContext.response.body,
        durationMs: apiContext.response.durationMs,
      };
      await allure.attachment(
        'API Response Details',
        JSON.stringify(responseData, null, 2),
        'application/json'
      );

      // 3. Attach AI Validation Results
      await allure.attachment(
        'AI Validation Report',
        JSON.stringify(aiResult, null, 2),
        'application/json'
      );

      // 4. Set additional test metadata
      await allure.parameter('API Status', responseData.status.toString());
      await allure.parameter('AI Status', aiResult.status);
      await allure.parameter('Duration', `${responseData.durationMs}ms`);

      // Add a concise description detailing the validation reasoning
      const validationSummary = `
### AI Validation Status: **${aiResult.status}**
**Reasoning:**
${aiResult.reasoning}
${aiResult.possibleRootCause ? `\n**Possible Root Cause:**\n${aiResult.possibleRootCause}` : ''}
`;
      // Allure v3 supports markdown descriptions in report logs
      // Try setting description if the API exists
      try {
        await allure.description(validationSummary);
      } catch (descError) {
        logger.debug('Could not write allure description:', descError);
      }

    } catch (error) {
      logger.warn('Failed to write attachments to Allure. The report reporter may not be configured active.', error);
    }
  }
}
