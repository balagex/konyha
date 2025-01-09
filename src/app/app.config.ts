import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { LoadingInterceptorProvider } from './loading-interceptor';
import { ThemePreset } from './prime-theme-preset';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        importProvidersFrom(TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            defaultLanguage: 'hu'
        })),
        LoadingInterceptorProvider,
        provideRouter(routes),
        provideAnimations(),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: ThemePreset
            }
        }),
        provideHttpClient(withInterceptorsFromDi())
    ]
};

// providePrimeNG({
//     theme: {
//         preset: Lara,
//         options: {
//             cssLayer: {
//                 name: 'primeng',
//                 order: 'app-styles, primeng, another-css-library'
//             }
//         }
//     }
// }),

