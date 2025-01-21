import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';

@Component({
    standalone: true,
    selector: 'ricaweb-fantasanremo-cookie-policy',
    templateUrl: 'cookie-policy.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CookiePolicyComponent implements OnInit, AfterViewInit {
    @ViewChild('CookieDeclaration') cookieDeclarationEl: ElementRef;
    constructor(
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngOnInit() { }

    ngAfterViewInit(): void {
        // <script id="CookieDeclaration" src="https://consent.cookiebot.com/9c123420-fbfe-4f65-9892-96b11e7efe81/cd.js" type="text/javascript" async>
        const script = this.document.createElement('script');
        script.id = 'CookieDeclaration';
        script.src = 'https://consent.cookiebot.com/9c123420-fbfe-4f65-9892-96b11e7efe81/cd.js';
        script.type = 'text/javascript';

        this.cookieDeclarationEl.nativeElement.appendChild(script)
    }
}