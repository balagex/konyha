import { Routes } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { RegisztracioComponent } from './view/regisztracio/regisztracio.component';
import { IsAuthGuardFn } from './auth.guard';
import { KonyhaMainComponent } from './view/konyha-main/konyha-main.component';

export const routes: Routes = [
    { path: 'kk', component: KonyhaMainComponent, canActivate: [IsAuthGuardFn] },
    { path: 'reg', component: RegisztracioComponent },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'kk', pathMatch: 'full' },
    { path: '**', redirectTo: 'kk' }
];
