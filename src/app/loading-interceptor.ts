import { LoadingService } from './loading.service';
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    activeRequests: number = 0;

    constructor(private loadingService: LoadingService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.debug('LoadingInterceptor - intercept ', request);
        if (this.activeRequests === 0) {
            this.loadingService.isLoading.set(true);
            console.debug('LoadingInterceptor - loading be...');
        }

        this.activeRequests++;
        return next.handle(request).pipe(
            finalize(() => {
                this.activeRequests--;
                if (this.activeRequests === 0) {
                    this.loadingService.isLoading.set(false);
                    console.debug('LoadingInterceptor - loading ki...');
                }
            })
        );
    }
}

/**
 * Provider POJO for the interceptor
 */
export const LoadingInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: LoadingInterceptor,
    multi: true,
};