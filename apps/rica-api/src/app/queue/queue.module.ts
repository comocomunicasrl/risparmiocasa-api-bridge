import { DynamicModule, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ConfigOptions } from './_models/config-options';
import { QueueConsumerService } from './queue-consumer.service';

@Module({
    controllers: [],
    providers: [],
})
export class QueueModule {
    static register(options: ConfigOptions): DynamicModule {
        return {
          module: QueueModule,
          providers: [
            {
              provide: 'CONFIG_OPTIONS',
              useValue: options
            },
            QueueService,
            QueueConsumerService
          ],
          exports: [
            QueueService
          ],
        };
    }
};