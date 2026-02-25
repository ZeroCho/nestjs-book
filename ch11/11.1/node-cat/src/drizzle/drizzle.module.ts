import { Module, DynamicModule, OnModuleInit, OnApplicationBootstrap } from "@nestjs/common";
import { DrizzleMySqlService, DrizzleMySqlConfig } from "./drizzle.service";

interface DrizzleModuleConfig {
  useFactory: (...args: any[]) => DrizzleMySqlConfig;
  inject?: any[];
  isGlobal?: boolean;
}

@Module({})
export class DrizzleModule implements OnModuleInit, OnApplicationBootstrap {
  onModuleInit() {
    console.log('DrizzleModule init');
  }

  onApplicationBootstrap() {
    console.log('DrizzleModule bootstrap');
  }

  static forRootAsync(provider: DrizzleModuleConfig): DynamicModule {
    return {
      module: DrizzleModule,
      global: provider.isGlobal ?? false,
      providers: [
        DrizzleMySqlService,
        {
          ...provider,
          provide: 'DRIZZLE_MYSQL_CONFIG',
        },
        {
          provide: 'DRIZZLE',
          useFactory: (drizzleService: DrizzleMySqlService, config: DrizzleMySqlConfig) => {
            return drizzleService.getDrizzle(config);
          },
          inject: [DrizzleMySqlService, 'DRIZZLE_MYSQL_CONFIG'],
        },
      ],
      exports: ['DRIZZLE']
    }
  }
}
