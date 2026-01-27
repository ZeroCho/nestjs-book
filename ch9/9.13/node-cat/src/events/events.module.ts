import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { LoggingService } from './logging.service';
import { AnalyticsService } from './analytics.service';

@Module({
  providers: [NotificationService, LoggingService, AnalyticsService],
  exports: [NotificationService, LoggingService, AnalyticsService],
})
export class EventsModule {}
