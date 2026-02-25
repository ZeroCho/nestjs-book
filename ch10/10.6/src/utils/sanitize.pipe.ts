import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InputSanitizer } from './input-sanitizer';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly logger = new Logger(SanitizePipe.name);

  transform(value: any) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(value: string): string {
    // Prompt Injection 감지
    const detection = InputSanitizer.detectPromptInjection(value);
    
    if (detection.riskLevel === 'high') {
      this.logger.warn(`고위험 프롬프트 인젝션이 감지됨: ${detection.patterns.join(', ')}`);
      throw new BadRequestException('요청 내용에 허용되지 않는 패턴이 포함되어 있습니다.');
    }

    if (detection.detected) {
      this.logger.warn(`프롬프트 인젝션 패턴이 감지됨: ${detection.patterns.join(', ')}`);
    }

    return InputSanitizer.sanitize(value);
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}