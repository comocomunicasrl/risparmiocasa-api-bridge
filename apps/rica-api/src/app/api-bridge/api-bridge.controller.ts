import { HttpService } from '@nestjs/axios';
import { BadRequestException, Body, Controller, Get, HttpCode, Logger, Post } from '@nestjs/common';
import { map, switchMap } from 'rxjs';
import { Country } from '../common/country';
import { RisparmioCasaService } from '../_services/risparmio-casa.service';

@Controller('api-bridge')
export class ApiBridgeController {
    baseUrls = new Map<Country, string>([
        ['ch', 'http://risparmiocasa.tecnologica.info/tloyaltyws_svizzera'],
        ['mt', 'http://risparmiocasa.tecnologica.info/tloyaltyws_malta'],
        ['it', 'http://risparmiocasa.tecnologica.info/tloyaltyws']
    ]);
    private readonly logger = new Logger(ApiBridgeController.name);

    constructor(
        private readonly httpService: HttpService,
        private risparmioCasaService: RisparmioCasaService
    ){  }

    @Get() 
    hello() {
        return 'Hello from api-bridge! 👋';
    }

    @Post('create-card')
    @HttpCode(200)
    createCard(@Body() reqBody: { details: { [key: string]: any } & { registrationCountry: Country } }) {
        return this.risparmioCasaService.createEmptyCard(reqBody.details.registrationCountry).pipe(
            switchMap(cardNumber => {
                if (!cardNumber)
                    throw new BadRequestException();

                return this.risparmioCasaService.addDataToCard(reqBody.details, cardNumber, false).pipe(
                    map(res => {
                        if (!res)
                            throw new BadRequestException();
                        return { cardNumber };
                    })
                );
            })
        );
    }

    @Post('apply-discount')
    @HttpCode(200)
    applyDiscount(@Body() reqBody: { store: string, cardNumber: string, points: string, ean: string }) {
        const { store, cardNumber, points, ean } = reqBody;
        return this.risparmioCasaService.applyDiscountToCard(store, cardNumber, points, ean).pipe(
            map(result => {
                if (!result)
                    throw new BadRequestException();
                return true;
            })
        );
    }

    @Post('verify')
    @HttpCode(200)
    verify(@Body() reqBody) {
        const { cardNumber, registrationCountry } = reqBody;

        if (!cardNumber)
            throw new BadRequestException();

        this.risparmioCasaService.verify(cardNumber, registrationCountry);
    }

    @Post('update-card')
    @HttpCode(200)
    updateCard(@Body() reqBody) {
        const { cardNumber, details, updateFromStore } = reqBody;
    
        if (!updateFromStore)
            details.preferredStoreCode = '000WEB';

        return this.risparmioCasaService.addDataToCard(details, cardNumber, updateFromStore).pipe(
            map(result => {
                if (!result)
                    throw new BadRequestException();

                return { cardNumber };
            })
        );
    }
}