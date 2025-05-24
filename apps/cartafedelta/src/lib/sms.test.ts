import sms from './sms';

process.env.SKEBBY_BASE_URL = 'https://api.skebby.it/API/v1.0/REST';
process.env.SKEBBY_EMAIL = 'davide.abagnale@comoco.it';
process.env.SKEBBY_PASSWORD = 'add here';
process.env.SKEBBY_SENDER_NAME = 'Risparmiocasa';

const recipient = '+37124950806';

describe('sms tests', () => {
    it('should request', async () => {
        await sms.request2FA({ recipient });
    });

    it('should verify', async () => {
        await sms.verify2FA({ recipient, pin: '21935' });
    });
});
