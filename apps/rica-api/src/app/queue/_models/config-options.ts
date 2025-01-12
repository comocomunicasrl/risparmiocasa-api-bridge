import { NatsStreamConfig } from "@yepmind/nats-rx-client";

export interface ConfigOptions {
    streams: NatsStreamConfig[],
    servers: string
}