import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LetDirective } from '@ngrx/component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FantasanremoPageState, FantasanremoPageStore } from './fantasanremo-page.store';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { UserInfo } from './_models/user-info';

type BirthDateGroup = {
    date: FormControl<number | null>,
    month: FormControl<number | null>,
    year: FormControl<number | null>
}

type DataGroup = {
    cardNumber: FormControl<string | null>,
    firstname: FormControl<string | null>,
    lastname: FormControl<string | null>,
    birthdate: FormGroup<BirthDateGroup>,
    taxId: FormControl<string | null>,
    email: FormControl<string | null>,
    rulesAcceptance: FormControl<boolean | null>,
    privacyPolicyAcceptance: FormControl<boolean | null>
}

@Component({
    selector: 'ricaweb-fantasanremo-page',
    templateUrl: 'fantasanremo-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        FantasanremoPageStore
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LetDirective,
        LoadingSpinnerComponent
    ]
})
export class FantasanremoPageComponent implements OnInit, OnDestroy {
    readonly CARD_NUMBER_MAX_LENGTH = 13;
    readonly NAME_MAX_LENGTH = 50;
    readonly TAX_ID_MAX_LENGTH = 16;
    readonly EMAIL_MAX_LENGTH = 100;
    readonly ERROR_MESSAGES = new Map<string, { error: string, message: string }[]>([
        ['default', [
            { error: 'required', message: 'Dato obbligatorio' },
            { error: 'minlength', message: 'Formato errato' },
            { error: 'pattern', message: 'Formato errato' }
        ]]
    ]);
    readonly MIN_AGE_CUSTOMER = 16;
    readonly CURRENT_YEAR = new Date().getFullYear();
    readonly MONTH_DAYS = new Map<number, ((year: number) => number)|(() => number)>([
        [1, () => 31],
        [2, (year: number) => (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? 29 : 28],
        [3, () => 31],
        [4, () => 30],
        [5, () => 31],
        [6, () => 30],
        [7, () => 31],
        [8, () => 31],
        [9, () => 30],
        [10, () => 31],
        [11, () => 30],
        [12, () => 31]
    ]);
    dateList = Array.from(Array(31).keys()).map(i => i + 1);
    monthList = Array.from(Array(12).keys()).map(i => i + 1);
    yearList = Array.from(Array(94).keys()).map((i, idx) => this.CURRENT_YEAR - this.MIN_AGE_CUSTOMER - idx);
    drawerVisible = false;

    dataGroup?: FormGroup<DataGroup>;
    state$?: Observable<FantasanremoPageState>;
    _destroyed$ = new Subject<boolean>();

    constructor(
        private store: FantasanremoPageStore
    ) {
        this.state$ = this.store.state$;
    }

    ngOnInit() {
        this.initForm();
    }

    ngOnDestroy(): void {
        this._destroyed$.next(true);
    }

    initForm() {
        this.dataGroup = new FormGroup<DataGroup>({
            cardNumber: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.minLength(this.CARD_NUMBER_MAX_LENGTH), Validators.maxLength(this.CARD_NUMBER_MAX_LENGTH)]),
            firstname: new FormControl(null, [Validators.required, Validators.maxLength(this.NAME_MAX_LENGTH)]),
            lastname: new FormControl(null, [Validators.required, Validators.maxLength(this.NAME_MAX_LENGTH)]),
            birthdate: new FormGroup<BirthDateGroup>({
                date: new FormControl(null, [Validators.required]),
                month: new FormControl(null, [Validators.required]),
                year: new FormControl(null, [Validators.required])
            }, []),
            taxId: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z]{3}[a-zA-Z]{3}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/), Validators.maxLength(this.TAX_ID_MAX_LENGTH)]),
            email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(this.EMAIL_MAX_LENGTH)]),
            rulesAcceptance: new FormControl(null, [Validators.requiredTrue]),
            privacyPolicyAcceptance: new FormControl(null, [Validators.requiredTrue])
        });

        this.dataGroup.controls.birthdate.valueChanges.pipe(
            takeUntil(this._destroyed$)
        ).subscribe({
            next: birthDateValues => {
                const { date, month, year } = birthDateValues;
                if (date && month && year && this.MONTH_DAYS.has(month)) {
                    if (this.dateInvalid(date, month, year)) {
                        this.dataGroup?.controls.birthdate.controls.date.patchValue(null);
                        this.dataGroup?.controls.birthdate.updateValueAndValidity();
                    }
                }
            }
        });
    }

    getErrorMsg<T>(control: AbstractControl<T>, error?: string) {
        if (control.valid)
            return null;

        const controlName = Object.keys(control.parent?.controls ?? []).find(k => control.parent?.get(k) === control) ?? '';
        if (!this.ERROR_MESSAGES.has(controlName))
            return this.ERROR_MESSAGES.get('default')?.find(em => error ? (em.error === error) : control.hasError(em.error))?.message;

        return this.ERROR_MESSAGES.get(controlName)?.find(em => error ? (em.error === error) : control.hasError(em.error))?.message;
    }

    dateInvalid(date: number, month?: number|null, year?: number|null) {
        const monthDaysFn = (month && this.MONTH_DAYS.has(month)) ? this.MONTH_DAYS.get(month) : null;
        
        if (!monthDaysFn || !year)
            return false;
        return date > monthDaysFn(year);
    }

    sendInfo() {
        this.store.patchState({ formSubmitted: true });
        const userInfo = new UserInfo({
            ...this.dataGroup?.getRawValue(),
            taxId: this.dataGroup?.value.taxId.toUpperCase(),
            birthdate: new Date(Date.UTC(this.dataGroup?.value.birthdate?.year as number, (this.dataGroup?.value.birthdate?.month as number) - 1, this.dataGroup?.value.birthdate?.date as number, 0, 0, 0, 0))
        });
        if (this.dataGroup?.valid) {
            const userInfo = new UserInfo({
                ...this.dataGroup.getRawValue(),
                birthdate: new Date(Date.UTC(this.dataGroup.value.birthdate?.year as number, (this.dataGroup.value.birthdate?.month as number) - 1, this.dataGroup.value.birthdate?.date as number, 0, 0, 0, 0))
            });
            this.store.sendUserInfo({ userInfo: new UserInfo({
                ...this.dataGroup.getRawValue(),
                birthdate: new Date(Date.UTC(this.dataGroup.value.birthdate?.year as number, (this.dataGroup.value.birthdate?.month as number) - 1, this.dataGroup.value.birthdate?.date as number, 0, 0, 0, 0))
            })});
        }
    }

    onDrawerClick() {

    }
}