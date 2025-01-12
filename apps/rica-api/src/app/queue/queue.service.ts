import { Inject, Injectable, Logger } from '@nestjs/common';
import { NatsClientService } from '@yepmind/nats-rx-client';
import { ConfigOptions } from './_models/config-options';

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);
    
    private nc: NatsClientService;

    constructor(
        @Inject('CONFIG_OPTIONS') config: ConfigOptions
    ) {
        if (config.servers)
            this.nc = new NatsClientService(config);
    }
    
    get client(): NatsClientService {
        return this.nc;
    }
}