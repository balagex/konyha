import { AdatServiceService } from './../../adat-service.service';
import { Component, input, output, computed, signal, OnInit } from '@angular/core';
import { Recept } from '../../model/recept.type';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { cloneDeep } from 'lodash';
import { FireAuthService } from '../../fire-auth.service';
import { ReceptMegjegyzes } from '../../model/recept-megjegyzes.type';
import { dateToYYYYMMDDhhmmss } from '../../utils';
import { GrowlService } from '../growl/growl.service';
import { GrowlMsg } from '../../model/groel-msg.type';
import { UJ_SOR } from '../../common.constants';
import { HttpErrorResponse } from '@angular/common/http';


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

    ujReceptE = computed(() => {
        return this.adatServiceService.szerkesztendoReceptUjReceptE();
    });

    // receptMentheto = computed<boolean>(() => {
    //     this.adatServiceService.szerkesztendoRecept();
    //     const recept = this.szerkesztesiAdatok().recept();
    //     let nevOk = recept?.nev?.length > 0;
    //     let leirasOk = recept?.leiras?.length > 0;
    //     let megjegyzesekOk = recept?.megjegyzesek?.findIndex(m => m.sajatE && m.duma.length < 1) < 0;
    //     console.debug('ReceptSzerkesztoComponent - receptMentheto ', recept, nevOk, leirasOk, megjegyzesekOk);
    //     return nevOk && leirasOk && megjegyzesekOk;
    // });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService, private growlService: GrowlService) { }

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

    megjegyzesModositas(megjegyzes: ReceptMegjegyzes): void {
        megjegyzes.idopont = dateToYYYYMMDDhhmmss(new Date(), true);
        console.debug('ReceptSzerkesztoComponent - megjegyzesModositas ', megjegyzes);
    }

    ujMegjegyzesRogzitesInditas(): void {
        console.debug('ReceptSzerkesztoComponent - ujMegjegyzesRogzitesInditas ');
    }

    receptMentheto(): boolean {
        const recept = this.szerkesztesiAdatok().recept();
        let nevOk = recept?.nev?.length > 0;
        let leirasOk = recept?.leiras?.length > 0;
        let megjegyzesekOk = recept?.megjegyzesek?.findIndex(m => m.sajatE && m.duma.length < 1) < 0;
        // console.debug('ReceptSzerkesztoComponent - receptMentheto ', recept, nevOk, leirasOk, megjegyzesekOk);
        return nevOk && leirasOk && megjegyzesekOk;
    }

    mentes(): void {
        // TODO service oldalon a megjegyzés fésülés hátravan
        const mentendoRecept = this.szerkesztesiAdatok().recept();
        console.debug('ReceptSzerkesztoComponent - mentes ', this.szerkesztesiAdatok().recept(), mentendoRecept);

        // Azért jegyezzük meg mentés előtt, mert utána automata átvált false-ra és nem indul a kedvenc aktualizálás.
        const ujReceptetMentunkE = this.ujReceptE();

        this.adatServiceService.recepMentese(mentendoRecept, this.fireAuthService.getToken()).subscribe({
            next: (receptek) => {
                console.debug('ReceptSzerkesztoComponent - mentés válasz: ', receptek, this.adatServiceService.receptLista());
                if (ujReceptetMentunkE) {
                    this.kedvencekAktualizalasa(mentendoRecept);
                } else {
                    const uzi = new GrowlMsg('Sikeres mentés', 'info');
                    this.growlService.idozitettUzenetMegjelenites(uzi, 2000);
                }
            },
            error: (receptekError) => {
                console.error('ReceptSzerkesztoComponent - RECEPT LISTA MENTÉS HIBA ', receptekError);
                let duma = 'Hiba történt a mentés során!' + UJ_SOR + UJ_SOR +
                    'Valószínűleg lejárt a kapcsolati idő, újra be kell lépni.';
                if (receptekError instanceof HttpErrorResponse) {
                    duma = duma + UJ_SOR + UJ_SOR +
                        JSON.stringify(receptekError?.error);
                }
                const uzi = new GrowlMsg(duma, 'hiba');
                this.growlService.idozitettUzenetMegjelenites(uzi, 0);
            }
        });
    }

    kedvencsegAllitas(): void {
        const recept = this.szerkesztesiAdatok().recept();
        recept.kedvencE = !recept.kedvencE;
        this.szerkesztesiAdatok().recept.set(recept);
        console.debug('ReceptSzerkesztoComponent - kedvencsegAllitas ', recept.kedvencE);
        if (!this.ujReceptE()) {
            this.kedvencekAktualizalasa(recept);
        }
    }

    kedvencekAktualizalasa(recept: Recept): void {
        console.debug('ReceptSzerkesztoComponent - kedvencekAktualizalasa ', recept);
        this.adatServiceService.receptKedvencsegModositasMentese(recept, this.fireAuthService.getEmail(), this.fireAuthService.getToken()).subscribe({
            next: (kedvencek) => {
                console.debug('ReceptSzerkesztoComponent - mentés válasz: ', kedvencek);
                const uzi = new GrowlMsg('Sikeres mentés', 'info');
                this.growlService.idozitettUzenetMegjelenites(uzi, 2000);
            },
            error: (kedvencekError) => {
                console.error('ReceptSzerkesztoComponent - RECEPT LISTA MENTÉS HIBA ', kedvencekError);
                let duma = 'Hiba történt a mentés során!' + UJ_SOR + UJ_SOR +
                    'Valószínűleg lejárt a kapcsolati idő, újra be kell lépni.';
                if (kedvencekError instanceof HttpErrorResponse) {
                    duma = duma + UJ_SOR + UJ_SOR +
                        JSON.stringify(kedvencekError?.error);
                }
                const uzi = new GrowlMsg(duma, 'hiba');
                this.growlService.idozitettUzenetMegjelenites(uzi, 0);
            }
        });
    }
}
