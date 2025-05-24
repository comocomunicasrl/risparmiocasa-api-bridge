import dynamoDb from '../../lib/dynamoDb';
import { IPersonDetails } from '../models/IPersonDetails';
import { IRisparmioCasaRepository } from './interfaces/IRisparmioCasaRepository';
import { IPreferredStore } from '../models/IPreferredStore';
import { IDiscountCode } from '../models/IDiscountCode';
import { CountryCode } from './../models/enums/Country';

export class RisparmioCasaRepository implements IRisparmioCasaRepository {
    private _tableName: string = dynamoDb.tableName;

    public async createCard(details: IPersonDetails, verificationCode: string): Promise<void> {
        await dynamoDb.put({
            TableName: this._tableName,
            Item: {
                ...details,
                PK: 'CARD',
                SK: `EMAIL#${details.email}`,
                code: verificationCode,
                isVerified: false,
                createdOn: new Date().toISOString(),
            },
        });
        return;
    }

    public async updateCard(details: IPersonDetails): Promise<void> {
        await dynamoDb.put({
            TableName: this._tableName,
            Item: {
                ...details,
                PK: 'CARD',
                SK: `EMAIL#${details.email}`,
            },
        });

        return;
    }

    public async updateDiscountCodeAssignmentDate(email: string, date: Date): Promise<boolean> {
        return dynamoDb.update({
            TableName: this._tableName,
            Key: { PK: 'CARD', SK: `EMAIL#${email}` },
            UpdateExpression: 'set discountCodeAssignmentDate = :val',
            ExpressionAttributeValues: {
                ':val': date.toISOString(),
            }
        }).then(() => true).catch(() => false);
    }

    public async addCardUpdated(details: IPersonDetails): Promise<void> {
        await dynamoDb.put({
            TableName: this._tableName,
            Item: {
                ...details,
                PK: 'CARD#UPDATED',
                SK: `CARD#${details.cardNumber}`,
                isVerified: false,
                createdOn: new Date().toISOString(),
            },
        });
        return;
    }

    public async cardUpdateAlreadyExists(cardNumber: string): Promise<boolean> {
        const dbEntry = await dynamoDb.get({
            TableName: this._tableName,
            Key: { PK: 'CARD#UPDATED', SK: `CARD#${cardNumber}` },
        });

        return !!dbEntry.Item;
    }

    public async registerCard(email: string, cardNumber: string): Promise<void> {
        await dynamoDb.update({
            TableName: this._tableName,
            Key: { PK: 'CARD', SK: `EMAIL#${email}` },
            UpdateExpression: 'set cardNumber = :val',
            ExpressionAttributeValues: {
                ':val': cardNumber,
            },
        });
        return;
    }

    public async cardAlreadyExists(email: string): Promise<boolean> {
        const dbEntry = await dynamoDb.get({
            TableName: this._tableName,
            Key: { PK: 'CARD', SK: `EMAIL#${email}` },
        });

        return !!(dbEntry.Item && dbEntry.Item.cardNumber);
    }

    public async verifyEmail(email: string, verificationCode: string): Promise<boolean> {
        const dbEntry = await dynamoDb.get({
            TableName: this._tableName,
            Key: { PK: 'CARD', SK: `EMAIL#${email}` },
        });

        console.log(dbEntry);

        if (dbEntry.Item && dbEntry.Item.code === verificationCode) {
            await dynamoDb.update({
                TableName: this._tableName,
                Key: { PK: 'CARD', SK: `EMAIL#${email}` },
                UpdateExpression: 'set isVerified = :val',
                ExpressionAttributeValues: {
                    ':val': true,
                },
            });

            return true;
        }

        return false;
    }

    public async isVerifiedEmail(email: string): Promise<boolean> {
        const dbEntry = await dynamoDb.get({
            TableName: this._tableName,
            Key: { PK: 'CARD', SK: `EMAIL#${email}` },
        });

        return dbEntry.Item.isVerified;
    }

    public async getPreferredStores(storeCountryCode?: CountryCode): Promise<IPreferredStore[]> {
        let stores = null;

        if (storeCountryCode === CountryCode.Switzerland) {
            stores = await dynamoDb.query({
                TableName: this._tableName,
                KeyConditionExpression: 'PK = :val',
                ExpressionAttributeValues: {
                    ':val': 'STORE#CH',
                },
            });
        } else if (storeCountryCode === CountryCode.Malta) {
            stores = await dynamoDb.query({
                TableName: this._tableName,
                KeyConditionExpression: 'PK = :val',
                ExpressionAttributeValues: {
                    ':val': 'STORE#MT',
                },
            });
        } else {
            stores = await dynamoDb.query({
                TableName: this._tableName,
                KeyConditionExpression: 'PK = :val',
                ExpressionAttributeValues: {
                    ':val': 'STORE',
                },
            });
        }

        if (!stores) return [];

        return stores.Items.map((store) => {
            return { label: store.SK, id: store.code };
        });
    }

    public async getDiscountCode(code: string): Promise<IDiscountCode | null> {
        const dbEntry = await dynamoDb.get({
            TableName: this._tableName,
            Key: { PK: 'DISCOUNT', SK: code.toLowerCase() },
        });

        if (!dbEntry.Item) {
            return null;
        }

        return dbEntry.Item as IDiscountCode;
    }

    public async getCardNumberByEmail(email: string): Promise<string | null> {
        const dbEntry = await dynamoDb.get({
            TableName: this._tableName,
            Key: { PK: 'CARD', SK: `EMAIL#${email}` },
        });

        if (!dbEntry.Item) {
            return null;
        }

        return dbEntry.Item.cardNumber;
    }

    public async setVerificationCode(email: string, verificationCode: string): Promise<void> {
        await dynamoDb.put({
            TableName: this._tableName,
            Item: {
                PK: 'CARD',
                SK: `EMAIL#${email}`,
                code: verificationCode,
                isVerified: false,
            },
        });

        return;
    }
}
