/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Body, Controller, InternalServerErrorException, Logger, Post, RawBodyRequest } from '@nestjs/common';
import { ApiUserInfo } from 'common/_models/api-user-info';
import { FantasanremoService } from './fantasanremo.service';
import { ApiErrorMessage } from 'common/api-error-message';
import { catchError } from 'rxjs/operators';

@Controller('fantasanremo')
export class FantasanremoController {
    private readonly logger = new Logger(FantasanremoController.name);
    
    constructor(
        private fantasanremoService: FantasanremoService
    ){}

    @Post('userInfo')
    userInfo(@Body() userInfo: RawBodyRequest<ApiUserInfo>) {
        const submissionDate = new Date();
        return this.fantasanremoService.insertCustomer({
            id: userInfo.cardNumber,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            birthDate: userInfo.birthdate as any,
            cardNumber: userInfo.cardNumber,
            taxId: userInfo.taxId,
            email: userInfo.email,
            submissionDate: submissionDate.toLocaleString('it-IT', {timeZone: 'Europe/Rome'}),
            timestamp: submissionDate.toISOString()
        }).pipe(
            catchError((err: Error) => {
                switch(err.message) {
                    case ApiErrorMessage.CARD_VERIFICATION_FAILED:
                        throw new BadRequestException({ code: ApiErrorMessage.CARD_VERIFICATION_FAILED });
                    case ApiErrorMessage.FANTASANREMO_ALREADY_REGISTERED_CUSTOMER:
                        throw new BadRequestException({ code: ApiErrorMessage.FANTASANREMO_ALREADY_REGISTERED_CUSTOMER });
                    default:
                        this.logger.error(err);
                        throw new InternalServerErrorException({ code: ApiErrorMessage.GENERIC });
                }
            })
        );
    }
}