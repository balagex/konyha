import { Component, computed, input, model, signal } from '@angular/core';
import { ReceptOsszetevo } from '../../model/recept-osszetevo.type';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableEditCompleteEvent, TableModule, TableRowSelectEvent } from 'primeng/table';
import { sortFunction } from '../../utils';
import { AdatServiceService } from '../../adat-service.service';

@Component({
    selector: 'app-recept-osszetevo-kezelo',
    standalone: true,
    imports: [ButtonModule, FormsModule, TableModule],
    templateUrl: './recept-osszetevo-kezelo.component.html',
    styleUrl: './recept-osszetevo-kezelo.component.scss'
})
export class ReceptOsszetevoKezeloComponent {

    osszetevok = input.required<ReceptOsszetevo[]>();

    szerkesztesiAdatok = computed(() => {

        const recept = this.adatServiceService.szerkesztendoRecept();
        const kapottOsszetevok: ReceptOsszetevo[] = recept?.osszetevok?.length > 0 ? recept.osszetevok : [];

        // Ellőbb a kapott sorrend szerint besorrendezzük, majd as esetleges üres sorrend érték, vagy azonos értékek miatt
        // ez alapján index szerint minden tételnek egyedi sorrend értéket adunk.
        const sorrendezettOsszetevok = kapottOsszetevok.sort((a, b) => {
            return sortFunction(a, b, 1, 'sorrend', null, false);
        });
        sorrendezettOsszetevok.forEach((o, i) => o.sorrend = i + 1);

        return {
            osszetevok: signal<ReceptOsszetevo[]>(sorrendezettOsszetevok),
            kivalasztottSorIndex: signal<number>(null)
        };
    });

    public kivalasztottOsszetevo = model<ReceptOsszetevo>(null);

    constructor(private adatServiceService: AdatServiceService) { }


    ujOsszetevoRogzitesInditas(): void {
        const ujOsszetevo = new ReceptOsszetevo();
        ujOsszetevo.nev = '';
        ujOsszetevo.mennyiseg = '';
        ujOsszetevo.sorrend = this.szerkesztesiAdatok()?.osszetevok()?.length + 1;
        const osszetevoLista = this.szerkesztesiAdatok()?.osszetevok();
        osszetevoLista.push(ujOsszetevo);
        this.szerkesztesiAdatok()?.osszetevok.set(osszetevoLista);
        // console.debug('ReceptOsszetevoKezeloComponent - ujOsszetevoRogzitesInditas', this.szerkesztesiAdatok()?.osszetevok());
    }

    sorTorles(torlendoOsszetevo: ReceptOsszetevo, sorIndex: number): void {
        // console.debug('ReceptOsszetevoKezeloComponent - sorTorles', torlendoOsszetevo, sorIndex);
        const lista = this.szerkesztesiAdatok().osszetevok();
        lista.splice(sorIndex, 1);
        this.szerkesztesiAdatok().osszetevok.set(lista);
    }

    sorKivalasztas(esemeny: TableRowSelectEvent): void {
        if (esemeny?.index !== null && esemeny?.index !== undefined) {
            this.szerkesztesiAdatok().kivalasztottSorIndex.set(esemeny.index);
        }
        // console.debug('ReceptOsszetevoKezeloComponent - sorKivalasztas', esemeny, this.szerkesztesiAdatok()?.osszetevok());
    }

    osszetevoLe(): void {
        // console.debug('ReceptOsszetevoKezeloComponent - osszetevoLe', this.szerkesztesiAdatok());
        const index = this.szerkesztesiAdatok().kivalasztottSorIndex();
        this.helycsere(index, index + 1);
        this.szerkesztesiAdatok().kivalasztottSorIndex.set(index + 1);
    }

    osszetevoFel(): void {
        // console.debug('ReceptOsszetevoKezeloComponent - osszetevoFel', this.szerkesztesiAdatok());
        const index = this.szerkesztesiAdatok().kivalasztottSorIndex();
        this.helycsere(index, index - 1);
        this.szerkesztesiAdatok().kivalasztottSorIndex.set(index - 1);
    }

    helycsere(kitIndex: number, kireIndex: number): void {
        // console.debug('ReceptOsszetevoKezeloComponent - helycsere', kitIndex, kireIndex);
        if (kitIndex !== null && kireIndex !== null && this.szerkesztesiAdatok()?.osszetevok()?.length > kitIndex && this.szerkesztesiAdatok()?.osszetevok()?.length > kireIndex) {
            // console.debug('ReceptOsszetevoKezeloComponent - helycsere érvényes adatok mehet a csere...');
            const osszetevok = this.szerkesztesiAdatok()?.osszetevok();
            const egyik = osszetevok[kitIndex];
            osszetevok[kitIndex] = osszetevok[kireIndex];
            osszetevok[kireIndex] = egyik;
            osszetevok.forEach((o, i) => o.sorrend = i + 1);
            this.szerkesztesiAdatok()?.osszetevok.set(osszetevok);
        }
    }

    szerkesztesTortent(esemeny: TableEditCompleteEvent): void {
        // console.debug('ReceptOsszetevoKezeloComponent - szerkesztesTortent', esemeny);
    }

    sorrendAllitas(): void {
        if (this.szerkesztesiAdatok()?.osszetevok()?.length > 0) {
            const osszetevok = this.szerkesztesiAdatok()?.osszetevok();
            osszetevok.forEach((o, i) => o.sorrend = i + 1);
            this.szerkesztesiAdatok()?.osszetevok.set(osszetevok);
        }
    }

}
