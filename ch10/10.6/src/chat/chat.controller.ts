import {
  Controller, Post, Get, Delete, Body, Param, Res,
  HttpStatus, HttpException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ConfigService } from '@nestjs/config';
import { AiService } from 'src/ai/ai.service';
import { RateLimitGuard } from 'src/utils/rate-limit.guard';
import { RateLimit } from 'src/utils/rate-limit.decorator';
import { SanitizePipe } from 'src/utils/sanitize.pipe';

@Controller('api/chat')
@UseGuards(RateLimitGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private configService: ConfigService,
    private aiService: AiService,
  ) {}

  @Post('stream')
  @RateLimit(5, 60000) // 1분에 5회 요청 제한
  async streamChat(
    @Body(SanitizePipe) chatMessageDto: ChatMessageDto,
    @Res() res: Response,
  ) {
    const sessionId = chatMessageDto.sessionId || this.chatService.generateSessionId();
    try {
      // SSE 헤더 설정
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      // 스트리밍 시작
      const stream = this.chatService.chatStream(
        sessionId,
        chatMessageDto.message,
        chatMessageDto.provider,
      );

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk, sessionId })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
      res.end();
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({ error: error.message, sessionId })}\n\n`,
      );
      res.end();
    }
  }

  @Get('providers')
  getProviders() {
    const availableProviders = this.aiService.getAvailableProviders();

    // 프로바이더 표시 이름 매핑
    const providerDisplayNames: Record<string, string> = {
      openai: 'gpt-5.4',
      claude: 'Claude',
      gemini: 'Gemini',
    };

    const providers = availableProviders.map((provider) => ({
      value: provider,
      label: providerDisplayNames[provider] || provider,
    }));

    return {
      providers,
      default:
        this.configService.get<string>('app.defaultProvider') || 'openai',
    };
  }

  @Get('history/:sessionId')
  getHistory(@Param('sessionId') sessionId: string) {
    const messages = this.chatService.getSessionMessages(sessionId);
    return {
      sessionId,
      messages,
      count: messages.length,
    };
  }

  @Delete('session/:sessionId')
  clearSession(@Param('sessionId') sessionId: string) {
    const success = this.chatService.clearSession(sessionId);

    if (!success) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Session cleared successfully',
      sessionId,
    };
  }
}
