import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';

@Injectable()
export class QueueConsumerService {
    private readonly logger = new Logger(QueueConsumerService.name);
    
    constructor(
        private queueService: QueueService
    ) {
        this.queueService.client.dequeueData('rica_test', 'getReq').subscribe({
            next: value => this.logger.log(`[${new Date()}]deQueue: ${value}`)
        });
    }
    
}