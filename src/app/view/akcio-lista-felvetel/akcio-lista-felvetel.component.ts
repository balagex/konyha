import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { AdatServiceService } from '../../adat-service.service';
import { FormsModule } from '@angular/forms';
import { AkciosLista } from '../../model/akcios-lista.type';
import { FireAuthService } from '../../fire-auth.service';
import { YYYYMMDDToDate, dateToYYYYMMDD, sortFunction } from '../../utils';

@Component({
    selector: 'app-akcio-lista-felvetel',
    standalone: true,
    imports: [CalendarModule, ButtonModule, FormsModule],
    templateUrl: './akcio-lista-felvetel.component.html',
    styleUrl: './akcio-lista-felvetel.component.scss'
})
// hát a szerkesztésre is ezt használjuk, de nem lett átnevezve másra...
export class AkcioListaFelvetelComponent {

    @Output() kesz = new EventEmitter<boolean>();
    @Input() szerkesztendoListaAzon: string = null;
    @Input() listaIntervallumDatumok: Date[] | undefined = [];

    public dateFormat: string = 'yy.mm.dd.';

    public listaFelvetelHiba = signal<string>('');

    modositandoLista = computed<AkciosLista>(() => {
        return this.adatServiceService.akciosListakLista().find(lista => lista.azon == this.szerkesztendoListaAzon);
    });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService) {
    }

    ujListaFelvetele(): void {
        console.debug('AkcioListaFelvetelComponent - ujListaFelvetele kő', this.listaIntervallumDatumok);
        if (this.intervallumMegadott()) {
            const ujLista: AkciosLista = new AkciosLista();
            const start = YYYYMMDDToDate(dateToYYYYMMDD(this.listaIntervallumDatumok[0]), 6);
            const end = YYYYMMDDToDate(dateToYYYYMMDD(this.listaIntervallumDatumok[1]), 6);
            ujLista.kezdoNap = start;
            ujLista.vegeNap = end;
            this.adatServiceService.akciosListaFelvetel(ujLista, this.fireAuthService.getToken()).subscribe({
                next: (listak) => {
                    console.debug('AkcioListaFelvetelComponent - A felvétel után lekért akciós listák: ', listak);
                    const rendezettListak = listak.sort((a, b) => {
                        return sortFunction(a, b, -1, 'kezdoNap', 'vegeNap', false);
                    });
                    this.adatServiceService.akciosListakLista.set(rendezettListak);
                    const mentettUjLista = this.adatServiceService.akciosListakLista().find(value => value.azon == ujLista.azon);
                    if (mentettUjLista) {
                        this.adatServiceService.kivalasztottLista.set(mentettUjLista);

                    }
                    this.kesz.emit(true);
                },
                error: (felvetelError) => {
                    console.error('AkcioListaFelvetelComponent - HIBA AZ AKCIOS LISTÁK KIEGÉSZÍTÉSE SORÁN ', felvetelError);
                    // TODO: kitalálni mi legyen
                }
            });
        }
    }

    listaModositasa(): void {
        console.debug('AkcioListaFelvetelComponent - listaModositasa kő', this.listaIntervallumDatumok);
        if (this.intervallumMegadott()) {
            const modositandoLista = this.adatServiceService.akciosListakLista().find(lista => lista.azon == this.szerkesztendoListaAzon);
            if (modositandoLista) {
                console.debug('AkcioListaFelvetelComponent - A módosítandó lista: ', modositandoLista);
                const startStr = dateToYYYYMMDD(this.listaIntervallumDatumok[0]);
                const start = YYYYMMDDToDate(startStr, 6);
                const endStr = dateToYYYYMMDD(this.listaIntervallumDatumok[1]);
                const end = YYYYMMDDToDate(endStr, 6);
                modositandoLista.kezdoNap = start;
                modositandoLista.kezdonapForras = startStr;
                modositandoLista.vegeNap = end;
                modositandoLista.vegeNapForras = endStr;
                const listak = this.adatServiceService.akciosListakLista().filter(x => x.azon !== modositandoLista.azon);
                listak.push(modositandoLista);
                this.adatServiceService.akciosListakMentese(listak, this.fireAuthService.getToken()).subscribe({
                    next: (listak) => {
                        console.debug('AkcioListaFelvetelComponent - A módosítás után lekért akciós listák: ', listak);
                        const rendezettListak = listak.sort((a, b) => {
                            return sortFunction(a, b, -1, 'kezdoNap', 'vegeNap', false);
                        });
                        this.adatServiceService.akciosListakLista.set(rendezettListak);
                        const mentettModositotLista = this.adatServiceService.akciosListakLista().find(value => value.azon == modositandoLista.azon);
                        if (mentettModositotLista) {
                            this.adatServiceService.kivalasztottLista.set(mentettModositotLista);
                        }
                        this.kesz.emit(true);
                    },
                    error: (felvetelError) => {
                        console.error('AkcioListaFelvetelComponent - HIBA AZ AKCIOS LISTÁK MÓDOSÍTÁSA SORÁN ', felvetelError);
                        // TODO: kitalálni mi legyen
                    }
                });

            } else {
                console.error('AkcioListaFelvetelComponent - A szerkesztendő lista nem található a lekért listák között! ', this.szerkesztendoListaAzon);
            }
        }
    }

    listaMegse(): void {
        console.debug('AkcioListaFelvetelComponent - kista elvétele/módosítása NEM kő', this.listaIntervallumDatumok);
        this.kesz.emit(false);
    }

    intervallumMegadott(): boolean {
        return this.listaIntervallumDatumok && this.listaIntervallumDatumok.length > 1 && this.listaIntervallumDatumok[0] != null && this.listaIntervallumDatumok[1] != null;
    }

    hetek(event: any): void {
        console.debug('AkcioListaFelvetelComponent - hetek', event, this.listaIntervallumDatumok);
        if (this.listaIntervallumDatumok && this.listaIntervallumDatumok[0] && this.listaIntervallumDatumok[1]) {
            console.debug('AkcioListaFelvetelComponent - mindkét dátum kitöltött...');
            if (this.adatServiceService.akciosListakLista() && this.adatServiceService.akciosListakLista().length > 0) {
                const startStr = dateToYYYYMMDD(this.listaIntervallumDatumok[0]);
                const start = YYYYMMDDToDate(startStr, 6);
                const endStr = dateToYYYYMMDD(this.listaIntervallumDatumok[1]);
                const end = YYYYMMDDToDate(endStr, 6);
                let hosszHiba: boolean = false;
                let atfedesHiba: boolean = false;
                if (end.getTime() - start.getTime() > 561600000) {
                    console.error('AkcioListaFelvetelComponent - A megadott intervallum hossza nagyobb mint 7 nap!');
                    hosszHiba = true;
                } else {
                    console.debug('AkcioListaFelvetelComponent - A megadott intervallum hossza nem nagyobb, mint 7 nap.', end.getTime() - start.getTime());
                }
                this.adatServiceService.akciosListakLista().forEach(al => {
                    console.debug('AkcioListaFelvetelComponent - start + end', start, startStr, end, endStr);
                    if ((startStr <= al.kezdonapForras && endStr >= al.kezdonapForras) ||
                        (startStr <= al.kezdonapForras && endStr >= al.vegeNapForras) ||
                        (startStr <= al.vegeNapForras && endStr >= al.vegeNapForras)) {
                        if (this.szerkesztendoListaAzon == null || this.szerkesztendoListaAzon !== al.azon) {
                            console.error('AkcioListaFelvetelComponent - A megadott intervallum átfedésben van egy már rögzített intervallummal !', al);
                            atfedesHiba = true;
                        } else {
                            console.debug('AkcioListaFelvetelComponent - Az átfedés a szerkesztés miatt van.', al, this.szerkesztendoListaAzon);
                        }
                    } else {
                        console.debug('AkcioListaFelvetelComponent - A megadott intervallum nincs átfedésben ezzel a már rögzített intervallummal:', al);
                    }
                    // 6 nap eltérés milisecundumban 518400000, de még fél napot hozzáadunk az évszak váltás miatt tuti ami tuti 561600000
                });
                if (hosszHiba) {
                    if (atfedesHiba) {
                        this.listaFelvetelHiba.set('A megadott intervallum hossza nagyobb mint 7 nap és átfedésben van egy már rögzített intervallummal!');
                    } else {
                        this.listaFelvetelHiba.set('A megadott intervallum hossza nagyobb mint 7 nap!');
                    }
                } else {
                    if (atfedesHiba) {
                        this.listaFelvetelHiba.set('A megadott intervallum átfedésben van egy már rögzített intervallummal!');
                    } else {
                        if (this.szerkesztendoListaAzon) {
                            // TODO: lista intervallum módosítás esetén végignyalni a listat tételeit, hogy kilóg-e valaki belőle.
                            const listaTetelei = this.adatServiceService.akciosTetelLista().filter(t => t.listaAzon == this.szerkesztendoListaAzon);
                            let vanKilogoTetel = false;
                            if (listaTetelei?.length > 0) {
                                const kilogoTetelek = listaTetelei.filter(x => dateToYYYYMMDD(x.kezdoNap) > endStr || dateToYYYYMMDD(x.kezdoNap) < startStr || dateToYYYYMMDD(x.vegeNap) < startStr || dateToYYYYMMDD(x.vegeNap) > endStr);
                                if (kilogoTetelek?.length > 0) {
                                    this.listaFelvetelHiba.set('A módosítandó listához tartozik olyan tétel, mely intervalluma kilóg a megadott intervallumból!');
                                } else {
                                    this.listaFelvetelHiba.set('');
                                }
                            }

                        } else {
                            this.listaFelvetelHiba.set('');
                        }
                    }
                }
            }

        }
    }

}
