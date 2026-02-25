import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { GeminiProvider } from './providers/gemini.provider';

@Module({
  providers: [AiService, OpenAIProvider, ClaudeProvider, GeminiProvider],
  exports: [AiService],
})
export class AiModule {}
