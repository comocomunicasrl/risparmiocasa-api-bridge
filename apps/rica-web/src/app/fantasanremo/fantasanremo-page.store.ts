import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";

export interface FantasanremoPageState {
    formSubmitted?: boolean;
    loading?: boolean;
    error?: boolean;
    errorText?: string;
}

@Injectable()
export class FantasanremoPageStore extends ComponentStore<FantasanremoPageState> {
    constructor() {
        super({});
    }
}