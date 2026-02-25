import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import {
  IAIProvider,
  AIMessage,
  AIResponse,
  AIGenerateOptions,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements IAIProvider {
  private openai;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    this.model = this.configService.get<string>('openai.model') || 'gpt-4o';

    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    this.openai = createOpenAI({ apiKey });
  }

  async generateText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIResponse> {
    const { text } = await generateText({
      model: this.openai(this.model),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options?.temperature ?? 0.7,
      maxRetries: options?.maxRetries ?? 3,
    });

    return {
      content: text,
      provider: 'openai',
      model: this.model,
    };
  }

  async *streamText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): AsyncIterable<string> {
    const { textStream } = streamText({
      model: this.openai(this.model),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options?.temperature ?? 0.7,
    });

    for await (const chunk of textStream) {
      yield chunk;
    }
  }
}
