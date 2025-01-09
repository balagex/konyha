import { NgClass } from '@angular/common';
import { Component, computed } from '@angular/core';
import { LoadingService } from '../../loading.service';

@Component({
    selector: 'app-loading-indicator',
    imports: [NgClass],
    templateUrl: './loading-indicator.component.html',
    styleUrl: './loading-indicator.component.scss'
})
export class LoadingIndicatorComponent {

    loading = computed<boolean>(() => {
        let isLoading = this.loadingService.isLoading();
        console.debug('LoadingIndicatorComponent - isLoading ', isLoading);
        return isLoading;
    });

    constructor(private loadingService: LoadingService) { }
}
