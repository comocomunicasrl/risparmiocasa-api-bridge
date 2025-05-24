import { IBirthDate } from '../core/models/IBirthDate';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import { IPreferredStore } from '../core/models/IPreferredStore';
import { enDictionary } from '../dictionaries/en';
import { itDictionary } from '../dictionaries/it';
import { CountryOfResidence } from '../core/models/enums/Country';

export function generateAuthCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let authCode = '';
    for (let i = 0; i <= 6; i++) {
        authCode += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return authCode;
}

export function isValidEmail(email: string): RegExpMatchArray {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

export function isValidBirthDate(birthday: IBirthDate): boolean {
    const regexp = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (regexp.test(`${birthday.year}-${birthday.month}-${birthday.day}`)) {
        return true;
    }
    return false;
}

export function isValidDiscount(code: string): Promise<boolean> {
    return axios
        .get('/api/discount', { params: { code } })
        .then(() => {
            return true;
        })
        .catch(() => {
            return false;
        });
}

export function generateBarcode(cardNumber: string): any {
    const { DOMImplementation, XMLSerializer } = require('xmldom');
    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument(
        'http://www.w3.org/1999/xhtml',
        'html',
        null
    );
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, cardNumber, {
        format: 'EAN13',
        xmlDocument: document,
        flat: true,
    });

    return xmlSerializer.serializeToString(svgNode);
}

export function serializePreferredStores(stores: IPreferredStore[]) {
    return stores.map((store) => {
        return {
            ...store,
            id: store.id ?? null,
        };
    });
}

export function getGender(gender: number) {
    if (gender === 1) {
        return 'Maschio';
    } else if (gender === 2) {
        return 'Femmina';
    }

    return 'Non specificato';
}

function accessNestedProperty(obj: unknown, propertyString: string) {
    return propertyString.split('.').reduce((acc, curr) => {
        return acc ? acc[curr] : undefined;
    }, obj as any);
}

export function translate(languageCode: string, code: string) {
    if (languageCode === 'en') {
        return accessNestedProperty(enDictionary, code) as string;
    }

    return accessNestedProperty(itDictionary, code) as string;
}

export function getCountryName(code: string) {
    switch(code) {
        case 'it':
            return CountryOfResidence.Italy;
        case 'ch':
            return CountryOfResidence.Switzerland;
        case 'mt':
            return CountryOfResidence.Malta;
    }

    return null;
}


export function getCurrentYear() {
    return new Date().getFullYear()
}