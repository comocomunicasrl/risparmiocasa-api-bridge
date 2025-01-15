import { Body, Controller, Logger, Post, RawBodyRequest } from '@nestjs/common';
import { ApiUserInfo } from 'common/_models/api-user-info';
import { FantasanremoService } from './fantasanremo.service';

@Controller('fantasanremo')
export class FantasanremoController {
    private readonly logger = new Logger(FantasanremoController.name);
    
    constructor(
        private fantasanremoService: FantasanremoService
    ){}

    @Post('userInfo')
    userInfo(@Body() userInfo: RawBodyRequest<ApiUserInfo>) {
        this.logger.log(userInfo);
        return this.fantasanremoService.insertCustomer({
            id: userInfo.taxId,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            birthDate: userInfo.birthdate as any,
            cardNumber: userInfo.cardNumber,
            email: userInfo.email
        }).then(() => true);
    }
}