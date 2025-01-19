import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { FantasanremoCustomer, FantasanremoCustomerKey } from './fantasanremo-customer';
import { RisparmioCasaService } from '../_services/risparmio-casa.service';
import { from, map, of, switchMap, throwError, timeout } from 'rxjs';
import { ApiErrorMessage } from '../../../../../libs/common/src/lib/api-error-message';

@Injectable()
export class FantasanremoService {
    readonly DEFAULT_COUNTRY = 'it';
    readonly RISPARMIO_CASA_TIMEOUT_MS = 10000;
    private readonly logger = new Logger(FantasanremoService.name);
    
    constructor(
        @InjectModel('FantasanremoCustomer') private fantasanremoCustomerModel: Model<FantasanremoCustomer, FantasanremoCustomerKey>,
        private risparmioCasaService: RisparmioCasaService
    ) {}
    
    insertCustomer(customer: FantasanremoCustomer) {
        return of(customer).pipe(
            switchMap(customer => this.risparmioCasaService.verify(customer.cardNumber, this.DEFAULT_COUNTRY).pipe(
                map(cardVerified => {
                    if (!cardVerified)
                        throw new Error(ApiErrorMessage.CARD_VERIFICATION_FAILED);

                    return customer;
                }),
                timeout({
                    each: this.RISPARMIO_CASA_TIMEOUT_MS,
                    with: () => {
                        this.logger.error(`Timeout (${this.RISPARMIO_CASA_TIMEOUT_MS}ms) exceeded requesting to Risparmio Casa API server!`);
                        return throwError(() => new Error(ApiErrorMessage.GENERIC));
                    }
                })
            )),
            switchMap(customer => from(this.fantasanremoCustomerModel.get({ id: customer.id })).pipe(
                map(item => {
                    if (item)
                        throw new Error(ApiErrorMessage.FANTASANREMO_ALREADY_REGISTERED_CUSTOMER);

                    return customer;
                })
            )),
            switchMap(customer => from(this.fantasanremoCustomerModel.create(customer).then(item => item.toJSON() as FantasanremoCustomer)))
        );
    }
}