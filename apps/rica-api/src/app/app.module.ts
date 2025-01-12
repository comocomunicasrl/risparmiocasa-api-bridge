import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiBridgeController } from './api-bridge/api-bridge.controller';
import { HttpModule } from '@nestjs/axios';
import { QueueModule } from './queue/queue.module';
import { NatsStreamConfig } from '@yepmind/nats-rx-client';
import streams from "./queue/queue-streams-config.json";

@Module({
    imports: [
        HttpModule,
        QueueModule.register({
            streams: streams as NatsStreamConfig[],
            servers: process.env.NATS_SERVERS
        })
    ],
    controllers: [
        AppController,
        ApiBridgeController
    ],
    providers: [
        AppService
    ],
})
export class AppModule { }
