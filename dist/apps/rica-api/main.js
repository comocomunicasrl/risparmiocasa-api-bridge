/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/

// NAMESPACE OBJECT: ./src/app/queue/_models/config-options.ts
var config_options_namespaceObject = {};
__webpack_require__.r(config_options_namespaceObject);

;// external "@nestjs/common"
const common_namespaceObject = require("@nestjs/common");
;// external "@nestjs/core"
const core_namespaceObject = require("@nestjs/core");
;// external "tslib"
const external_tslib_namespaceObject = require("tslib");
;// ./src/app/app.service.ts


let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
AppService = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Injectable)()
], AppService);


;// external "@yepmind/nats-rx-client"
const nats_rx_client_namespaceObject = require("@yepmind/nats-rx-client");
;// ./src/app/queue/_models/config-options.ts


;// ./src/app/queue/queue.service.ts
var QueueService_1;
var _a;




let QueueService = QueueService_1 = class QueueService {
    constructor(config) {
        this.logger = new common_namespaceObject.Logger(QueueService_1.name);
        if (config.servers)
            this.nc = new nats_rx_client_namespaceObject.NatsClientService(config);
    }
    get client() {
        return this.nc;
    }
};
QueueService = QueueService_1 = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Injectable)(),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Inject)('CONFIG_OPTIONS')),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (_a = typeof config_options_namespaceObject.ConfigOptions !== "undefined" && config_options_namespaceObject.ConfigOptions) === "function" ? _a : Object])
], QueueService);


;// ./src/app/app.controller.ts
var app_controller_a, _b;




let AppController = class AppController {
    constructor(appService, queueService) {
        this.appService = appService;
        this.queueService = queueService;
    }
    getData() {
        return this.appService.getData();
    }
    enqueue(data) {
        Array.from(Array(10).keys()).forEach(x => {
            this.queueService.client.enqueueData('rica_test', 'getReq', `${x} - ${data}`);
        });
        return true;
    }
};
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Get)(),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", []),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], AppController.prototype, "getData", null);
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Get)('enqueue'),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Query)('data')),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [String]),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], AppController.prototype, "enqueue", null);
AppController = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Controller)(),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (app_controller_a = typeof AppService !== "undefined" && AppService) === "function" ? app_controller_a : Object, typeof (_b = typeof QueueService !== "undefined" && QueueService) === "function" ? _b : Object])
], AppController);


;// external "@nestjs/axios"
const axios_namespaceObject = require("@nestjs/axios");
;// external "rxjs"
const external_rxjs_namespaceObject = require("rxjs");
;// external "dayjs"
const external_dayjs_namespaceObject = require("dayjs");
var external_dayjs_default = /*#__PURE__*/__webpack_require__.n(external_dayjs_namespaceObject);
;// ./src/app/api-bridge/api-bridge.controller.ts
var ApiBridgeController_1;
var api_bridge_controller_a;





let ApiBridgeController = ApiBridgeController_1 = class ApiBridgeController {
    constructor(httpService) {
        this.httpService = httpService;
        this.baseUrls = new Map([
            ['ch', 'http://risparmiocasa.tecnologica.info/tloyaltyws_svizzera'],
            ['mt', 'http://risparmiocasa.tecnologica.info/tloyaltyws_malta'],
            ['it', 'http://risparmiocasa.tecnologica.info/tloyaltyws']
        ]);
        this.logger = new common_namespaceObject.Logger(ApiBridgeController_1.name);
    }
    hello() {
        return 'Hello from api-bridge! 👋';
    }
    createCard(reqBody) {
        return this.createEmptyCard(reqBody.details.registrationCountry).pipe((0,external_rxjs_namespaceObject.switchMap)(cardNumber => {
            if (!cardNumber)
                throw new common_namespaceObject.BadRequestException();
            return this.addDataToCard(reqBody.details, cardNumber, false).pipe((0,external_rxjs_namespaceObject.map)(res => {
                if (!res)
                    throw new common_namespaceObject.BadRequestException();
                return { cardNumber };
            }));
        }));
    }
    applyDiscount(reqBody) {
        const { store, cardNumber, points, ean } = reqBody;
        return this.applyDiscountToCard(store, cardNumber, points, ean).pipe((0,external_rxjs_namespaceObject.map)(result => {
            if (!result)
                throw new common_namespaceObject.BadRequestException();
            return true;
        }));
    }
    verify(reqBody) {
        const { cardNumber, registrationCountry } = reqBody;
        if (!cardNumber)
            throw new common_namespaceObject.BadRequestException();
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
        }
        else if (registrationCountry === 'mt') {
            url = "http://risparmiocasa.tecnologica.info/TLWSSaldi_Malta/Saldi.asmx";
        }
        const headers = {
            SOAPAction: "http://TLWSSaldi/SaldoTessera2",
            "Content-Type": "text/xml; charset=UTF-8"
        };
        return this.httpService.post(url, xml, { headers }).pipe((0,external_rxjs_namespaceObject.map)(result => {
            const isValid = !JSON.stringify(result.data).includes("20000101;20000101;0;0");
            if (!isValid)
                throw new common_namespaceObject.NotFoundException();
            return true;
        }));
    }
    updateCard(reqBody) {
        const { cardNumber, details, updateFromStore } = reqBody;
        if (!updateFromStore)
            details.preferredStoreCode = '000WEB';
        return this.addDataToCard(details, cardNumber, updateFromStore).pipe((0,external_rxjs_namespaceObject.map)(result => {
            if (!result)
                throw new common_namespaceObject.BadRequestException();
            return { cardNumber };
        }));
    }
    createEmptyCard(registrationCountry) {
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
        const baseUrl = this.baseUrls.get(registrationCountry);
        const url = baseUrl + "/Cards.asmx";
        const headers = {
            SOAPAction: "http://TLoyaltyWS/NuovaTessera",
            "Content-Type": "text/xml; charset=UTF-8"
        };
        const regExp = /(?<=<NuovaTesseraResult>).*(?=<\/NuovaTesseraResult>)/;
        return this.httpService.post(url, xml, { headers }).pipe((0,external_rxjs_namespaceObject.tap)(result => this.logger.log(result.data.match(regExp)[0])), (0,external_rxjs_namespaceObject.map)(result => (result.status === 200) ? result.data.match(regExp)[0] : null));
    }
    addDataToCard(details, cardNumber, updateFromStore) {
        let xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml +=
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
        xml += "<soap:Body>";
        xml += '<InserimentoModificaAnagrafica xmlns="http://TLoyaltyWS/">';
        xml += `<CodCedi>${updateFromStore ? process.env.RISPARMIOCASA_API_COD_CEDI_STORE : process.env.RISPARMIOCASA_API_COD_CEDI}</CodCedi>`;
        xml += `<Username>${updateFromStore ? process.env.RISPARMIOCASA_API_USERNAME_STORE : process.env.RISPARMIOCASA_API_USERNAME}</Username>`;
        xml += `<Password>${updateFromStore ? process.env.RISPARMIOCASA_API_PASSWORD_STORE : process.env.RISPARMIOCASA_API_PASSWORD}</Password>`;
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
        xml += `<PrefissoTelefono></PrefissoTelefono>`;
        xml += `<NumTelefono>${details.phoneNumberSecondary}</NumTelefono>`;
        xml += `<PrefissoCellulare></PrefissoCellulare>`;
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
        xml += `<Data>${external_dayjs_default()().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `<Autorizzazione>`;
        xml += `<Numero>5</Numero>`;
        xml += `<Consenso>${details.marketing}</Consenso>`;
        xml += `<Data>${external_dayjs_default()().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `<Autorizzazione>`;
        xml += `<Numero>6</Numero>`;
        xml += `<Consenso>${details.marketing}</Consenso>`;
        xml += `<Data>${external_dayjs_default()().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `<Autorizzazione>`;
        xml += `<Numero>8</Numero>`;
        xml += `<Consenso>${details.statistics}</Consenso>`;
        xml += `<Data>${external_dayjs_default()().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `</ListaAutorizzazioni>`;
        xml += `<PVPreferito></PVPreferito>`;
        if (details.registrationCountry === 'it') {
            xml += `<Paese>Italia</Paese>`;
        }
        else {
            xml += `<Paese></Paese>`;
        }
        xml += `<CodiceFiscale></CodiceFiscale>`;
        xml += `<FlagCancellato>false</FlagCancellato>`;
        if (details.registrationCountry === 'ch' && details?.countryOfResidence === 'ch') {
            xml += `<Nazione>CHE</Nazione>`;
        }
        else if (details.registrationCountry === 'mt') {
            xml += `<Nazione>MLT</Nazione>`;
        }
        xml += `</InserimentoModificaAnagrafica>`;
        xml += "</soap:Body>";
        xml += "</soap:Envelope>";
        const baseUrl = this.baseUrls.get(details.registrationCountry);
        const url = baseUrl + '/Cards.asmx';
        const headers = {
            SOAPAction: "http://TLoyaltyWS/InserimentoModificaAnagrafica",
            "Content-Type": "text/xml; charset=UTF-8"
        };
        const regExp = /(?<=<InserimentoModificaAnagraficaResult>).*(?=<\/InserimentoModificaAnagraficaResult>)/;
        return this.httpService.post(url, xml, { headers }).pipe((0,external_rxjs_namespaceObject.map)(result => {
            const status = result.data.match(regExp)[0];
            return parseInt(status) >= 0;
        }));
    }
    applyDiscountToCard(store, cardNumber, points, ean) {
        let xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml +=
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
        xml += "<soap:Body>";
        xml += '<SaldoMovimentiPunti xmlns="http://webservices.loy4casse.it/">';
        xml += `<CodECRPV>${store}</CodECRPV>`;
        xml += `<CodiceTessera>${cardNumber}</CodiceTessera>`;
        xml += `<NumeroCassa>99</NumeroCassa>`;
        xml += `<NumeroScontrino>1</NumeroScontrino>`;
        xml += `<DataOraScontrino>${external_dayjs_default()().format("YYYY-MM-DD")}</DataOraScontrino>`;
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
        const url = "http://risparmiocasa.tecnologica.info/Loy4CasseWS/Loy4CasseService.asmx";
        const headers = {
            SOAPAction: "http://webservices.loy4casse.it/SaldoMovimentiPunti",
            "Content-Type": "text/xml; charset=UTF-8"
        };
        const regExp = /(?<=<SaldoMovimentiPuntiResult>).*(?=<\/SaldoMovimentiPuntiResult>)/;
        return this.httpService.post(url, xml, { headers }).pipe((0,external_rxjs_namespaceObject.map)(result => {
            const status = result.data.match(regExp)[0];
            return parseInt(status) >= 0;
        }));
    }
};
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Get)(),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", []),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], ApiBridgeController.prototype, "hello", null);
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Post)('create-card'),
    (0,common_namespaceObject.HttpCode)(200),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Body)()),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [Object]),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], ApiBridgeController.prototype, "createCard", null);
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Post)('apply-discount'),
    (0,common_namespaceObject.HttpCode)(200),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Body)()),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [Object]),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], ApiBridgeController.prototype, "applyDiscount", null);
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Post)('verify'),
    (0,common_namespaceObject.HttpCode)(200),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Body)()),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [Object]),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], ApiBridgeController.prototype, "verify", null);
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Post)('update-card'),
    (0,common_namespaceObject.HttpCode)(200),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Body)()),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [Object]),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], ApiBridgeController.prototype, "updateCard", null);
ApiBridgeController = ApiBridgeController_1 = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Controller)('api-bridge'),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (api_bridge_controller_a = typeof axios_namespaceObject.HttpService !== "undefined" && axios_namespaceObject.HttpService) === "function" ? api_bridge_controller_a : Object])
], ApiBridgeController);


;// ./src/app/queue/queue-consumer.service.ts
var QueueConsumerService_1;
var queue_consumer_service_a;



let QueueConsumerService = QueueConsumerService_1 = class QueueConsumerService {
    constructor(queueService) {
        this.queueService = queueService;
        this.logger = new common_namespaceObject.Logger(QueueConsumerService_1.name);
        this.queueService.client.dequeueData('rica_test', 'getReq').subscribe({
            next: value => this.logger.log(`[${new Date()}]deQueue: ${value}`)
        });
    }
};
QueueConsumerService = QueueConsumerService_1 = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Injectable)(),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (queue_consumer_service_a = typeof QueueService !== "undefined" && QueueService) === "function" ? queue_consumer_service_a : Object])
], QueueConsumerService);


;// ./src/app/queue/queue.module.ts
var QueueModule_1;




let QueueModule = QueueModule_1 = class QueueModule {
    static register(options) {
        return {
            module: QueueModule_1,
            providers: [
                {
                    provide: 'CONFIG_OPTIONS',
                    useValue: options
                },
                QueueService,
                QueueConsumerService
            ],
            exports: [
                QueueService
            ],
        };
    }
};
QueueModule = QueueModule_1 = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Module)({
        controllers: [],
        providers: [],
    })
], QueueModule);

;

;// ./src/app/queue/queue-streams-config.json
const queue_streams_config_namespaceObject = /*#__PURE__*/JSON.parse('[{"name":"rica_test","consumerDelayMs":5000}]');
;// external "nestjs-dynamoose"
const external_nestjs_dynamoose_namespaceObject = require("nestjs-dynamoose");
;// ./src/app/fantasanremo/fantasanremo.service.ts
var fantasanremo_service_a;



let FantasanremoService = class FantasanremoService {
    constructor(fantasanremoCustomerModel) {
        this.fantasanremoCustomerModel = fantasanremoCustomerModel;
    }
    insertCustomer(customer) {
        return this.fantasanremoCustomerModel.create(customer);
    }
};
FantasanremoService = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Injectable)(),
    (0,external_tslib_namespaceObject.__param)(0, (0,external_nestjs_dynamoose_namespaceObject.InjectModel)('FantasanremoCustomer')),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (fantasanremo_service_a = typeof external_nestjs_dynamoose_namespaceObject.Model !== "undefined" && external_nestjs_dynamoose_namespaceObject.Model) === "function" ? fantasanremo_service_a : Object])
], FantasanremoService);


;// ./src/app/fantasanremo/fantasanremo.controller.ts
var FantasanremoController_1;
var fantasanremo_controller_a, fantasanremo_controller_b;



let FantasanremoController = FantasanremoController_1 = class FantasanremoController {
    constructor(fantasanremoService) {
        this.fantasanremoService = fantasanremoService;
        this.logger = new common_namespaceObject.Logger(FantasanremoController_1.name);
    }
    userInfo(userInfo) {
        this.logger.log(userInfo);
        return this.fantasanremoService.insertCustomer({
            id: userInfo.taxId,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            birthDate: userInfo.birthdate,
            cardNumber: userInfo.cardNumber,
            email: userInfo.email
        }).then(() => true);
    }
};
(0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Post)('userInfo'),
    (0,external_tslib_namespaceObject.__param)(0, (0,common_namespaceObject.Body)()),
    (0,external_tslib_namespaceObject.__metadata)("design:type", Function),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (fantasanremo_controller_b = typeof common_namespaceObject.RawBodyRequest !== "undefined" && common_namespaceObject.RawBodyRequest) === "function" ? fantasanremo_controller_b : Object]),
    (0,external_tslib_namespaceObject.__metadata)("design:returntype", void 0)
], FantasanremoController.prototype, "userInfo", null);
FantasanremoController = FantasanremoController_1 = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Controller)('fantasanremo'),
    (0,external_tslib_namespaceObject.__metadata)("design:paramtypes", [typeof (fantasanremo_controller_a = typeof FantasanremoService !== "undefined" && FantasanremoService) === "function" ? fantasanremo_controller_a : Object])
], FantasanremoController);


;// external "dynamoose"
const external_dynamoose_namespaceObject = require("dynamoose");
;// ./src/app/fantasanremo/fantasanremo-cutomer.schema.ts

const FantasanremoCustomerSchema = new external_dynamoose_namespaceObject.Schema({
    id: {
        type: String,
        hashKey: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    birthDate: {
        type: String
    },
    cardNumber: {
        type: String
    },
    email: {
        type: String
    }
});

;// ./src/app/app.module.ts












console.log(process.env.AWS_RISPARMIOCASA_ACCOUNT_KEY);
let AppModule = class AppModule {
};
AppModule = (0,external_tslib_namespaceObject.__decorate)([
    (0,common_namespaceObject.Module)({
        imports: [
            axios_namespaceObject.HttpModule,
            QueueModule.register({
                streams: queue_streams_config_namespaceObject,
                servers: process.env.NATS_SERVERS
            }),
            external_nestjs_dynamoose_namespaceObject.DynamooseModule.forRoot({
                aws: {
                    region: process.env.AWS_RISPARMIOCASA_REGION
                }
            }),
            external_nestjs_dynamoose_namespaceObject.DynamooseModule.forFeature([{
                    name: 'FantasanremoCustomer',
                    schema: FantasanremoCustomerSchema,
                    options: {
                        tableName: 'fantasanremoCustomer',
                    }
                }])
        ],
        controllers: [
            AppController,
            ApiBridgeController,
            FantasanremoController
        ],
        providers: [
            AppService,
            FantasanremoService
        ],
    })
], AppModule);


;// ./src/main.ts
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */



async function bootstrap() {
    const app = await core_namespaceObject.NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_namespaceObject.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

/******/ })()
;
//# sourceMappingURL=main.js.map