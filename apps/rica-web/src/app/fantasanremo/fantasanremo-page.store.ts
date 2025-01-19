import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable, switchMap, tap } from "rxjs";
import { UserInfo } from "./_models/user-info";
import { FantasanremoService } from "./fantasanremo.service";
import { tapResponse } from "@ngrx/operators";
import { ApiErrorMessage } from 'common/api-error-message';
import { ApiErrorResponse } from "common/_models/api-error-response";

export interface FantasanremoPageState {
    customerRegistered?: boolean;
    formSubmitted?: boolean;
    loading?: boolean;
    error?: boolean;
    errorText?: string;
}

const ERROR_MESSAGE_MAP = new Map<string, string>([
    [ ApiErrorMessage.CARD_VERIFICATION_FAILED, 'Numero carta fedeltà non valido!' ],
    [ ApiErrorMessage.FANTASANREMO_ALREADY_REGISTERED_CUSTOMER, 'Cliente già registrato!' ],
    [ ApiErrorMessage.GENERIC, 'Errore del server!' ]
]);

@Injectable()
export class FantasanremoPageStore extends ComponentStore<FantasanremoPageState> {
    

    constructor(
        private fantasanremoService: FantasanremoService
    ) {
        super({});
    }

    readonly sendUserInfo = this.effect((params$: Observable<{ userInfo: UserInfo }>) => {
        return params$.pipe(
            tap(() => this.patchState({ error: undefined, errorText: undefined, loading: true })),
            switchMap(({ userInfo }) => this.fantasanremoService.sendUserInfo(userInfo).pipe(
                tapResponse(
                    (res) => this.patchState({ loading: false, customerRegistered: true }),
                    (err: ApiErrorResponse) => this.patchState({ loading: false, error: true, errorText: this.getErrorText(err.code) })
                )
            ))
        );
    });

    private getErrorText(errorMessage?: ApiErrorMessage) {
        return ERROR_MESSAGE_MAP.get(errorMessage ?? ApiErrorMessage.GENERIC) ?? ERROR_MESSAGE_MAP.get(ApiErrorMessage.GENERIC);
    }
}