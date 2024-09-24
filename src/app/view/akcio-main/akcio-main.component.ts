import { Component, OnInit, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AkcioListaComponent } from '../akcio-lista/akcio-lista.component';
import { AdatServiceService } from '../../adat-service.service';
import { FireAuthService } from '../../fire-auth.service';
import { AkcioListaListaComponent } from '../akcio-lista-lista/akcio-lista-lista.component';
import { AkcioTetel } from '../../model/akcio-tetel.type';
import { AkcioTetelSzerkesztoComponent } from '../akcio-tetel-szerkeszto/akcio-tetel-szerkeszto.component';
import { sortFunction } from '../../utils';
import { AkciosLista } from '../../model/akcios-lista.type';

@Component({
    selector: 'app-akcio-main',
    standalone: true,
    imports: [ButtonModule, AkcioListaComponent, AkcioListaListaComponent, AkcioTetelSzerkesztoComponent],
    templateUrl: './akcio-main.component.html',
    styleUrl: './akcio-main.component.scss'
})
export class AkcioMainComponent implements OnInit {

    public ful: number = 2;
    public nagyiMod: boolean = false;

    balra(): void {
        this.ful = this.ful - 1;
    }

    jobbra(): void {
        this.ful = this.ful + 1;
    }

    kivalasztottTetel = computed<AkcioTetel>(() => {
        return this.adatServiceService.kivalasztottTetel();
    });

    kivalasztottLista = computed<AkciosLista>(() => {
        return this.adatServiceService.kivalasztottLista();
    });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService) { }

    ngOnInit() {

        this.adatServiceService.akcioTetelNevekLekereseAlap(this.fireAuthService.getToken()).subscribe({
            next: (nevek) => {
                console.debug('AkcioMainComponent - Lekért nevekk: ', nevek);
                this.adatServiceService.akcioTetelNevLista.set(nevek);
            },
            error: (nevListaError) => {
                console.error('AkcioMainComponent - NÉV LISTA LEKERES HIBA ', nevListaError);
                this.fireAuthService.logout();
            }
        });

        this.adatServiceService.akciosListakLekereseAlap(this.fireAuthService.getToken()).subscribe({
            next: (listak) => {
                console.debug('AkcioMainComponent - Lekért akciós listák: ', listak);
                if (listak && listak.length > 0) {
                    const rendezettListak = listak.sort((a, b) => {
                        return sortFunction(a, b, -1, 'kezdoNap', 'vegeNap', false);
                    });
                    this.adatServiceService.akciosListakLista.set(rendezettListak);
                    this.adatServiceService.aktulaisHetKivalasztasa();

                    this.adatServiceService.akcioTetelekLekereseAlap(this.fireAuthService.getToken()).subscribe({
                        next: (tetelek) => {
                            console.debug('AkcioListaComponent - Lekért akciós tételek: ', tetelek);
                            if (tetelek && tetelek.length > 0) {
                                this.adatServiceService.akciosTetelLista.set(tetelek);
                            } else {
                                this.adatServiceService.akciosTetelLista.set([]);
                            }
                        },
                        error: (tetelekError) => {
                            console.error('AkcioListaComponent - AKCIÓS TÉTEL LEKERES HIBA ', tetelekError);
                            this.fireAuthService.logout();
                        }
                    });

                } else {
                    this.adatServiceService.akciosListakLista.set([]);
                }
            },
            error: (listaError) => {
                console.error('AkcioMainComponent - AKCIÓS LISTA LEKERES HIBA ', listaError);
                this.fireAuthService.logout();
            }
        });

    }

    nagyiModValtas(): void {
        this.adatServiceService.nagyiMod.update(currval => !currval);
    }

}
