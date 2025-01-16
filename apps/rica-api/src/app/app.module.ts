import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiBridgeController } from './api-bridge/api-bridge.controller';
import { HttpModule } from '@nestjs/axios';
import { QueueModule } from './queue/queue.module';
import { NatsStreamConfig } from '@yepmind/nats-rx-client';
import streams from "./queue/queue-streams-config.json";
import { FantasanremoController } from './fantasanremo/fantasanremo.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { FantasanremoCustomerSchema } from './fantasanremo/fantasanremo-cutomer.schema';
import { FantasanremoService } from './fantasanremo/fantasanremo.service';
import { RisparmioCasaService } from './_services/risparmio-casa.service';

console.log( process.env.AWS_RISPARMIOCASA_ACCOUNT_KEY);
@Module({
    imports: [
        HttpModule,
        QueueModule.register({
            streams: streams as NatsStreamConfig[],
            servers: process.env.NATS_SERVERS
        }),
        DynamooseModule.forRoot({
            aws: {
                region: process.env.AWS_RISPARMIOCASA_REGION
            }
        }),
        DynamooseModule.forFeature([{
            name: 'FantasanremoCustomer',
            schema: FantasanremoCustomerSchema,
            options: {
              tableName: 'fantasanremoCustomer',
            }
        }])
    ],
    controllers: [
        AppController,
        ApiBridgeController,
        FantasanremoController
    ],
    providers: [
        AppService,
        FantasanremoService,
        RisparmioCasaService
    ],
})
export class AppModule { }
