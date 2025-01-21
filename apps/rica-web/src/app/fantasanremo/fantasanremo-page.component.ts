import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LetDirective } from '@ngrx/component';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { FantasanremoPageState, FantasanremoPageStore } from './fantasanremo-page.store';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { UserInfo } from './_models/user-info';
import { Title } from '@angular/platform-browser';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';

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
        LoadingSpinnerComponent,
        CookiePolicyComponent
    ]
})
export class FantasanremoPageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('dataForm') dataFormEl: ElementRef;
    @ViewChild('cardNumberInput') cardNumberEl: ElementRef;
    readonly CARD_NUMBER_MAX_LENGTH = 13;
    readonly NAME_MAX_LENGTH = 50;
    readonly TAX_ID_MAX_LENGTH = 16;
    readonly EMAIL_MAX_LENGTH = 100;
    readonly ERROR_MESSAGES = new Map<string, { error: string, message: string }[]>([
        ['default', [
            { error: 'required', message: 'Dato obbligatorio' },
            { error: 'minlength', message: 'Formato errato' },
            { error: 'pattern', message: 'Formato errato' },
            { error: 'email', message: 'Formato email errato' }
        ]]
    ]);
    readonly MIN_AGE_CUSTOMER = 18;
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
    yearList = Array.from(Array(100).keys()).map((i, idx) => this.CURRENT_YEAR - this.MIN_AGE_CUSTOMER - idx);

    dataGroup?: FormGroup<DataGroup>;
    state$?: Observable<FantasanremoPageState>;
    _destroyed$ = new Subject<boolean>();

    constructor(
        private store: FantasanremoPageStore,
        private titleService: Title,
        @Inject(PLATFORM_ID) private platformId,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.state$ = this.store.state$;
    }

    ngOnInit() {
        this.titleService.setTitle('Risparmio Casa x Fantasanremo | Partecipa al concorso!');
        this.addCookieScriptTag();
        this.initForm();

        this.store.state$.pipe(
            filter(state => state.customerRegistered),
            takeUntil(this._destroyed$)
        ).subscribe({
            next: () => setTimeout(() => this.scrollToElement(this.dataFormEl.nativeElement), 250)
        });
    }

    ngAfterViewInit(): void {
        if(isPlatformBrowser(this.platformId)) {
            import('cleave.js').then(m => {
                const Cleave = m.default;
                new Cleave(this.cardNumberEl.nativeElement, {
                    blocks: [this.CARD_NUMBER_MAX_LENGTH],
                    numericOnly: true
                })
            });
        }
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
        
        if (this.dataGroup?.valid) {
            this.store.sendUserInfo({ userInfo: new UserInfo({
                ...this.dataGroup.getRawValue(),
                taxId: this.dataGroup?.value.taxId.toUpperCase(),
                birthdate: new Date(Date.UTC(this.dataGroup.value.birthdate?.year as number, (this.dataGroup.value.birthdate?.month as number) - 1, this.dataGroup.value.birthdate?.date as number, 0, 0, 0, 0))
            })});
        }
    }

    scrollToElement(element: HTMLElement) {
        this.store.patchState({ drawerVisible: false });
        element.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
    }

    showCookiePolicy() {
        this.store.patchState({ cookiePolicy: true });
    }

    onDrawerChange(value: boolean) {
        this.store.patchState({ drawerVisible: value });
    }

    private addCookieScriptTag() {
        if (!this.document.head.querySelector('#Cookiebot')) {
            const script = this.document.createElement('script');
            script.id = 'Cookiebot';
            script.src = 'https://consent.cookiebot.com/uc.js';
            script.setAttribute('data-cbid', '9c123420-fbfe-4f65-9892-96b11e7efe81');
            script.setAttribute('data-blockingmode', 'auto');
            script.type = 'text/javascript';

            this.document.head.appendChild(script);
        }
    }
}