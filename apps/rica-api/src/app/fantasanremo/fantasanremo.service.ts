import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { FantasanremoCustomer, FantasanremoCustomerKey } from './fantasanremo-customer';
import { RisparmioCasaService } from '../_services/risparmio-casa.service';
import { catchError, from, map, of, switchMap, tap, throwError, timeout } from 'rxjs';
import { ApiErrorMessage } from '../../../../../libs/common/src/lib/api-error-message';
import { QueueService } from '../queue/queue.service';
import { Client } from 'node-mailjet';
import { FantasanremoFailedEmail, FantasanremoFailedEmailKey } from './fantasanremo-failed-email';
import { RicaCard, RicaCardKey } from './rica-card';
import excludedCardNumbers from './excluded_card.json';

@Injectable()
export class FantasanremoService {
    private readonly DEFAULT_COUNTRY = 'it';
    private readonly RISPARMIO_CASA_TIMEOUT_MS = 10000;
    private readonly RICA_QUEUE_STREAM = 'rica';
    private readonly CUSTOMER_SUBSCRIBED_EVENT = 'fantasanremo_customer_subscribed';
    private readonly logger = new Logger(FantasanremoService.name);
    private readonly TEMPLATE_ID_COUPON = 6651319;
    private readonly TEMPLATE_ID_NO_COUPON = 6660998;

    constructor(
        @InjectModel('FantasanremoCustomer') private fantasanremoCustomerModel: Model<FantasanremoCustomer, FantasanremoCustomerKey>,
        @InjectModel('RicaCard') private ricaCardModel: Model<RicaCard, RicaCardKey>,
        @InjectModel('FantasanremoFailedEmail') private fantasanremoFailedEmailModel: Model<FantasanremoFailedEmail, FantasanremoFailedEmailKey>,
        private risparmioCasaService: RisparmioCasaService,
        private queueService: QueueService
    ) {
        this.queueService.client.dequeueData(this.RICA_QUEUE_STREAM, this.CUSTOMER_SUBSCRIBED_EVENT).pipe(
            switchMap(customer => this.sendEmailToCustomer(customer as FantasanremoCustomer))
        ).subscribe();
    }

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
                }),
                catchError(error => {
                    if (error instanceof NotFoundException)
                        throw new Error(ApiErrorMessage.CARD_VERIFICATION_FAILED);

                    this.logger.error(error);
                    throw error;
                })
            )),
            switchMap(customer => from(this.fantasanremoCustomerModel.get({ id: customer.id })).pipe(
                map(item => {
                    if (item)
                        throw new Error(ApiErrorMessage.FANTASANREMO_ALREADY_REGISTERED_CUSTOMER);

                    return customer;
                })
            )),
            switchMap(customer => from(this.fantasanremoCustomerModel.create(customer).then(item => item.toJSON() as FantasanremoCustomer))),
            tap(customer => this.queueService.client.enqueueData(this.RICA_QUEUE_STREAM, this.CUSTOMER_SUBSCRIBED_EVENT, customer))
        );
    }

    private sendEmailToCustomer(customer: FantasanremoCustomer) {
        const mailjet = new Client({
            apiKey: process.env.MAILJET_API_KEY,
            apiSecret: process.env.MAILJET_API_SECRET
        });

        return from(mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'noreply@cartafedelta.online',
                        Name: 'Risparmio Casa'
                    },
                    To: [{ Email: customer.email }],
                    TemplateID: excludedCardNumbers?.find(i => i === customer.cardNumber ) ? this.TEMPLATE_ID_NO_COUPON : this.TEMPLATE_ID_COUPON,
                    TemplateLanguage: true
                }
            ]
        })).pipe(
            catchError(err => {
                this.logger.error(err);
                return from(this.fantasanremoFailedEmailModel.create({ id: customer.id, cardNumber: customer.cardNumber, email: customer.email, timestamp: new Date().toISOString() })).pipe(
                    catchError(err => {
                        this.logger.error(`Failed registering EMAIL SEND ERROR for card number ${customer.cardNumber}`);
                        this.logger.error(err);
                        throw err;
                    })
                );
            })
        );
    }
}
