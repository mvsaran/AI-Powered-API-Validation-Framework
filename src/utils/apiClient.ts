import { APIRequestContext, APIResponse } from '@playwright/test';
import logger from './logger';

export interface ApiRequestContextInfo {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: any;
}

export interface ApiResponseContextInfo {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  durationMs: number;
}

export interface ApiCallContext {
  request: ApiRequestContextInfo;
  response: ApiResponseContextInfo;
}

/**
 * Helper to measure execution time and extract response information.
 */
async function parseResponse(
  response: APIResponse,
  durationMs: number
): Promise<ApiResponseContextInfo> {
  const status = response.status();
  const statusText = response.statusText();
  const headers = response.headers();
  let body: any = null;

  const contentType = headers['content-type'] || '';
  try {
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }
  } catch (error) {
    logger.warn('Failed to parse response body', error);
    body = '[Unparseable Body]';
  }

  return {
    status,
    statusText,
    headers,
    body,
    durationMs,
  };
}

export class ApiClient {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Performs an HTTP POST request and returns the full context.
   */
  async post(url: string, options: { headers?: Record<string, string>; data?: any } = {}): Promise<ApiCallContext> {
    const method = 'POST';
    const requestHeaders = options.headers || {};
    logger.info(`Sending ${method} request to: ${url}`);
    logger.debug('Request Data:', options.data);

    const startTime = Date.now();
    let response: APIResponse;
    try {
      response = await this.request.post(url, {
        headers: requestHeaders,
        data: options.data,
      });
    } catch (error) {
      logger.error(`POST request to ${url} failed`, error);
      throw error;
    }
    const durationMs = Date.now() - startTime;

    const responseContext = await parseResponse(response, durationMs);
    logger.info(`Response received from ${url}: Status ${responseContext.status} (${durationMs}ms)`);

    return {
      request: {
        url,
        method,
        headers: requestHeaders,
        data: options.data,
      },
      response: responseContext,
    };
  }

  /**
   * Performs an HTTP GET request and returns the full context.
   */
  async get(url: string, options: { headers?: Record<string, string> } = {}): Promise<ApiCallContext> {
    const method = 'GET';
    const requestHeaders = options.headers || {};
    logger.info(`Sending ${method} request to: ${url}`);

    const startTime = Date.now();
    let response: APIResponse;
    try {
      response = await this.request.get(url, {
        headers: requestHeaders,
      });
    } catch (error) {
      logger.error(`GET request to ${url} failed`, error);
      throw error;
    }
    const durationMs = Date.now() - startTime;

    const responseContext = await parseResponse(response, durationMs);
    logger.info(`Response received from ${url}: Status ${responseContext.status} (${durationMs}ms)`);

    return {
      request: {
        url,
        method,
        headers: requestHeaders,
      },
      response: responseContext,
    };
  }
}
