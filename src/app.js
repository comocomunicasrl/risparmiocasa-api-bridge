const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const axios = require("axios");
const dayjs = require("dayjs");

app.post("/create-card", async (req, res) => {
    const { details } = req.body;

    const cardNumber = await createEmptyCard(details.registrationCountry);
    if (!cardNumber) {
        return res.status(400).end();
    }

    try {
        const result = await addDataToCard(details, cardNumber);
        return result ? res.status(200).json({ cardNumber }) : res.status(400).end();
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.post("/apply-discount", async (req, res) => {
    const { store, cardNumber, points, ean } = req.body;
    const result = await applyDiscount(store, cardNumber, points, ean);
    return result ? res.status(200).end() : res.status(400).end();
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

function getBaseUrl(countryCode) {
    switch (countryCode) {
        case 'ch':
            return 'http://risparmiocasa.tecnologica.info/tloyaltyws_svizzera';
        case 'mt':
            return 'http://risparmiocasa.tecnologica.info/tloyaltyws_malta';

        default:
            return 'http://risparmiocasa.tecnologica.info/tloyaltyws';
    }
}

async function createEmptyCard(registrationCountry) {
    console.log('Creating an empty card...');
    let xml = '<?xml version="1.0" encoding="utf-8"?>';
    xml +=
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    xml += "<soap:Body>";
    xml += '<NuovaTessera xmlns = "http://TLoyaltyWS/">';
    xml += "<CodCedi>025</CodCedi>";
    xml += `<Username>${process.env.RISPARMIOCASA_API_USERNAME}</Username>`;
    xml += `<Password>${process.env.RISPARMIOCASA_API_PASSWORD}</Password>`;
    xml += "</NuovaTessera>";
    xml += "</soap:Body>";
    xml += "</soap:Envelope>";
    console.log(xml);
    const baseUrl = getBaseUrl(registrationCountry);
    const url = baseUrl + "/Cards.asmx";
    const headers = {
        SOAPAction: "http://TLoyaltyWS/NuovaTessera",
        "Content-Type": "text/xml; charset=UTF-8",
        "Content-Length": xml.length,
    };

    const regExp = /(?<=<NuovaTesseraResult>).*(?=<\/NuovaTesseraResult>)/;
    try {
        const result = await axios.post(url, xml, { headers });

        console.log(result);
        console.log(result.data.match(regExp)[0]);
        return result.status === 200 ? result.data.match(regExp)[0] : null;
    } catch (err) {
        console.error(err);
    }
}

async function addDataToCard(details, cardNumber) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml +=
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    xml += "<soap:Body>";
    xml += '<InserimentoModificaAnagrafica xmlns="http://TLoyaltyWS/">';
    xml += "<CodCedi>025</CodCedi>";
    xml += `<Username>${process.env.RISPARMIOCASA_API_USERNAME}</Username>`;
    xml += `<Password>${process.env.RISPARMIOCASA_API_PASSWORD}</Password>`;
    xml += `<CodTessera>${cardNumber}</CodTessera>`;
    xml += "<StatoTessera>A</StatoTessera>";
    xml += "<Circuito>1</Circuito>";
    xml += `<CodECRPV>${details.preferredStoreCode}</CodECRPV>`;
    xml += `<Cognome>${details.surname}</Cognome>`;
    xml += `<Nome>${details.name}</Nome>`;
    xml += `<DataNascita>${details.dateOfBirth.year}-${details.dateOfBirth.month}-${details.dateOfBirth.day}</DataNascita>`;
    xml += `<Sesso>${details.gender === 1 ? "M" : "F"}</Sesso>`;
    xml += `<Indirizzo>${details.address}</Indirizzo>`;
    xml += `<NumCivico>${details.streetNumber}</NumCivico>`;
    xml += `<Citta>${details.city}</Citta>`;
    xml += `<CAP>${details.postalCode}</CAP>`;
    xml += `<PrefissoTelefono>+39</PrefissoTelefono>`;
    xml += `<NumTelefono>${details.phoneNumberSecondary}</NumTelefono>`;
    xml += `<PrefissoCellulare>+39</PrefissoCellulare>`;
    xml += `<NumCellulare>${details.phoneNumber}</NumCellulare>`;
    xml += `<Email>${details.email}</Email>`;
    xml += `<FrequenzaAcquisto>1</FrequenzaAcquisto>`;
    xml += `<CategoriaTessera>1</CategoriaTessera>`;
    xml += `<CategoriaTessera2></CategoriaTessera2>`;
    xml += `<CategoriaTessera3></CategoriaTessera3>`;
    xml += `<CategoriaTessera4></CategoriaTessera4>`;
    xml += `<CategoriaTessera5></CategoriaTessera5>`;
    xml += `<Professione>1</Professione>`;
    xml += `<Titolo>1</Titolo>`;
    xml += `<StatoCivile>1</StatoCivile>`;
    xml += `<TitoloStudio>1</TitoloStudio>`;
    xml += `<Hobby></Hobby>`;
    xml += `<TipoFamiliare1>1</TipoFamiliare1>`;
    xml += `<DataNascitaFamiliare1>1990-01-01</DataNascitaFamiliare1>`;
    xml += `<TipoFamiliare2>1</TipoFamiliare2>`;
    xml += `<DataNascitaFamiliare2>1990-01-01</DataNascitaFamiliare2>`;
    xml += `<TipoFamiliare3>1</TipoFamiliare3>`;
    xml += `<DataNascitaFamiliare3>1990-01-01</DataNascitaFamiliare3>`;
    xml += `<TipoFamiliare4>1</TipoFamiliare4>`;
    xml += `<DataNascitaFamiliare4>1990-01-01</DataNascitaFamiliare4>`;
    xml += `<TipoFamiliare5>1</TipoFamiliare5>`;
    xml += `<DataNascitaFamiliare5>1990-01-01</DataNascitaFamiliare5>`;
    xml += `<ListaAutorizzazioni>`;
    xml += `<Autorizzazione>`;
    xml += `<Numero>11</Numero>`;
    xml += `<Consenso>true</Consenso>`;
    xml += `<Data>${dayjs().format("YYYY-MM-DD")}</Data>`;
    xml += `</Autorizzazione>`;
    xml += `<Autorizzazione>`;
    xml += `<Numero>5</Numero>`;
    xml += `<Consenso>${details.marketing}</Consenso>`;
    xml += `<Data>${dayjs().format("YYYY-MM-DD")}</Data>`;
    xml += `</Autorizzazione>`;
    xml += `<Autorizzazione>`;
    xml += `<Numero>6</Numero>`;
    xml += `<Consenso>${details.marketing}</Consenso>`;
    xml += `<Data>${dayjs().format("YYYY-MM-DD")}</Data>`;
    xml += `</Autorizzazione>`;
    xml += `<Autorizzazione>`;
    xml += `<Numero>8</Numero>`;
    xml += `<Consenso>${details.statistics}</Consenso>`;
    xml += `<Data>${dayjs().format("YYYY-MM-DD")}</Data>`;
    xml += `</Autorizzazione>`;
    xml += `</ListaAutorizzazioni>`;
    xml += `<PVPreferito></PVPreferito>`;
    if (details.registrationCountry === 'it') {
        xml += `<Paese>Italia</Paese>`;
    } else {
        xml += `<Paese></Paese>`;
    }
    xml += `<CodiceFiscale></CodiceFiscale>`;
    xml += `<FlagCancellato>false</FlagCancellato>`;

    if (details.registrationCountry === 'ch' && details?.countryOfResidence === 'ch') {
        xml += `<Nazione>CHE</Nazione>`;
    } else if (details.registrationCountry === 'mt') {
        xml += `<Nazione>MLT</Nazione>`;
    }

    xml += `</InserimentoModificaAnagrafica>`;
    xml += "</soap:Body>";
    xml += "</soap:Envelope>";

    const baseUrl = getBaseUrl(details.registrationCountry);
    const url = baseUrl + '/Cards.asmx';
    const headers = {
        SOAPAction: "http://TLoyaltyWS/InserimentoModificaAnagrafica",
        "Content-Type": "text/xml; charset=utf-8"
    };

    const regExp =
        /(?<=<InserimentoModificaAnagraficaResult>).*(?=<\/InserimentoModificaAnagraficaResult>)/;
    const result = await axios.post(url, xml, { headers });
    console.log(result);
    const status = result.data.match(regExp)[0];
    return parseInt(status) >= 0;
}

async function applyDiscount(store, cardNumber, points, ean) {
    let xml = '<?xml version="1.0" encoding="utf-8"?>';
    xml +=
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    xml += "<soap:Body>";
    xml += '<SaldoMovimentiPunti xmlns="http://webservices.loy4casse.it/">';
    xml += `<CodECRPV>${store}</CodECRPV>`;
    xml += `<CodiceTessera>${cardNumber}</CodiceTessera>`;
    xml += `<NumeroCassa>99</NumeroCassa>`;
    xml += `<NumeroScontrino>1</NumeroScontrino>`;
    xml += `<DataOraScontrino>${dayjs().format("YYYY-MM-DD")}</DataOraScontrino>`;
    xml += `<TotaleScontrino>0</TotaleScontrino>`;
    xml += `<ListaInfoRaccolta>`;
    xml += `<InfoRaccolta>`;
    xml += `<CodiceRaccolta>2</CodiceRaccolta>`;
    xml += `<PuntiRaccolta>${points}</PuntiRaccolta>`;
    xml += `<CodiceVenditaPremio>${ean}</CodiceVenditaPremio>`;
    xml += `<QuantitaPremi>1</QuantitaPremi>`;
    xml += `<FlagPrenotazione>0</FlagPrenotazione>`;
    xml += `</InfoRaccolta>`;
    xml += `</ListaInfoRaccolta>`;
    xml += `</SaldoMovimentiPunti>`;
    xml += "</soap:Body>";
    xml += "</soap:Envelope>";

    const url =
        "http://risparmiocasa.tecnologica.info/Loy4CasseWS/Loy4CasseService.asmx";
    const headers = {
        SOAPAction: "http://webservices.loy4casse.it/SaldoMovimentiPunti",
        "Content-Type": "text/xml; charset=UTF-8",
        "Content-Length": xml.length,
    };

    const regExp =
        /(?<=<SaldoMovimentiPuntiResult>).*(?=<\/SaldoMovimentiPuntiResult>)/;
    const result = await axios.post(url, xml, { headers });

    console.log(result);
    const status = result.data.match(regExp)[0];
    return parseInt(status) >= 0;
}

app.post("/verify", (req, res) => {
    const { cardNumber, registrationCountry } = req.body;

    if (!cardNumber) {
        res.status(400);
        res.end();

        return;
    }

    let xml = '<?xml version="1.0" encoding="utf-8"?>';
    xml +=
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    xml += "<soap:Body>";
    xml += '<SaldoTessera2 xmlns="http://TLWSSaldi/">';
    xml += `<CodTessera>${cardNumber}</CodTessera>`;
    xml += "</SaldoTessera2>";
    xml += "</soap:Body>";
    xml += "</soap:Envelope>";

    let url = "http://risparmiocasa.tecnologica.info/TLWSSaldi/Saldi.asmx";

    if (registrationCountry === 'ch') {
        url = "http://risparmiocasa.tecnologica.info/TLWSSaldi_Svizzera/Saldi.asmx";
    } else if (registrationCountry === 'mt') {
        url = "http://risparmiocasa.tecnologica.info/TLWSSaldi_Malta/Saldi.asmx"
    }

    const headers = {
        SOAPAction: "http://TLWSSaldi/SaldoTessera2",
        "Content-Type": "text/xml; charset=UTF-8",
        "Content-Length": xml.length,
    };

    axios.post(url, xml, { headers }).then((result) => {
        const isValid = !JSON.stringify(result.data).includes(
            "20000101;20000101;0;0"
        );

        isValid ? res.status(200) : res.status(404);
        res.end();
    });
});

app.post('/update-card', async (req, res) => {
    const { cardNumber, details } = req.body;
    details.preferredStoreCode = '000WEB';

    const result = await addDataToCard(details, cardNumber);
    console.log(result);

    return result ? res.status(200).json({ cardNumber }) : res.status(400).end();
})

app.listen(3000);
