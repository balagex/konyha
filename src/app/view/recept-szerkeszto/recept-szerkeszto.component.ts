import { KedvencReceptekIF } from './../../model/kedvenc-receptek.interface';
import { AdatServiceService } from './../../adat-service.service';
import { cloneDeep } from 'lodash';
import { Component, input, output, computed, signal, OnInit } from '@angular/core';
import { Recept } from '../../model/recept.type';
import { ButtonModule } from 'primeng/button';


@Component({
    selector: 'app-recept-szerkeszto',
    standalone: true,
    imports: [ButtonModule],
    templateUrl: './recept-szerkeszto.component.html',
    styleUrl: './recept-szerkeszto.component.scss'
})
export class ReceptSzerkesztoComponent implements OnInit {

    mobilE = input<boolean>(false);

    szerkesztesVege = output<Recept>();

    // A recept kiválasztás hatására kell a szerkesztő mezőkhöz értékeket beállítani, amiknek a mezők által móódosíthatóaknak kell lenniük.
    // Lehetne effect()-et használni, és sima változókba írni az adatokat, de ha signal alapú adat változókat használunk, akkor 
    // ott nem javasolt a signal érték módosítás. 
    // computed() használata esetén az readOnly signált csinál.
    // https://www.youtube.com/watch?v=aKxcIQMWSNU
    // A linket video alapján lehet trükközni, hogy a computed által visszaadott readonly signál értékébe teszünk írható signal mezőt.

    szerkesztesiAdatok = computed(() => {

        return {
            forrasRecept: this.adatServiceService.kivalasztottRecept(),
            recept: signal<Recept>(this.adatServiceService.szerkesztendoRecept())
        };
    });

    torzsMegjelenithetoE = computed(() => {
        let result = this.adatServiceService.szerkesztendoRecept()?.azon;
        console.debug('ReceptSzerkesztoComponent - torzsMegjelenithetoE', this.adatServiceService.szerkesztendoRecept()?.azon, result);
        return result;
    });

    receptMentheto = computed<boolean>(() => {
        return (this.szerkesztesiAdatok()?.recept()?.nev?.length > 0 &&
            this.szerkesztesiAdatok()?.recept()?.leiras?.length > 0);
    });

    constructor(private adatServiceService: AdatServiceService) { }

    ngOnInit(): void {
    }

    ujReceptFelvetelInditas(): void {
        this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
    }

    mentes(): void {
        // TODO megcsinálni
        console.debug('ReceptSzerkesztoComponent - mentes ', this.szerkesztesiAdatok().recept());
    }
}
