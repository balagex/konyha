import { Component, computed, input, linkedSignal, model, signal } from '@angular/core';
import { ReceptOsszetevo } from '../../model/recept-osszetevo.type';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableEditCompleteEvent, TableModule, TableRowSelectEvent } from 'primeng/table';
import { sortFunction } from '../../utils';
import { AdatServiceService } from '../../adat-service.service';
import { Recept } from '../../model/recept.type';

@Component({
    selector: 'app-recept-osszetevo-kezelo',
    imports: [ButtonModule, FormsModule, TableModule],
    templateUrl: './recept-osszetevo-kezelo.component.html',
    styleUrl: './recept-osszetevo-kezelo.component.scss'
})
export class ReceptOsszetevoKezeloComponent {

    szerkesztettOsszetevok = linkedSignal({
        source: this.adatServiceService.szerkesztendoRecept,
        computation: (recept) => this.receptOsszetevoSorrendezes(recept)
    });

    kivalasztottSorIndex = linkedSignal({
        source: this.adatServiceService.szerkesztendoRecept,
        computation: () => null as number
    });

    sajatE = computed(() => {
        this.adatServiceService.szerkesztendoRecept().sajatE
    });

    public kivalasztottOsszetevo = model<ReceptOsszetevo>(null);

    constructor(private adatServiceService: AdatServiceService) { }

    receptOsszetevoSorrendezes(recept: Recept): ReceptOsszetevo[] {
        const kapottOsszetevok: ReceptOsszetevo[] = recept?.osszetevok?.length > 0 ? recept.osszetevok : [];

        // Ellőbb a kapott sorrend szerint besorrendezzük, majd as esetleges üres sorrend érték, vagy azonos értékek miatt
        // ez alapján index szerint minden tételnek egyedi sorrend értéket adunk.
        const sorrendezettOsszetevok = kapottOsszetevok.sort((a, b) => {
            return sortFunction(a, b, 1, 'sorrend', null, false);
        });
        sorrendezettOsszetevok.forEach((o, i) => o.sorrend = i + 1);

        return sorrendezettOsszetevok;
    }

    ujOsszetevoRogzitesInditas(): void {
        const ujOsszetevo = new ReceptOsszetevo();
        ujOsszetevo.nev = '';
        ujOsszetevo.mennyiseg = '';
        ujOsszetevo.sorrend = this.szerkesztettOsszetevok()?.length + 1;
        const osszetevoLista = this.szerkesztettOsszetevok();
        osszetevoLista.push(ujOsszetevo);
        this.szerkesztettOsszetevok.set(osszetevoLista);
        // console.debug('ReceptOsszetevoKezeloComponent - ujOsszetevoRogzitesInditas', this.szerkesztesiAdatok()?.osszetevok());
    }

    sorTorles(torlendoOsszetevo: ReceptOsszetevo, sorIndex: number): void {
        const lista = this.szerkesztettOsszetevok();
        lista.splice(sorIndex, 1);
        this.szerkesztettOsszetevok.set(lista);
    }

    sorKivalasztas(esemeny: TableRowSelectEvent): void {
        if (esemeny?.index !== null && esemeny?.index !== undefined) {
            this.kivalasztottSorIndex.set(esemeny.index);
        }
        // console.debug('ReceptOsszetevoKezeloComponent - sorKivalasztas', esemeny, this.szerkesztesiAdatok()?.osszetevok());
    }

    osszetevoLe(): void {
        // console.debug('ReceptOsszetevoKezeloComponent - osszetevoLe', this.szerkesztesiAdatok());
        const index = this.kivalasztottSorIndex();
        this.helycsere(index, index + 1);
        this.kivalasztottSorIndex.set(index + 1);
    }

    osszetevoFel(): void {
        // console.debug('ReceptOsszetevoKezeloComponent - osszetevoFel', this.szerkesztesiAdatok());
        const index = this.kivalasztottSorIndex();
        this.helycsere(index, index - 1);
        this.kivalasztottSorIndex.set(index - 1);
    }

    helycsere(kitIndex: number, kireIndex: number): void {
        // console.debug('ReceptOsszetevoKezeloComponent - helycsere', kitIndex, kireIndex);
        if (kitIndex !== null && kireIndex !== null && this.szerkesztettOsszetevok()?.length > kitIndex && this.szerkesztettOsszetevok()?.length > kireIndex) {
            // console.debug('ReceptOsszetevoKezeloComponent - helycsere érvényes adatok mehet a csere...');
            const osszetevok = this.szerkesztettOsszetevok();
            const egyik = osszetevok[kitIndex];
            osszetevok[kitIndex] = osszetevok[kireIndex];
            osszetevok[kireIndex] = egyik;
            osszetevok.forEach((o, i) => o.sorrend = i + 1);
            this.szerkesztettOsszetevok.set(osszetevok);
        }
    }

    szerkesztesTortent(esemeny: TableEditCompleteEvent): void {
        // console.debug('ReceptOsszetevoKezeloComponent - szerkesztesTortent', esemeny);
    }

    sorrendAllitas(): void {
        if (this.szerkesztettOsszetevok()?.length > 0) {
            const osszetevok = this.szerkesztettOsszetevok();
            osszetevok.forEach((o, i) => o.sorrend = i + 1);
            this.szerkesztettOsszetevok.set(osszetevok);
        }
    }

}
