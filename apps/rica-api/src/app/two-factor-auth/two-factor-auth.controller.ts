import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import { SmsService } from '../_services/sms.service';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { TwoFactorAuth, TwoFactorAuthKey } from './two-factor-auth';
import { catchError, from, map, of, switchMap } from 'rxjs';

@Controller('two-factor-auth')
export class TwoFactorAuthController {
    private readonly logger = new Logger(TwoFactorAuthController.name);
    private readonly otpMessageMap: Record<'it'|'en', string> = {
        it: '{OTP} è il tuo codice di conferma per Risparmio Casa',
        en: '{OTP} is your confirmation code for Risparmio Casa'
    };
    
    constructor(
        private smsService: SmsService,
        @InjectModel('TwoFactorAuth') private twoFactorAuthModel: Model<TwoFactorAuth, TwoFactorAuthKey>
    ){}

    @Post('sendOTP')
    sendOTP(@Body() payload?: { brand?: string, recipient: string, languageCode: string }) {
        if (!payload)
            throw new BadRequestException('Missing payload!');

        const OTP = Math.floor(Math.random() * 999999).toString().padStart(6, '0');

        return of({ id: `${payload.brand ?? 'rica'}-${payload.recipient}-${OTP}`, OTP }).pipe(
            switchMap(({ id, OTP }) => {
                return from(this.twoFactorAuthModel.create({ id, recipient: payload.recipient, OTP, creationDate: Date.now().toString() })).pipe(
                    switchMap(() => this.smsService.send(payload.brand ?? 'rica', payload.recipient, (this.otpMessageMap[payload.languageCode] ?? this.otpMessageMap['it']).replace('{OTP}', OTP)))
                );
            })
        );
    }

    @Post('verifyOTP')
    verifyOTP(@Body() payload?: { brand: string, recipient: string, OTP: string }) {
        if (!payload)
            throw new BadRequestException('Missing payload!');

        return from(this.twoFactorAuthModel.get({ id: `${payload.brand ?? 'rica'}-${payload.recipient}-${payload.OTP}` })).pipe(
            switchMap(result => {
                if (!result || (result.OTP != payload.OTP) || ((Date.now() - Number.parseInt(result.creationDate)) > 3600000)) {
                    this.logger.debug(`Invalid OTP!.`);
                    return of(false);
                }

                return from(this.twoFactorAuthModel.delete({ id: result.id })).pipe(
                    map(() => true)
                );
            }),
            catchError(error => {
                this.logger.debug(`Error during OTP verification! [${error}]`);
                return of(false);
            })
        );
    }
}