import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiModule } from '../ai/ai.module';
import { RateLimitGuard } from 'src/utils/rate-limit.guard';

@Module({
  imports: [AiModule],
  controllers: [ChatController],
  providers: [ChatService, RateLimitGuard],
})
export class ChatModule {}
