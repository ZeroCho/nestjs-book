import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import {
  IAIProvider,
  AIMessage,
  AIResponse,
  AIGenerateOptions,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements IAIProvider {
  private google;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    this.model =
      this.configService.get<string>('gemini.model') ||
      'gemini-3-pro-preview';

    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    this.google = createGoogleGenerativeAI({ apiKey });
  }

  async generateText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIResponse> {
    const { text } = await generateText({
      model: this.google(this.model),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options?.temperature ?? 0.7,
    });

    return {
      content: text,
      provider: 'gemini',
      model: this.model,
    };
  }

  async *streamText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): AsyncIterable<string> {
    const { textStream } = streamText({
      model: this.google(this.model),
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
