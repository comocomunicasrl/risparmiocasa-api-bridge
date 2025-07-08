import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, map, switchMap } from 'rxjs';

@Injectable()
export class SmsService {
    readonly API_SERVER_URL = 'https://api.message-delivery.it/rest/v1';
    private readonly logger = new Logger(SmsService.name);
    
    constructor(
        private httpService: HttpService
    ) {}

    send(brand: string, recipient: string, text: string) {
        return this.authenticate().pipe(
            switchMap(authToken => {
                const headers = {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                };
                const body = {
                    global: {
                        route: 'GW2',
                        from: (brand === 'rica') ? process.env.EDISCOM_SMS_SENDER : process.env.EDISCOM_UNIPRICE_SMS_SENDER,
                        coding: '0',
                        text,
                        campaignId: 'OTP'
                    },
                    message: [
                        { to: recipient.replace('+', '') }
                    ]
                };

                return this.httpService.post(`${this.API_SERVER_URL}/sms/batch`, body, { headers }).pipe(
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

        return this.httpService.post(url, {
            username: process.env.EDISCOM_SMS_USERNAME,
            password: process.env.EDISCOM_SMS_PASSWORD
        }, { headers }).pipe(
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
