import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, map, of, switchMap } from 'rxjs';

@Injectable()
export class SmsService {
    readonly API_SERVER_URL = 'https://api.message-delivery.it/rest/v1';
    private readonly logger = new Logger(SmsService.name);
    
    constructor(
        private httpService: HttpService
    ) {}

    send(recipient: string, text: string) {
        return this.authenticate().pipe(
            switchMap(authToken => {
                const headers = {
                    Authentication: `Bearer ${authToken}`,
                    'Content-Type': 'application/json; charset=UTF-8'
                };
                return this.httpService.post(`${this.API_SERVER_URL}/sms/batch`, {
                    global: {
                        route: 'GW1',
                        text,
                        campaignId: 'OTP'
                    },
                    message: [
                        { to: recipient }
                    ]
                }, { headers }).pipe(
                    map(resp => {
                        const data = resp.data;
                        if (!data?.success || data.error)
                            throw new Error(`Error during sendind message to Ediscom. [${JSON.stringify(data?.error ?? '{}')}]`);

                        return true;
                    })
                );
            }),
            catchError(error => {
                this.logger.debug(error);
                throw new Error(error.message);
            })
        );
    }

    private authenticate() {
        return this.httpService.post(`${this.API_SERVER_URL}/auth/login`, {
            username: process.env.EDISCOM_SMS_USERNAME,
            password: process.env.EDISCOM_SMS_PASSWORD
        }).pipe(
            map(resp => {
                const data = resp.data;
                if (!data?.success)
                    throw new Error(`Error during authentication to Ediscom. [${data?.error?.status} - ${data?.error?.message}]`);

                return data?.token;
            })
        );
    }
    
}
