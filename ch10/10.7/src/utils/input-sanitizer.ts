export interface SanitizeOptions {
  maxLength?: number;
  removePatterns?: RegExp[];
  allowedTags?: string[];
}

// 위험한 Prompt Injection 패턴들
const DANGEROUS_PATTERNS = [
  // 시스템 프롬프트 조작 시도
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /forget\s+(everything|all|your)\s+(instructions?|rules?)/gi,
  
  // 역할 변경 시도
  /you\s+are\s+(now|no\s+longer)/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /act\s+as\s+(if|though)/gi,
  /new\s+(persona|personality|identity)/gi,
  
  // 시스템 명령 주입
  /\[system\]/gi,
  /\[admin\]/gi,
  /\[sudo\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  
  // 탈옥 시도
  /jailbreak/gi,
  /dan\s*mode/gi,
  /developer\s+mode/gi,
  
  // 데이터 추출 시도
  /repeat\s+(back|all|everything)/gi,
  /what\s+(are|were)\s+your\s+(instructions|prompts?|rules?)/gi,
  /show\s+(me\s+)?your\s+(system|initial)\s+prompt/gi,
];

export class InputSanitizer {
  // 기본 sanitization
  static sanitize(input: string, options: SanitizeOptions = {}): string {
    let sanitized = input;

    // 1. 길이 제한
    const maxLength = options.maxLength || 4000;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // 2. 위험한 패턴 제거
    const patterns = options.removePatterns || DANGEROUS_PATTERNS;
    for (const pattern of patterns) {
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    }

    // 3. 제어 문자 제거
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // 4. 유니코드 정규화
    sanitized = sanitized.normalize('NFC');

    return sanitized.trim();
  }

  // Prompt Injection 감지
  static detectPromptInjection(input: string): {
    detected: boolean;
    patterns: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const detectedPatterns: string[] = [];
    
    for (const pattern of DANGEROUS_PATTERNS) {
      const matches = input.match(pattern);
      if (matches) {
        detectedPatterns.push(matches[0]);
      }
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (detectedPatterns.length > 3) {
      riskLevel = 'high';
    } else if (detectedPatterns.length > 0) {
      riskLevel = 'medium';
    }

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      riskLevel,
    };
  }

  // HTML 이스케이프 (XSS 방지)
  static escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // URL 검증
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}