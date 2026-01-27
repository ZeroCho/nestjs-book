import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AnalyticsService {
  @OnEvent('user.created')
  async handleUserCreated(event: {
    userId: string;
    name: string;
    createdAt: Date;
  }) {
    console.log('📊 [AnalyticsService] 사용자 생성 분석 시작');
    await this.updateUserRegistrationStats(event);
    await this.analyzeMarketingCampaign(event);
    console.log('📊 [AnalyticsService] 사용자 생성 분석 완료');
  }

  @OnEvent('post.created')
  async handlePostCreated(event: {
    postId: number;
    userId: string;
    content: string;
    createdAt: Date;
  }) {
    console.log('📊 [AnalyticsService] 게시글 생성 분석 시작');
    await this.analyzeContentEngagement(event);
    await this.updateUserActivityPattern(event.userId);
    await this.updateTrendAnalysis(event.content);
    console.log('📊 [AnalyticsService] 게시글 생성 분석 완료');
  }

  private async updateUserRegistrationStats(event: {
    userId: string;
    name: string;
    createdAt: Date;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 110));
    console.log(`📈 사용자 등록 통계 업데이트: ${event.name}`);
  }

  private async analyzeMarketingCampaign(event: {
    userId: string;
    name: string;
    createdAt: Date;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 130));
    console.log(`🎯 마케팅 캠페인 효과 분석: ${event.name}`);
  }

  private async analyzeContentEngagement(event: {
    postId: number;
    userId: string;
    content: string;
    createdAt: Date;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 140));
    const wordCount = event.content.split(' ').length;
    console.log(`📈 콘텐츠 참여도 분석: ${wordCount}단어 게시글`);
  }

  private async updateUserActivityPattern(userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 85));
    console.log(`🔄 사용자 활동 패턴 업데이트: ${userId}`);
  }

  private async updateTrendAnalysis(content: string) {
    await new Promise((resolve) => setTimeout(resolve, 160));
    const hashtags = content.match(/#[^\s#]*/g) || [];
    console.log(`📈 트렌드 분석 업데이트: 해시태그 ${hashtags.join(', ')}`);
  }
}
