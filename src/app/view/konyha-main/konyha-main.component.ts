import { Component, OnInit, computed, model, signal } from '@angular/core';
import { AdatServiceService } from '../../adat-service.service';
import { FireAuthService } from '../../fire-auth.service';
import { Recept } from '../../model/recept.type';
import { ButtonModule } from 'primeng/button';
import { ReceptListaComponent } from '../recept-lista/recept-lista.component';
import { ReceptSzerkesztoComponent } from '../recept-szerkeszto/recept-szerkeszto.component';
import { NgClass } from '@angular/common';
import { DialogModule } from 'primeng/dialog';


@Component({
    selector: 'app-konyha-main',
    imports: [ButtonModule, ReceptListaComponent, ReceptSzerkesztoComponent, NgClass, DialogModule],
    templateUrl: './konyha-main.component.html',
    styleUrl: './konyha-main.component.scss'
})
export class KonyhaMainComponent implements OnInit {

    // Ezek minta ahhoz, hogyan lehet egy elem méret változását figyelni. Mivel kivezettük a mobilE kezelést
    // az alkomponensekből, így csak ki lett próbálva, hogy tudunk-e programozottan, külön api telepítése nélkül
    // a méret változásra reagálni.
    // @ViewChild('keretDiv', { static: true }) wapperElement: ElementRef;
    // szelesseg = signal<number>(null);
    // observer: ResizeObserver;

    public ful = signal<number>(1);
    public nagyiMod = signal<boolean>(false);
    infoMod = model<boolean>(false);

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

        // this.observer = new ResizeObserver(entries => {
        //     const width = entries[0].contentRect.width;
        //     // console.log('KonyhaMainComponent - RESIZE: ', entries, width);
        //     this.szelesseg.set(width);
        // });

        // this.observer.observe(this.wapperElement.nativeElement);
    }

    balra(): void {
        this.ful.set(1);
        this.adatServiceService.szerkesztendoRecept.set(null);
        this.adatServiceService.kivalasztottRecept.set(null);
    }

    jobbra(): void {
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

    infoKell(): void {
        this.infoMod.set(true);
    }

    kilepes(): void {
        this.fireAuthService.logout();
    }

    // ngOnDestroy() {
    //     this.observer.unobserve(this.wapperElement.nativeElement);
    // }

}
