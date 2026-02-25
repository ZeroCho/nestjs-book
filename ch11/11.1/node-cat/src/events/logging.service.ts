import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class LoggingService {
  @OnEvent('user.created')
  async handleUserCreated(event: {
    userId: string;
    name: string;
    createdAt: Date;
  }) {
    console.log('📝 [LoggingService] 사용자 생성 로그 기록 시작');
    await this.saveUserCreationLog(event);
    await this.saveAuditLog('USER_CREATED', event.userId);
    console.log('📝 [LoggingService] 사용자 생성 로그 기록 완료');
  }

  @OnEvent('post.created')
  async handlePostCreated(event: {
    postId: number;
    userId: string;
    content: string;
    createdAt: Date;
  }) {
    console.log('📝 [LoggingService] 게시글 생성 로그 기록 시작');
    await this.savePostCreationLog(event);
    await this.analyzeContent(event.content);
    console.log('📝 [LoggingService] 게시글 생성 로그 기록 완료');
  }

  private async saveUserCreationLog(event: {
    userId: string;
    name: string;
    createdAt: Date;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    console.log(`💾 사용자 생성 로그 저장: ${event.userId} - ${event.name}`);
  }

  private async saveAuditLog(action: string, userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    console.log(`🔍 감사 로그 저장: ${action} - ${userId}`);
  }

  private async savePostCreationLog(event: {
    postId: number;
    userId: string;
    content: string;
    createdAt: Date;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 90));
    console.log(`💾 게시글 생성 로그 저장: ${event.postId} - ${event.userId}`);
  }

  private async analyzeContent(content: string) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const hashtags = content.match(/#[^\s#]*/g) || [];
    console.log(`🔍 콘텐츠 분석 완료: 해시태그 ${hashtags.length}개 발견`);
  }
}
