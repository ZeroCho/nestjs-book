import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  logger?: Logger,
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 재시도 가능한 에러인지 확인
      if (!isRetryableError(error, opts.retryableErrors)) {
        logger?.warn(`재시도 불가능한 에러, ${attempt}: ${error.message}`);
        throw error;
      }

      // 마지막 시도였으면 에러 던지기
      if (attempt > opts.maxRetries) {
        logger?.error(`모든 ${opts.maxRetries}번의 재시도가 실패했습니다: ${error.message}`);
        throw error;
      }

      // 에러에 retryAfter가 있으면 그 값 사용
      const retryAfter = error.retryAfter ? error.retryAfter * 1000 : delay;
      const actualDelay = Math.min(retryAfter, opts.maxDelayMs);

      logger?.warn(
        `${attempt}번 실패: ${error.message}. ${actualDelay}ms 후 재시도...`
      );

      await sleep(actualDelay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError!;
}

function isRetryableError(error: any, retryableErrors?: string[]): boolean {
  // AIError의 retryable 플래그 확인
  if (error.retryable !== undefined) {
    return error.retryable;
  }

  // 특정 에러 코드 확인
  if (retryableErrors && error.code) {
    return retryableErrors.includes(error.code);
  }

  // 기본적으로 네트워크 에러와 타임아웃은 재시도
  const retryableCodes = ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED'];
  if (retryableCodes.includes(error.code)) {
    return true;
  }

  // 5xx 서버 에러는 재시도
  if (error.status >= 500) {
    return true;
  }

  // 429 Rate Limit은 재시도
  if (error.status === 429) {
    return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

