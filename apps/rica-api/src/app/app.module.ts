import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiBridgeController } from './api-bridge/api-bridge.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule
    ],
    controllers: [
        AppController,
        ApiBridgeController
    ],
    providers: [AppService],
})
export class AppModule { }
