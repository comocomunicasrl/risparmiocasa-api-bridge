import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { FantasanremoCustomer, FantasanremoCustomerKey } from './fantasanremo-customer';

@Injectable()
export class FantasanremoService {
    constructor(
        @InjectModel('FantasanremoCustomer') private fantasanremoCustomerModel: Model<FantasanremoCustomer, FantasanremoCustomerKey>
    ) {}
    
    insertCustomer(customer: FantasanremoCustomer) {
        return this.fantasanremoCustomerModel.create(customer);
    }
}