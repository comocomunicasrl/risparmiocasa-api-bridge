import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, switchMap, tap } from 'rxjs';

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
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                };
                return this.httpService.post(`${this.API_SERVER_URL}/sms/batch`, {
                    global: {
                        route: 'GW1',
                        from: 'RispCasa',
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
            catchError((error: AxiosError) => {
                this.logger.error(error.response?.data ?? error.message);
                throw 'An error happened!';
            })
        );
    }

    private authenticate() {
        const url = `${this.API_SERVER_URL}/auth/login`;
        const headers = {
            'Content-Type': 'application/json'
        };
        this.logger.debug(url);
        return this.httpService.get('https://api.ipify.org').pipe(
            tap(resp => this.logger.debug(`my ip: ${resp.data}`)),
            switchMap(() => this.httpService.post(url, {
                username: process.env.EDISCOM_SMS_USERNAME,
                password: process.env.EDISCOM_SMS_PASSWORD
            }, { headers })),
            map(resp => {
                this.logger.debug(resp.data);
                const responsData = resp.data;
                if (!responsData?.success)
                    throw new Error(`Error during authentication to Ediscom. [${responsData?.error?.status} - ${responsData?.error?.message}]`);

                return responsData.data.token;
            }),
            catchError((error: AxiosError) => {
                this.logger.error(error.response?.data ?? error.message);
                throw 'An error happened!';
            })
        );
    }
}
