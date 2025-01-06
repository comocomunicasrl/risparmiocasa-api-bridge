/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(6);
const api_bridge_controller_1 = __webpack_require__(7);
const axios_1 = __webpack_require__(8);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule
        ],
        controllers: [
            app_controller_1.AppController,
            api_bridge_controller_1.ApiBridgeController
        ],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(6);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiBridgeController = void 0;
const tslib_1 = __webpack_require__(4);
const axios_1 = __webpack_require__(8);
const common_1 = __webpack_require__(1);
const rxjs_1 = __webpack_require__(9);
const dayjs_1 = tslib_1.__importDefault(__webpack_require__(10));
let ApiBridgeController = class ApiBridgeController {
    constructor(httpService) {
        this.httpService = httpService;
        this.baseUrls = new Map([
            ['ch', 'http://risparmiocasa.tecnologica.info/tloyaltyws_svizzera'],
            ['mt', 'http://risparmiocasa.tecnologica.info/tloyaltyws_malta'],
            ['it', 'http://risparmiocasa.tecnologica.info/tloyaltyws']
        ]);
    }
    hello() {
        return 'Hello from api-bridge! 👋';
    }
    createCard(reqBody) {
        return this.createEmptyCard(reqBody.details.registrationCountry).pipe((0, rxjs_1.switchMap)(cardNumber => {
            if (!cardNumber)
                throw new common_1.BadRequestException();
            return this.addDataToCard(reqBody.details, cardNumber, false).pipe((0, rxjs_1.map)(res => {
                if (!res)
                    throw new common_1.BadRequestException();
                return { cardNumber };
            }));
        }));
    }
    applyDiscount(reqBody) {
        const { store, cardNumber, points, ean } = reqBody;
        return this.applyDiscountToCard(store, cardNumber, points, ean).pipe((0, rxjs_1.map)(result => {
            if (!result)
                throw new common_1.BadRequestException();
            return true;
        }));
    }
    verify(reqBody) {
        const { cardNumber, registrationCountry } = reqBody;
        if (!cardNumber)
            throw new common_1.BadRequestException();
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
        return this.httpService.post(url, xml, { headers }).pipe((0, rxjs_1.map)(result => {
            const isValid = !JSON.stringify(result.data).includes("20000101;20000101;0;0");
            if (!isValid)
                throw new common_1.NotFoundException();
            return true;
        }));
    }
    updateCard(reqBody) {
        const { cardNumber, details, updateFromStore } = reqBody;
        if (!updateFromStore)
            details.preferredStoreCode = '000WEB';
        return this.addDataToCard(details, cardNumber, updateFromStore).pipe((0, rxjs_1.map)(result => {
            if (!result)
                throw new common_1.BadRequestException();
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
        return this.httpService.post(url, xml, { headers }).pipe((0, rxjs_1.map)(result => (result.status === 200) ? result.data.match(regExp)[0] : null));
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
        xml += `<Data>${(0, dayjs_1.default)().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `<Autorizzazione>`;
        xml += `<Numero>5</Numero>`;
        xml += `<Consenso>${details.marketing}</Consenso>`;
        xml += `<Data>${(0, dayjs_1.default)().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `<Autorizzazione>`;
        xml += `<Numero>6</Numero>`;
        xml += `<Consenso>${details.marketing}</Consenso>`;
        xml += `<Data>${(0, dayjs_1.default)().format("YYYY-MM-DD")}</Data>`;
        xml += `</Autorizzazione>`;
        xml += `<Autorizzazione>`;
        xml += `<Numero>8</Numero>`;
        xml += `<Consenso>${details.statistics}</Consenso>`;
        xml += `<Data>${(0, dayjs_1.default)().format("YYYY-MM-DD")}</Data>`;
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
        return this.httpService.post(url, xml, { headers }).pipe((0, rxjs_1.map)(result => {
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
        xml += `<DataOraScontrino>${(0, dayjs_1.default)().format("YYYY-MM-DD")}</DataOraScontrino>`;
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
        return this.httpService.post(url, xml, { headers }).pipe((0, rxjs_1.map)(result => {
            const status = result.data.match(regExp)[0];
            return parseInt(status) >= 0;
        }));
    }
};
exports.ApiBridgeController = ApiBridgeController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ApiBridgeController.prototype, "hello", null);
tslib_1.__decorate([
    (0, common_1.Post)('create-card'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], ApiBridgeController.prototype, "createCard", null);
tslib_1.__decorate([
    (0, common_1.Post)('apply-discount'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], ApiBridgeController.prototype, "applyDiscount", null);
tslib_1.__decorate([
    (0, common_1.Post)('verify'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], ApiBridgeController.prototype, "verify", null);
tslib_1.__decorate([
    (0, common_1.Post)('update-card'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], ApiBridgeController.prototype, "updateCard", null);
exports.ApiBridgeController = ApiBridgeController = tslib_1.__decorate([
    (0, common_1.Controller)('api-bridge'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], ApiBridgeController);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("dayjs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map