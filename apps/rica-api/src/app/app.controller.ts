import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { QueueService } from './queue/queue.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private queueService: QueueService
    ) { }

    @Get()
    getData() {
        return this.appService.getData();
    }

    @Get('enqueue')
    enqueue(@Query('data') data: string) {
        Array.from(Array(10).keys()).forEach(x => {
            this.queueService.client.enqueueData('rica_test', 'getReq', `${x} - ${data}`);
        });
        return true;
    }
}
