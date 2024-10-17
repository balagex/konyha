import { Component, OnInit, computed, signal } from '@angular/core';
import { AdatServiceService } from '../../adat-service.service';
import { FireAuthService } from '../../fire-auth.service';
import { Recept } from '../../model/recept.type';
import { ButtonModule } from 'primeng/button';
import { ReceptListaComponent } from '../recept-lista/recept-lista.component';
import { ReceptSzerkesztoComponent } from '../recept-szerkeszto/recept-szerkeszto.component';


@Component({
    selector: 'app-konyha-main',
    standalone: true,
    imports: [ButtonModule, ReceptListaComponent, ReceptSzerkesztoComponent],
    templateUrl: './konyha-main.component.html',
    styleUrl: './konyha-main.component.scss'
})
export class KonyhaMainComponent implements OnInit {

    public ful = signal<number>(1);
    public nagyiMod = signal<boolean>(false);

    kivalasztottRecept = computed<Recept>(() => {
        return this.adatServiceService.kivalasztottRecept();
    });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService) { }

    ngOnInit() {

        this.adatServiceService.receptekLekereseAlap(this.fireAuthService.getToken()).subscribe({
            next: (receptek) => {
                console.debug('KonyhaMainComponent - RECEPTEK: ', receptek);

                this.adatServiceService.kedvencReceptekLekereseAlap(this.fireAuthService.getToken()).subscribe({
                    next: (kReceptek) => {
                        const receptLista = this.adatServiceService.receptLista();
                        const kedvencReceptekLista = this.adatServiceService.kedvencReceptekLista();
                        console.debug('KonyhaMainComponent - KEDVENC RECEPTEK: ', kReceptek, receptLista, kedvencReceptekLista);
                    },
                    error: (kReceptekError) => {
                        console.error('KonyhaMainComponent - KEDVENC RECEPT LISTA LEKERES HIBA ', kReceptekError);
                        this.fireAuthService.logout();
                    }
                });
            },
            error: (receptekError) => {
                console.error('KonyhaMainComponent - RECEPT LISTA LEKERES HIBA ', receptekError);
                this.fireAuthService.logout();
            }
        });
    }

    balra(): void {
        this.ful.set(1);
    }

    jobbra(): void {
        // if (!this.adatServiceService.kivalasztottRecept()?.azon) {
        //     this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
        // }
        // this.adatServiceService.kivalasztottRecept.set(null);
        this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
        this.ful.set(2);
    }

    receptKivalasztas(event: Recept): void {
        console.debug('KonyhaMainComponent - receptKivalasztas', event);
        if (this.ful() === 1 && event?.azon) {
            this.ful.set(2);
        }
    }


    receptSzerkesztesKesz(event: Recept): void {
        console.debug('KonyhaMainComponent - receptSzerkesztesKesz', event);
        if (this.ful() === 2 && event?.azon) {
            this.balra();
        }
    }

}
