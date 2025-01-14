import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable, switchMap, tap } from "rxjs";
import { UserInfo } from "./_models/user-info";
import { FantasanremoService } from "./fantasanremo.service";
import { tapResponse } from "@ngrx/operators";

export interface FantasanremoPageState {
    formSubmitted?: boolean;
    loading?: boolean;
    error?: boolean;
    errorText?: string;
}

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
                    (res) => this.patchState({ loading: false }),
                    err => this.patchState({ loading: false, error: true })
                )
            ))
        );
    });
}