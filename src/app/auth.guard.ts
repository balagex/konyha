import { inject, Injectable } from '@angular/core';
import { FireAuthService } from './fire-auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';

@Injectable({ providedIn: 'root' })
class AuthGuard {

    // A https://www.youtube.com/watch?v=Yc93IvrouxY videó alapján próbáltam a deprecated canActivate cuccot lecserélni,
    // ami kapcsán elkészült az auth.guard.fn.ts. De úgy nem műköfött.
    // A https://www.youtube.com/watch?v=ZiPQSdmcGRk videóü alapján próbáltam ezt a másik megoldást, ami megy, de nem tűnik valami szépnek.

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {
        const fireAuthService = inject(FireAuthService);
        const router = inject(Router);

        const result: boolean = fireAuthService.isAuthenticated();
        if (!result) {
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
        return result;
    }
}

export const IsAuthGuardFn: CanActivateFn = (route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean => {
    return inject(AuthGuard).canActivate(route, state);
}