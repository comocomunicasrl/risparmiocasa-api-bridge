import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    standalone: true,
    selector: 'ricaweb-fantasanremo-cookie-policy',
    templateUrl: 'cookie-policy.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CookiePolicyComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}