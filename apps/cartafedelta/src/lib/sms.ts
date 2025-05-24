import axios from 'axios';
import {TranslationLanguageCode} from "../core/models/enums/Translation";

function getBaseUrl(api: string) {
    return `${process.env.SKEBBY_BASE_URL}/${api}`;
}

interface ISession {
    user_key: string;
    Session_key: string;
}

async function getAuthHeader(): Promise<ISession> {
    const url = getBaseUrl('login');
    console.log('Skebby: call get ', url);
    const response = await axios.get(url, {
        auth: { username: process.env.SKEBBY_EMAIL, password: process.env.SKEBBY_PASSWORD },
    });
    if (response.status !== 200) {
        console.error('Skebby: failed to login', response);
        return;
    }

    const sessionData = response.data as string;
    const auth = sessionData?.split(';');
    if (auth?.length !== 2) {
        console.error('Skebby: failed to parse login data', sessionData);
        return;
    }

    return { user_key: auth[0], Session_key: auth[1] };
}

async function request2FA({
    recipient, languageCode
}: {
    recipient: string, languageCode: TranslationLanguageCode
}): Promise<boolean> {
    try {
        const data = {
            recipient,
            senderName: process.env.SKEBBY_SENDER_NAME, // optional, but failing if not provided
            expiry: 60,
            messageBody: languageCode === TranslationLanguageCode.It
                ? '%PIN% è il tuo codice di conferma per Risparmio Casa'
                : '%PIN% is your confirmation code for Risparmio Casa',
        };

        const header = await getAuthHeader();
        const url = getBaseUrl('2fa/request');
        console.log('Skebby: call post ', url, header);
        const response = await axios.post(url, data, {
            headers: { ...header },
        });

        if (response.status !== 200) {
            console.error('Skebby: non 200 response code for 2FA request', response);
            return false;
        }
    } catch (e) {
        console.error('Skebby: exception sending 2FA request', e);
        return false;
    }

    return true;
}

async function verify2FA({ recipient, pin }: { recipient: string; pin: string }) {
    try {
        const data = {
            recipient,
            pin,
        };

        const header = await getAuthHeader();
        const url = getBaseUrl('2fa/verify');
        console.log('Skebby: call post ', url, header);
        const response = await axios.post(url, data, {
            headers: { ...header },
        });

        if (response.status !== 200) {
            console.error('Skebby: non 200 response code for 2FA verify', response);
            return false;
        }

        if (response.data.status != 'OK')
            return false;
    } catch (e) {
        console.error('Skebby: exception sending 2FA verify', e);
        return false;
    }

    return true;
}

export default {
    request2FA,
    verify2FA,
};
