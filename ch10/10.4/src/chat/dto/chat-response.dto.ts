export class ChatResponseDto {
  message: string;
  provider: string;
  model: string;
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
