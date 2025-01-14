import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    standalone: true,
    imports: [],
    selector: 'ricaweb-loading-spinner',
    templateUrl: 'loading-spinner.component.html',
    styleUrl: 'loading-spinner.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoadingSpinnerComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}