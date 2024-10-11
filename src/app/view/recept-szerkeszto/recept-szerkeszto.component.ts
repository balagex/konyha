import { AdatServiceService } from './../../adat-service.service';
import { Component, input, output, computed, signal, OnInit, ViewChild } from '@angular/core';
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
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { ReceptLink } from '../../model/recept-link.type';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'app-recept-szerkeszto',
    standalone: true,
    imports: [ButtonModule, FormsModule, InputTextModule, NgClass, InputTextareaModule, ConfirmPopupModule],
    providers: [ConfirmationService],
    templateUrl: './recept-szerkeszto.component.html',
    styleUrl: './recept-szerkeszto.component.scss'
})
export class ReceptSzerkesztoComponent implements OnInit {

    @ViewChild('megjegyzesConfirmPopupRef', { static: false }) megjTorlesConfirmPopup!: ConfirmPopup;
    @ViewChild('linkConfirmPopupRef', { static: false }) linkTorlesConfirmPopup!: ConfirmPopup;

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

    // megjegyzesListaBuzeralas = signal<ReceptMegjegyzes>(null);

    // Ez a cucc a megjegyzesListaBuzeralas signal állíítás nélkül nem működik jól, mert sem új megjegyzés felvételekot, sem
    // a saját megjegyzés törlésekor nem számolódik újra, hiába set-eljük be a recept-et, akár cloneDeep-pel.
    // A megjegyzesListaBuzeralas bevezetésével is csak úgy működött törléskor jól, ha a megjegyzesListaBuzeralas-t vagy a popup feltételekor beállítjuk 
    // és a törlés acceptben null-ra állítjuk, mert ekkor ez is újsraszámolódik, azaz figyelni kell, hogy a megjegyzesListaBuzeralas signal referencia 
    // értéke mindig módosuljon, ha azt akarjuk, hogy ez is újraszámolódjon.
    // A sajatMegjegyzesVanE sima függvény viszont trükközés nélkül is jól számolódik, igaz minden életciklus körben kikalkulálódik.
    // vanSajatMegjegyzes = computed(() => {
    //     const proba = this.megjegyzesListaBuzeralas();
    //     const sza = this.szerkesztesiAdatok();
    //     const recept = sza.recept();
    //     let teszt = recept?.megjegyzesek?.findIndex(m => m.sajatE);
    //     let result = recept?.megjegyzesek?.findIndex(m => m.sajatE) > -1;
    //     console.debug('ReceptSzerkesztoComponent - vanSajatMegjegyzes', recept, teszt, result);
    //     return result;
    // });

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

    constructor(private adatServiceService: AdatServiceService,
        private fireAuthService: FireAuthService,
        private growlService: GrowlService,
        private confirmationService: ConfirmationService,
        private domSanitizer: DomSanitizer) { }

    ngOnInit(): void {
    }

    sajatMegjegyzesVanE(): boolean {
        const recept = this.szerkesztesiAdatok().recept();
        return recept?.megjegyzesek?.findIndex(m => m.sajatE) > -1;
    };

    ujReceptFelvetelInditas(): void {
        this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
    }

    nevModositas(nev: string): void {
        const recept = this.szerkesztesiAdatok().recept();
        recept.nev = nev;
        this.szerkesztesiAdatok().recept.set(recept);
        console.debug('ReceptSzerkesztoComponent - nevModositas ', nev, this.adatServiceService.szerkesztendoRecept());
    }

    keszitesModositas(keszites: string): void {
        const recept = this.szerkesztesiAdatok().recept();
        recept.keszites = keszites;
        this.szerkesztesiAdatok().recept.set(recept);
        // console.debug('ReceptSzerkesztoComponent - keszitesModositas ', keszites);
    }

    leirasModositas(leiras: string): void {
        const recept: Recept = this.szerkesztesiAdatok().recept() as Recept;
        recept.leiras = leiras;
        this.szerkesztesiAdatok().recept.set(recept);
        console.debug('ReceptSzerkesztoComponent - leirasModositas ', leiras, recept, recept instanceof Recept);
    }

    megjegyzesModositas(megjegyzes: ReceptMegjegyzes): void {
        megjegyzes.idopont = dateToYYYYMMDDhhmmss(new Date(), true);
        // console.debug('ReceptSzerkesztoComponent - megjegyzesModositas ', megjegyzes);
    }

    ujMegjegyzesRogzitesInditas(): void {
        const recept = this.szerkesztesiAdatok().recept();
        const ujMegjegyzes = new ReceptMegjegyzes(null);
        ujMegjegyzes.felhasznaloAzon = this.fireAuthService.getEmail();
        ujMegjegyzes.idopont = dateToYYYYMMDDhhmmss(new Date(), true);
        ujMegjegyzes.sajatE = true;
        ujMegjegyzes.duma = '';
        recept.megjegyzesek.push(ujMegjegyzes);
        this.szerkesztesiAdatok().recept.set(recept);
        // this.megjegyzesListaBuzeralas.set(ujMegjegyzes);
        console.debug('ReceptSzerkesztoComponent - ujMegjegyzesRogzitesInditas ', ujMegjegyzes, recept);
        // Ez a borzalmas trükközés azért van, mert a textarea inputra hiába állítjuk be NgClass-al, hogy invalid és dirty,
        // az új megjegyzés megjelenésekor ez átáll magátol valid és untouched-ra.
        // Mivel nem használunk form-ot és az input nem form control, így nem tudunk rá validátort tenni és kódból kikényszerííteni a validálást.
        // Helyette ezzel a hekkeléssel beírunk egy space-t, és kiveszünk, és így megjelenik az invalid jelölés. 
        setTimeout(() => {
            ujMegjegyzes.duma = ' ';
            this.megjegyzesModositas(ujMegjegyzes);
            setTimeout(() => {
                ujMegjegyzes.duma = '';
                this.megjegyzesModositas(ujMegjegyzes);
            }, 200);
        }, 200);
    }

    sajatMegjegyzesTorles(event: Event, megjegyzes: ReceptMegjegyzes): void {

        console.debug('ReceptSzerkesztoComponent - tetelTorles', event, megjegyzes);
        // this.megjegyzesListaBuzeralas.set(megjegyzes);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Biztos töröli a saját megjegyzését?',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                const recept = this.szerkesztesiAdatok().recept();
                const roviditettMegjegyzesLista = recept.megjegyzesek.filter(m => m.felhasznaloAzon !== megjegyzes.felhasznaloAzon);
                recept.megjegyzesek = [].concat(recept.megjegyzesek.filter(m => m.felhasznaloAzon !== megjegyzes.felhasznaloAzon));
                this.szerkesztesiAdatok().recept.set(recept);
                const mc = cloneDeep(megjegyzes);
                // this.megjegyzesListaBuzeralas.set(null);
                console.debug('ReceptSzerkesztoComponent - MEGJEGYZÉS tetelTorles OK', roviditettMegjegyzesLista, this.szerkesztesiAdatok().recept());
                // const tetelek = this.adatServiceService.akciosTetelLista().filter(t => t.azon !== tetel.azon);
                // this.adatServiceService.akciosTetelLista.set(tetelek);
                // this.adatServiceService.kivalasztottTetel.set(null);
                // this.adatServiceService.mentendoAdatokMentese(this.fireAuthService.getToken()).subscribe({
                //     next: (mentettTetelek) => {
                //         console.debug('AkcioListaComponent - A törlés és a mentendő tételek mentése után lekért akciós tételek: ', mentettTetelek);
                //     },
                //     error: (modositasError) => {
                //         console.error('ReceptSzerkesztoComponent - HIBA AZ AKCIOS TÉTELEK MÓDOSÍTÁSA SORÁN ', modositasError);
                //         // TODO: kitalálni mi legyen
                //     }
                // });
                this.confirmationService.close();
            },
            reject: () => {
                console.debug('ReceptSzerkesztoComponent - MEGJEGYZÉS tetelTorles CANCEL');
                this.confirmationService.close();
            }
        });
    }

    megjTorlesAccept() {
        this.megjTorlesConfirmPopup.accept();
    }

    megjTorlesReject() {
        this.megjTorlesConfirmPopup.reject();
    }

    // linkSafeURL(link: ReceptLink) {
    //     let linkUrl = link.link;
    //     if (linkUrl.indexOf('www.youtube.com/watch') > -1) {
    //         linkUrl = linkUrl.replace('watch', 'embed');
    //     }

    //     return this.domSanitizer.bypassSecurityTrustResourceUrl(linkUrl);
    // }

    openLink(link: ReceptLink): void {
        console.debug('ReceptSzerkesztoComponent - openLink ', link);
        window.open(link.link, '_blnak');
    }

    linkModositas(link: ReceptLink): void {
        console.debug('ReceptSzerkesztoComponent - linkModositas ', link);
    }

    ujLinkRogzitesInditas(): void {
        console.debug('ReceptSzerkesztoComponent - ujLinkRogzitesInditas');
    }

    linkTorles(event: Event, link: ReceptLink): void {
        console.debug('ReceptSzerkesztoComponent - linkTorles', event, link);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Biztos töröli a linket?',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                console.debug('ReceptSzerkesztoComponent - LINK tetelTorles OK', link);
                this.confirmationService.close();
            },
            reject: () => {
                console.debug('ReceptSzerkesztoComponent - LINK tetelTorles CANCEL', link);
                this.confirmationService.close();
            }
        });
    }

    linkTorlesAccept() {
        this.linkTorlesConfirmPopup.accept();
    }

    linkTorlesReject() {
        this.linkTorlesConfirmPopup.reject();
    }

    receptMentheto(): boolean {
        const recept = this.szerkesztesiAdatok().recept();
        let nevOk = recept?.nev?.length > 0;
        let leirasOk = recept?.leiras?.length > 0;
        let sajatMegjegyzesIdx = recept?.megjegyzesek?.findIndex(m => m.sajatE);
        let sajatMegjegyzes = recept?.megjegyzesek?.find(m => m.sajatE);
        let megjegyzesekOk = sajatMegjegyzesIdx < 0 || (sajatMegjegyzes && sajatMegjegyzes.duma?.length > 0);
        // console.debug('ReceptSzerkesztoComponent - receptMentheto ', recept, nevOk, leirasOk, megjegyzesekOk);
        return nevOk && leirasOk && megjegyzesekOk;
    }


    idegenMentes(): void {
        const mentendoRecept = this.szerkesztesiAdatok().recept();
        const ujReceptetMentunkE = this.ujReceptE(); // Nem lehet új recept, ami idegen!
        console.debug('ReceptSzerkesztoComponent - idegenMentes ', mentendoRecept, ujReceptetMentunkE);
    }

    mentes(): void {
        // TODO service oldalon a megjegyzés fésülés hátravan
        const mentendoRecept: Recept = this.szerkesztesiAdatok().recept();
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
