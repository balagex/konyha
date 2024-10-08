import { AdatServiceService } from './../../adat-service.service';
import { Component, input, output, computed, signal, OnInit } from '@angular/core';
import { Recept } from '../../model/recept.type';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';


@Component({
    selector: 'app-recept-szerkeszto',
    standalone: true,
    imports: [ButtonModule, FormsModule, InputTextModule, NgClass, InputTextareaModule],
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

    vanSajatMegjegyzes = computed(() => {
        let result = this.szerkesztesiAdatok() && this.szerkesztesiAdatok().recept()?.megjegyzesek?.findIndex(m => m.sajatE) > -1;
        return result;
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

    nevModositas(nev: string): void {
        const recept = this.szerkesztesiAdatok().recept();
        recept.nev = nev;
        this.szerkesztesiAdatok().recept.set(recept);
        console.debug('ReceptSzerkesztoComponent - nevModositas ', nev);
    }

    keszitesModositas(keszites: string): void {
        const recept = this.szerkesztesiAdatok().recept();
        recept.keszites = keszites;
        this.szerkesztesiAdatok().recept.set(recept);
        console.debug('ReceptSzerkesztoComponent - keszitesModositas ', keszites);
    }

    leirasModositas(leiras: string): void {
        const recept = this.szerkesztesiAdatok().recept();
        recept.leiras = leiras;
        this.szerkesztesiAdatok().recept.set(recept);
        console.debug('ReceptSzerkesztoComponent - leirasModositas ', leiras);
    }

    ujMegjegyzesRogzitesInditas(): void {
        console.debug('ReceptSzerkesztoComponent - ujMegjegyzesRogzitesInditas ');
    }

    mentes(): void {
        // TODO megcsinálni
        console.debug('ReceptSzerkesztoComponent - mentes ', this.szerkesztesiAdatok().recept());
    }
}
