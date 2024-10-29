import { AdatServiceService } from './../../adat-service.service';
import { Component, input, output, computed, signal, OnInit, ViewChild, model } from '@angular/core';
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
import { ReceptLinkerComponent } from '../recept-linker/recept-linker.component';
import { ReceptKepKezeloComponent } from '../recept-kep-kezelo/recept-kep-kezelo.component';
import { ListResult, StorageReference } from 'firebase/storage';
import { FileSelectEvent, FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { subscribeOn } from 'rxjs';


@Component({
    selector: 'app-recept-szerkeszto',
    standalone: true,
    imports: [ButtonModule, FormsModule, InputTextModule, NgClass, InputTextareaModule, ConfirmPopupModule, ReceptLinkerComponent, ReceptKepKezeloComponent, FileUploadModule],
    providers: [ConfirmationService],
    templateUrl: './recept-szerkeszto.component.html',
    styleUrl: './recept-szerkeszto.component.scss'
})
export class ReceptSzerkesztoComponent implements OnInit {

    @ViewChild('reTorConfirmPopupRef', { static: false }) receptTorlesConfirmPopup: ConfirmPopup;
    @ViewChild('megjegyzesConfirmPopupRef', { static: false }) megjTorlesConfirmPopup: ConfirmPopup;
    // @ViewChild('linkConfirmPopupRef', { static: false }) linkTorlesConfirmPopup!: ConfirmPopup;
    @ViewChild('kepvalaszto', { static: false }) kepFajlValaszto: FileUpload;

    szerkesztesVege = output<Recept>();

    // A recept kiválasztás hatására kell a szerkesztő mezőkhöz értékeket beállítani, amiknek a mezők által móódosíthatóaknak kell lenniük.
    // Lehetne effect()-et használni, és sima változókba írni az adatokat, de ha signal alapú adat változókat használunk, akkor 
    // ott nem javasolt a signal érték módosítás. 
    // computed() használata esetén az readOnly signált csinál.
    // https://www.youtube.com/watch?v=aKxcIQMWSNU
    // A linket video alapján lehet trükközni, hogy a computed által visszaadott readonly signál értékébe teszünk írható signal mezőt.

    ujKepNev = model<string>(null);

    szerkesztesiAdatok = computed(() => {

        return {
            forrasRecept: this.adatServiceService.kivalasztottRecept(),
            recept: signal<Recept>(this.adatServiceService.szerkesztendoRecept()),
            kepkezelesAktiv: signal<boolean>(false),
            ujKepFelvetelInditva: signal<boolean>(false),
            kepekInfo: signal<ListResult>(null)
        };
    });

    // megjegyzesListaBuzeralas = signal<ReceptMegjegyzes>(null);

    // Ez a cucc a megjegyzesListaBuzeralas signal állítás nélkül nem működik jól, mert sem új megjegyzés felvételekot, sem
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
        const voltEKivalasztottRecept = this.adatServiceService.kivalasztottRecept()?.azon ? true : false;
        this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
        if (!voltEKivalasztottRecept) {
            // Azért van ez a szörnyű kínlódás, mert ha nem volt recept kiválasztva, akkor az úf felvételekor a
            // név és leírás mezők invalid státusza nem állítódik be, és mivel nem formban vagyunk, nem tudunk mit rábírni
            // az új validáció futtatásra...
            setTimeout(() => {
                this.szerkesztesiAdatok().recept().nev = ' ';
                this.szerkesztesiAdatok().recept().leiras = ' ';
                setTimeout(() => {
                    this.szerkesztesiAdatok().recept().nev = '';
                    this.szerkesztesiAdatok().recept().leiras = '';
                }, 100);
            }, 100);
        }
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

        // Miután a link szerkesztés átkerült egy alkomponensbe, és ott is használjuk a globális confirmationService-t,
        // minden confirm metódus többször is lefutott, és több popup is megjelent. 
        // https://stackoverflow.com/questions/68277753/angular-primeng-p-confirmdialog-display-twice
        // A fenti link alapján használni kellett a key paramétert.
        // Másik lehetőség lenne, hogy komponens szinten saját service-t használnánk.

        console.debug('ReceptSzerkesztoComponent - tetelTorles', event, megjegyzes);
        // this.megjegyzesListaBuzeralas.set(megjegyzes);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'megjegyzesConfirmPopupRef',
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
                //         console.debug('ReceptSzerkesztoComponent - A törlés és a mentendő tételek mentése után lekért akciós tételek: ', mentettTetelek);
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

    ujLinkRogzitesInditas(): void {
        console.debug('ReceptSzerkesztoComponent - ujLinkRogzitesInditas');
    }

    linkFelveve(ujLink: ReceptLink): void {
        console.debug('ReceptSzerkesztoComponent - linkFelveve', ujLink);
        if (ujLink) {
            this.szerkesztesiAdatok().recept().linkek.push(ujLink);
        } else {
            console.error('ReceptSzerkesztoComponent - linkFelveve - Link nem megadott! ', ujLink);
        }
    }

    linkModositva(modositottLink: ReceptLink, index: number): void {
        if (modositottLink && index !== null && index > -1) {
            this.szerkesztesiAdatok().recept().linkek = this.szerkesztesiAdatok().recept().linkek.map((recepLink, li) => {
                if (li === index) {
                    // console.debug('ReceptSzerkesztoComponent - linkModositva - CSERE', li, index);
                    return modositottLink;
                } else {
                    // console.debug('ReceptSzerkesztoComponent - linkModositva - NINCS CSERE', li, index);
                    return recepLink;
                }
            });
        } else {
            console.error('ReceptSzerkesztoComponent - linkModositva - Link nem megadott, vagy az index problémás! ', modositottLink, index);
        }
        console.debug('ReceptSzerkesztoComponent - linkModositva', modositottLink, index, this.szerkesztesiAdatok()?.recept()?.linkek);
    }

    linkTorlesOK(torlendoLink: ReceptLink, index: number): void {
        if (torlendoLink && index !== null && index > -1) {
            this.szerkesztesiAdatok().recept().linkek.splice(index, 1);
        } else {
            console.error('ReceptSzerkesztoComponent - linkTorlesOK - Link nem megadott, vagy az index problémás! ', torlendoLink, index);
        }
        console.debug('ReceptSzerkesztoComponent - linkTorlesOK', torlendoLink, index);
    }

    kepKezelesInditas(): void {
        this.szerkesztesiAdatok().kepkezelesAktiv.set(true);
        this.kepFajlInfokLekerese();
    }

    kepFajlInfokLekerese(): void {
        const kivalReceptAzon = this.szerkesztesiAdatok()?.forrasRecept?.azon;
        console.debug('ReceptSzerkesztoComponent - kepFajlInfokLekerese', kivalReceptAzon);
        this.adatServiceService.receptFajlInfokLekerese(kivalReceptAzon).subscribe({
            next: (fajlInfok) => {
                console.debug('ReceptSzerkesztoComponent - FÁJL INFÓK: ', fajlInfok);
                this.szerkesztesiAdatok().kepekInfo.set(fajlInfok);
            },
            error: (fajlInfokError) => {
                console.error('ReceptSzerkesztoComponent - FÁJL INFÓK LEKERES HIBA ', fajlInfokError);
            }
        });
    }

    kepKezelesVege(): void {
        this.szerkesztesiAdatok().kepkezelesAktiv.set(false);
        this.szerkesztesiAdatok().ujKepFelvetelInditva.set(false);
        console.debug('ReceptSzerkesztoComponent - kepKezelesVege');
    }

    ujKepFelvetelInditas(): void {
        this.szerkesztesiAdatok().ujKepFelvetelInditva.set(true);
        this.ujKepNev.set('');
        console.debug('ReceptSzerkesztoComponent - ujKepFelvetelInditas');
    }

    kepValasztasAbort(): void {
        this.szerkesztesiAdatok().ujKepFelvetelInditva.set(false);
        this.ujKepNev.set('');
    }

    choose(event: any, callback: any) {
        console.debug('ReceptSzerkesztoComponent - choose', event, callback);
        callback();
    }

    uploadEvent(callback: any) {
        console.debug('ReceptSzerkesztoComponent - uploadEvent', callback);
        callback();
    }

    onSelect(event: FileSelectEvent) {
        console.debug('ReceptSzerkesztoComponent - onSelect ', event);
        if (event.currentFiles?.length > 0) {
            this.ujKepNev.set(event.currentFiles[0].name);
            if (this.szerkesztesiAdatok()?.kepekInfo()?.items?.length > 0 && this.szerkesztesiAdatok()?.kepekInfo()?.items.findIndex(i => input.name === event.currentFiles[0].name) > -1) {
                console.warn('ReceptSzerkesztoComponent - Meglévő névvel azonos nevű kép kiválasztva! ', event.currentFiles[0].name);
            }
        } else {
            this.ujKepNev.set('');
        }
        // setTimeout(() => {
        //     this.kepFajlValaszto.upload();
        // }, 2000);
    }

    onClear(): void {
        console.debug('ReceptSzerkesztoComponent - onClear ');
    }

    ujKepNevModositas(event: string): void {
        console.debug('ReceptSzerkesztoComponent - ujKepNevModositas ', event);
    }

    uploadHandler(event: FileUploadHandlerEvent) {
        console.debug('ReceptSzerkesztoComponent - uploadHandler ', event);
        if (event.files?.length > 0) {
            const file: File = event.files[0]; if (file) {
                if (file.type == 'image/jpeg' || file.type == 'image/jpg' || file.type == 'image/png') {
                    this.adatServiceService.receptKepFeltoltese(file, this.szerkesztesiAdatok().recept().azon, this.ujKepNev()).subscribe({
                        next: (feltValasz) => {
                            console.debug('ReceptSzerkesztoComponent - SIKERES KÉP FELTÖLTÉS', feltValasz);
                            const uzi = new GrowlMsg('Sikeres kép feltöltés', 'info');
                            this.growlService.idozitettUzenetMegjelenites(uzi, 2000);
                            this.kepFajlInfokLekerese();
                            this.szerkesztesiAdatok().ujKepFelvetelInditva.set(false);
                        },
                        error: (feltHiba) => {
                            const hibaSzoveg = feltHiba instanceof String ? feltHiba : JSON.stringify(feltHiba);
                            console.error('ReceptSzerkesztoComponent - KÉP FELTÖLTÉSI HIBA ! ', feltHiba, hibaSzoveg);
                            let duma = 'Nem sikerült a képet feltölteni!' + UJ_SOR + UJ_SOR +
                                hibaSzoveg;
                            const uzi = new GrowlMsg(duma, 'hiba');
                            this.growlService.idozitettUzenetMegjelenites(uzi, 0);
                        }
                    });


                } else {
                    console.error('ReceptSzerkesztoComponent - Nem megfelelő típusú fájl lett kiválasztva!', file.type);
                    let duma = 'Nem megfelelő típusú fájl lett kiválasztva!' + UJ_SOR + UJ_SOR +
                        'Csak jpeg vagy png választható ki.';
                    const uzi = new GrowlMsg(duma, 'hiba');
                    this.growlService.idozitettUzenetMegjelenites(uzi, 0);
                }
            }
        }

    }

    onBeforeUpload(event: any) {
        console.debug('ReceptSzerkesztoComponent - onBeforeUpload ', event);
    }

    onUpload(event: any) {
        console.debug('ReceptSzerkesztoComponent - onUpload ', event);
    }

    // Ez egy minta a sima input-os fájl feltöltéshez a primeng-s helyett...
    // onFileSelected(event: any) {

    //     const file: File = event.target.files[0];
    //     let fileFelulirasLesz: boolean = false;
    //     console.debug('ReceptSzerkesztoComponent - onFileSelected ', event, file);
    //     if (file) {
    //         if (file.type == 'image/jpeg' || file.type == 'image/jpg' || file.type == 'image/png') {
    //             if (this.szerkesztesiAdatok()?.kepekInfo()?.items?.length > 0 && this.szerkesztesiAdatok()?.kepekInfo()?.items.findIndex(i => input.name === file.name) > -1) {
    //                 console.warn('ReceptSzerkesztoComponent - Meglévő névvel azonos nevű kép kiválasztva! ', file.name);
    //                 fileFelulirasLesz = true;
    //             }
    //             this.adatServiceService.receptKepFeltoltese(file, this.szerkesztesiAdatok().recept().azon).subscribe({
    //                 next: (feltValasz) => {
    //                     console.debug('ReceptSzerkesztoComponent - SIKERES KÉP TÖRLÉS', feltValasz);
    //                     const uzi = new GrowlMsg('Sikeres kép feltöltés', 'info');
    //                     this.growlService.idozitettUzenetMegjelenites(uzi, 2000);
    //                     this.kepFajlInfokLekerese();
    //                     this.szerkesztesiAdatok().ujKepFelvetelInditva.set(false);
    //                 },
    //                 error: (feltHiba) => {
    //                     const hibaSzoveg = feltHiba instanceof String ? feltHiba : JSON.stringify(feltHiba);
    //                     console.error('ReceptSzerkesztoComponent - KÉP FELTÖLTÉSI HIBA ! ', feltHiba, hibaSzoveg);
    //                     let duma = 'Nem sikerült a képet feltölteni!' + UJ_SOR + UJ_SOR +
    //                         hibaSzoveg;
    //                     const uzi = new GrowlMsg(duma, 'hiba');
    //                     this.growlService.idozitettUzenetMegjelenites(uzi, 0);
    //                 }
    //             });

    //         } else {
    //             console.error('ReceptSzerkesztoComponent - Nem megfelelő típusú fájl lett kiválasztva!', file.type);
    //             let duma = 'Nem megfelelő típusú fájl lett kiválasztva!' + UJ_SOR + UJ_SOR +
    //                 'Csak jpeg vagy png választható ki.';
    //             const uzi = new GrowlMsg(duma, 'hiba');
    //             this.growlService.idozitettUzenetMegjelenites(uzi, 0);
    //         }
    //     }
    // }

    kepTorlesOK(kepInfo: StorageReference): void {
        console.debug('ReceptSzerkesztoComponent - kepTorlesOK', kepInfo);
        this.kepFajlInfokLekerese();
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
                const mentettRecept = receptek.find(r => r.azon === mentendoRecept.azon);
                console.debug('ReceptSzerkesztoComponent - mentés válasz: ', receptek, this.adatServiceService.receptLista(), mentettRecept);
                if (ujReceptetMentunkE) {
                    this.adatServiceService.kivalasztottRecept.set(mentettRecept);
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

    torles(event: Event): void {
        console.debug('ReceptSzerkesztoComponent - recept törlés', event);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'reTorConfirmPopupRef',
            message: 'Biztos töröli a receptet?' + UJ_SOR + UJ_SOR + 'A törlés után a recept adatai nem lesznek visszaállíthatók!',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                console.debug('ReceptSzerkesztoComponent - RECEPT TÖRLÉS INDUL...');
                const kivalReceptAzon = this.szerkesztesiAdatok()?.forrasRecept?.azon;
                this.confirmationService.close();
                const teszt = this.adatServiceService.receptKiveteleAKedvencekbol(this.szerkesztesiAdatok()?.forrasRecept, this.adatServiceService.kedvencReceptekLista());
                console.debug('ReceptSzerkesztoComponent - AKTUALIZÁLT KEDVENCEK TESZT: ', teszt);
                this.adatServiceService.receptOsszesKepTorlese(kivalReceptAzon).subscribe({
                    next: (eredmeny) => {
                        console.debug('ReceptSzerkesztoComponent - RECEPT KÉPEK TÖRÖLVE: ', eredmeny);
                        this.adatServiceService.torlesAKedvencekKozul(this.szerkesztesiAdatok()?.forrasRecept, this.fireAuthService.getToken()).subscribe({
                            next: (megmaradtKedvencek) => {
                                console.debug('ReceptSzerkesztoComponent - Kedvencek aktualizálása után: ', megmaradtKedvencek);
                                this.adatServiceService.recepTorlese(this.szerkesztesiAdatok()?.forrasRecept, this.fireAuthService.getToken()).subscribe({
                                    next: (megmaradtReceptek) => {
                                        console.debug('ReceptSzerkesztoComponent - Recept törlése utáni recept lista: ', megmaradtReceptek);
                                        const uzi = new GrowlMsg('Sikeres recept törlés', 'info');
                                        this.growlService.idozitettUzenetMegjelenites(uzi, 2000);
                                    },
                                    error: (recTorError) => {
                                        console.error('ReceptSzerkesztoComponent - RECEPT TÖRLÉSI HIBA ', recTorError);
                                        let duma = 'Hiba történt a recept törlése során!';
                                        if (recTorError instanceof HttpErrorResponse) {
                                            duma = duma + UJ_SOR + UJ_SOR +
                                                JSON.stringify(recTorError?.error);
                                        }
                                        const uzi = new GrowlMsg(duma, 'hiba');
                                        this.growlService.idozitettUzenetMegjelenites(uzi, 0);
                                    }
                                });
                            },
                            error: (kedvencAktError) => {
                                console.error('ReceptSzerkesztoComponent - KEDVENCEK AKTUALIZÁLÁSI HIBA ', kedvencAktError);
                                let duma = 'Hiba történt a recept kivétele a kedvenc receptek közül művelet során!';
                                if (kedvencAktError instanceof HttpErrorResponse) {
                                    duma = duma + UJ_SOR + UJ_SOR +
                                        JSON.stringify(kedvencAktError?.error);
                                }
                                const uzi = new GrowlMsg(duma, 'hiba');
                                this.growlService.idozitettUzenetMegjelenites(uzi, 0);
                            }
                        });
                    },
                    error: (torlesError) => {
                        console.error('ReceptSzerkesztoComponent - RECEP KÉPEK TÖRLÉSI HIBA ', torlesError);
                        this.confirmationService.close();
                        let duma = 'Hiba történt a recepthez tartozó képek törlése során, emiatt a recept törlése nem történt meg!';
                        if (torlesError instanceof HttpErrorResponse) {
                            duma = duma + UJ_SOR + UJ_SOR +
                                JSON.stringify(torlesError?.error);
                        }
                        const uzi = new GrowlMsg(duma, 'hiba');
                        this.growlService.idozitettUzenetMegjelenites(uzi, 0);
                    }
                });
            },
            reject: () => {
                console.debug('ReceptSzerkesztoComponent - RECEPT TÖRLÉS CANCEL');
                this.confirmationService.close();
            }
        });
    }

    receptTorlesAccept() {
        this.receptTorlesConfirmPopup.accept();
    }

    receptTorlesReject() {
        this.receptTorlesConfirmPopup.reject();
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
