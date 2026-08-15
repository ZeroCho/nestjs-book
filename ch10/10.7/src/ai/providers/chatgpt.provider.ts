import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAIProvider,
  AIMessage,
  AIResponse,
  AIGenerateOptions,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class ChatGPTProvider implements IAIProvider {
  private openai;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    this.model = this.configService.get<string>('openai.model') || 'gpt-4o';

    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async generateText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIResponse> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      n: 1,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined;
    return {
      content: content,
      provider: 'chatgpt',
      model: this.model,
      usage: usage,
    };
  }

  async *streamText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): AsyncIterable<string> {
    const stream = this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      n: 1,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      yield content;
    }
  }
}
