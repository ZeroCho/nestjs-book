export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  maxRetries?: number;
}

export interface IAIProvider {
  generateText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIResponse>;

  streamText(
    messages: AIMessage[],
    options?: AIGenerateOptions,
  ): AsyncIterable<string>;
}
