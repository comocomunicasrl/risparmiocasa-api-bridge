import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiUserInfo } from 'common/_models/api-user-info';

@Controller('fantasanremo')
export class FantasanremoController {
    private readonly logger = new Logger(FantasanremoController.name);
    
    constructor(){}

    @Post('userInfo')
    userInfo(@Body() userInfo: ApiUserInfo) {
        this.logger.log(userInfo);
        return true;
    }
}