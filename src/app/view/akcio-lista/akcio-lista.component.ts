import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdatServiceService } from '../../adat-service.service';
import { FireAuthService } from '../../fire-auth.service';
import { BOLTOK } from '../../common.constants';
import { Component, Input, ViewChild, computed, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AkcioTetel } from '../../model/akcio-tetel.type';
import { AkciosLista } from '../../model/akcios-lista.type';
import { BoltAzon } from '../../model/bolt-azon.enum';
import { NgClass } from '@angular/common';
import { AkcioListaFelvetelComponent } from '../akcio-lista-felvetel/akcio-lista-felvetel.component';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { YYYYMMDDToDate, dateToYYYYMMDD, doCompare, sortFunction } from '../../utils';

@Component({
    selector: 'app-akcio-lista',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, NgClass, AkcioListaFelvetelComponent, ConfirmPopupModule],
    providers: [ConfirmationService],
    templateUrl: './akcio-lista.component.html',
    styleUrl: './akcio-lista.component.scss'
})
export class AkcioListaComponent {

    @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;

    @Input() mobilE: boolean = false;

    loading: boolean = false;
    // boltok = BoltAzon;
    boltok = BOLTOK;

    keresoGombSzoveg = signal<'Mind' | 'Mai' | 'Ma+'>('Mind');
    boltSzuro = signal<BoltAzon[]>([]);
    szuroSzoveg = signal<string>('');

    public ujListaModalLathato: boolean = false;

    // BOLTOK - IDŐSZAKOK - tétel lista
    public tetelAdatok: Map<string, Map<string, AkcioTetel[]>> = new Map<string, Map<string, AkcioTetel[]>>();

    // searchTerm = signal('');
    // searchFor = toSignal(toObservable(this.searchTerm).pipe(debounceTime(1000)), {
    //     initialValue: '',
    // });

    public _keresoSzoveg: any = null;
    public get keresoSzoveg(): any {
        return this._keresoSzoveg;
    }
    public set keresoSzoveg(newValue: any) {
        this._keresoSzoveg = newValue;
        console.debug('AkcioListaComponent - kereső szöveg változott ', newValue);
    }

    kivalasztottLista = computed<AkciosLista>(() => {
        return this.adatServiceService.kivalasztottLista();
    });

    kivalasztottTetel = computed<AkcioTetel>(() => {
        return this.adatServiceService.kivalasztottTetel();
    });

    nagyiMod = computed<boolean>(() => {
        return this.adatServiceService.nagyiMod();
    });

    kivalasztottListaTetelei = computed<Map<BoltAzon, Map<string, AkcioTetel[]>>>(() => {
        const kivalasztottLista = this.adatServiceService.kivalasztottLista();
        const fullLista = this.adatServiceService.akciosTetelLista();
        const keresesiIdo = this.keresoGombSzoveg();
        const boltSzuro = this.boltSzuro();
        const szuroSzoveg = this.szuroSzoveg();

        // console.debug('AkcioListaComponent - kivalasztottListaTetelei ', kivalasztottLista, fullLista);
        if (kivalasztottLista && fullLista && fullLista.length > 0) {
            const adatMap: Map<BoltAzon, Map<string, AkcioTetel[]>> = new Map<BoltAzon, Map<string, AkcioTetel[]>>();
            const rendezettAdatMap: Map<BoltAzon, Map<string, AkcioTetel[]>> = new Map<BoltAzon, Map<string, AkcioTetel[]>>();
            const maStr = dateToYYYYMMDD(new Date());
            const ma = YYYYMMDDToDate(maStr, 6);

            let hetiLista = this.adatServiceService.akciosTetelLista().filter(tetel => tetel.listaAzon == kivalasztottLista.azon &&
                (this.boltSzuro().length === 0 || (this.boltSzuro().findIndex(sz => sz == tetel.boltAzon) > -1)) &&
                (szuroSzoveg.length < 1 || (tetel.nev.toLowerCase().indexOf(szuroSzoveg.toLowerCase()) > -1)));
            if (this.keresoGombSzoveg() === 'Mai') {
                hetiLista = hetiLista.filter(t => ma >= t.kezdoNap && ma <= t.vegeNap);
            } else if (this.keresoGombSzoveg() === 'Ma+') {
                hetiLista = hetiLista.filter(t => (ma >= t.kezdoNap && ma <= t.vegeNap) || t.kezdoNap >= ma);
            }
            if (hetiLista?.length > 0) {
                hetiLista.forEach(tetel => {
                    if (adatMap.has(tetel.boltAzon)) {
                        const intervallumMap = adatMap.get(tetel.boltAzon);
                        if (intervallumMap.has(tetel.intervallum)) {
                            let intervallumElemek = intervallumMap.get(tetel.intervallum);
                            intervallumElemek.push(tetel);
                            intervallumMap.set(tetel.intervallum, intervallumElemek);
                        } else {
                            intervallumMap.set(tetel.intervallum, [tetel]);
                        }
                        adatMap.set(tetel.boltAzon, intervallumMap);
                    } else {
                        const intervallumMap: Map<string, AkcioTetel[]> = new Map<string, AkcioTetel[]>();
                        intervallumMap.set(tetel.intervallum, [tetel]);
                        adatMap.set(tetel.boltAzon, intervallumMap);
                    }
                });
            }
            console.debug('AkcioListaComponent - heti lista ', hetiLista, keresesiIdo, boltSzuro, szuroSzoveg, adatMap);
            adatMap.forEach((value: Map<string, AkcioTetel[]>, key: BoltAzon) => {
                const sortedMapValue = new Map([...value.entries()].sort());
                sortedMapValue.forEach((innerValue: AkcioTetel[], innerKey: string) => {
                    innerValue.sort((a, b) => {
                        return sortFunction(a, b, 1, 'nev', null, true);
                    });
                });
                rendezettAdatMap.set(key, sortedMapValue);
            });
            // return hetiLista;
            return rendezettAdatMap;
        } else {
            return new Map<BoltAzon, Map<string, AkcioTetel[]>>();
            // return [];
        }
    });

    // kivalasztottListaChangeEffect = effect(() => {
    //     console.debug('AkcioListaComponent - kivalasztottListaChangeEffect: ', this.adatServiceService.kivalasztottLista());
    // });

    // kivalasztottListaTeteleiChangeEffect = effect(() => {
    //     console.debug('AkcioListaComponent - kivalasztottListaTeteleiChangeEffect: ', this.kivalasztottListaTetelei());
    // });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService, private confirmationService: ConfirmationService) {
    }

    ngOnInit() {
    }

    load() {
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
            this.fireAuthService.logout();
        }, 2000);
    }

    boltSzuroKlikk(bolt: any): void {
        console.debug('AkcioListaComponent - boltSzuroKlikk: ', bolt);
        const boltSzuro = this.boltSzuro();
        if (boltSzuro.indexOf(bolt.id) > -1) {
            const ujLista = boltSzuro.filter(value => value !== bolt.id);
            console.debug('AkcioListaComponent - boltSzuroKlikk: ', ujLista);
            this.boltSzuro.set(ujLista);
        } else {
            const ujLista = boltSzuro.concat([bolt.id])
            this.boltSzuro.set(ujLista);
        }
    }

    ezKijeloltBolt(bolt: any): boolean {
        return this.boltSzuro().indexOf(bolt.id) > -1;
    }

    rotalas(): void {
        if (this.keresoGombSzoveg() === 'Mind') {
            this.keresoGombSzoveg.set('Mai');
        } else if (this.keresoGombSzoveg() === 'Mai') {
            this.keresoGombSzoveg.set('Ma+')
        } else {
            this.keresoGombSzoveg.set('Mind')
        }
    }

    szuroTorles(): void {
        console.debug('AkcioListaComponent - szuroTorles');
        this.szuroSzoveg.set('');
        this.boltSzuro.set([]);
    }

    // késleltetett bevitel esetén minta megoldás
    // kereses(event: any): void {
    //     console.debug('AkcioListaComponent - kereses ', event);
    //     this.searchTerm.set(event);

    // }

    ujListaFelvetelInditas(): void {
        console.debug('AkcioListaComponent - ujListaFelvetele indul');
        this.ujListaModalLathato = true;
    }

    ujFelvetelKesz(eredmeny: boolean): void {
        console.debug('AkcioListaComponent - ujFelvetelKesz', eredmeny);
        this.ujListaModalLathato = false;
    }

    tetelKijeloles(tetel: AkcioTetel): void {
        console.debug('AkcioListaComponent - tetelKijeloles', tetel);
        this.adatServiceService.kivalasztottTetel.set(tetel);
    }

    tetelModositas(tetel: AkcioTetel): void {
        console.debug('AkcioListaComponent - tetelModositas', tetel);
        this.adatServiceService.kivalasztottTetel.set(tetel);
    }

    tetelTorles(event: Event, tetel: AkcioTetel): void {
        console.debug('AkcioListaComponent - tetelTorles', event, tetel);
        this.adatServiceService.kivalasztottTetel.set(tetel);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Biztos töröli a(z) ' + tetel?.nev + ' nevű tételt?',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                console.debug('AkcioListaComponent - tetelTorles OK');
                const tetelek = this.adatServiceService.akciosTetelLista().filter(t => t.azon !== tetel.azon);
                this.adatServiceService.akciosTetelLista.set(tetelek);
                this.adatServiceService.kivalasztottTetel.set(null);
                this.adatServiceService.mentendoAdatokMentese(this.fireAuthService.getToken()).subscribe({
                    next: (mentettTetelek) => {
                        console.debug('AkcioListaComponent - A törlés és a mentendő tételek mentése után lekért akciós tételek: ', mentettTetelek);
                    },
                    error: (modositasError) => {
                        console.error('AkcioListaComponent - HIBA AZ AKCIOS TÉTELEK MÓDOSÍTÁSA SORÁN ', modositasError);
                        // TODO: kitalálni mi legyen
                    }
                });
                this.confirmationService.close();
            },
            reject: () => {
                console.debug('AkcioListaComponent - tetelTorles CANCEL');
                this.confirmationService.close();
            }
        });
    }

    accept() {
        this.confirmPopup.accept();
    }

    reject() {
        this.confirmPopup.reject();
    }

}



