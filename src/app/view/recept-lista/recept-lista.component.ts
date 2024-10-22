import { NgClass } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Recept } from '../../model/recept.type';
import { AdatServiceService } from '../../adat-service.service';
import { cloneDeep } from 'lodash';
import { GrowlService } from '../growl/growl.service';

@Component({
    selector: 'app-recept-lista',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, NgClass],
    templateUrl: './recept-lista.component.html',
    styleUrl: './recept-lista.component.scss'
})
export class ReceptListaComponent {

    // Mivel a main komponens úgy lett először elkészítve, hogy két helyen is tartalmazza ezt a komponenst a mobilE bemenet különböző
    // megadásával, így ebből a komponensból a különbüző módokban külön példányok jöttek létre, így ha ebbe kerültek volna 
    // a szűréshez kapcsolódó változók és lista szűrés, akkor egyesetleges mód váltásnál a másik példány ezekről semmit nem
    // tudott volna. Emiatt a változók és az arra alapuló szűrés átkerült az AdatServiceService hatáskörébe.
    // Miután át lett alakítva a megoldás úgy, hogy csak egy példány használatos, és nincs mobilE bemenet, a dolgok már 
    // nem kerültek ide átmozgatásra a service-ből.

    sortDir = computed<-1 | 1>(() => {
        return this.adatServiceService.sortDir();
    });

    csakKedvencekE = computed<boolean>(() => {
        return this.adatServiceService.csakKedvencekE();
    });

    csakSajatE = computed<boolean>(() => {
        return this.adatServiceService.csakSajatE();
    });

    kedvencGombIkon = computed<string>(() => {
        return this.csakKedvencekE() ? 'pi pi-star-fill' : 'pi pi-star';
    });

    rendezesGombIkon = computed<string>(() => {
        return this.sortDir() === 1 ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-down-alt';
    });

    sajatGombIkon = computed<string>(() => {
        return this.adatServiceService.csakSajatE() ? 'pi pi-user' : 'pi pi-users';
    });

    szuroSzoveg = computed<string>(() => {
        return this.adatServiceService.listaSzuroSzoveg()?.length < 1 ? '' : this.adatServiceService.kesleltetettSzuroSzoveg();
    });

    receptLista = computed<Recept[]>(() => {
        // console.debug('ReceptListaComponent - receptLista', this.adatServiceService.jeloltReceptLista());
        return this.adatServiceService.jeloltReceptLista();
    });

    kivalasztottReceptAzon = computed<string>(() => {
        return this.adatServiceService.kivalasztottRecept()?.azon;
    });

    receptKivalasztva = output<Recept>();

    constructor(private adatServiceService: AdatServiceService, private growlService: GrowlService) { }

    kedvenceketEAllitas(): void {
        this.adatServiceService.csakKedvencekE.set(!this.adatServiceService.csakKedvencekE());
        this.receptKivalasztasTorles();
    }

    listaRendezes(): void {
        const aktualisSorrend = this.adatServiceService.sortDir();
        this.adatServiceService.sortDir.set(aktualisSorrend === 1 ? -1 : 1);
    }

    csakSajatEAllitas(): void {
        this.adatServiceService.csakSajatE.set(!this.adatServiceService.csakSajatE());
        this.receptKivalasztasTorles();
    }

    szuroSzovegAllitas(szoveg: string): void {
        this.adatServiceService.listaSzuroSzoveg.set(szoveg);
    }

    szuroTorles(): void {
        this.adatServiceService.listaSzuroSzoveg.set('');
    }

    receptKivalasztasTorles(): void {
        this.adatServiceService.szerkesztendoRecept.set(null);
        this.adatServiceService.kivalasztottRecept.set(null);
    }

    receptKivalasztas(kivalasztottRecept: Recept): void {
        console.debug('ReceptListaComponent - receptKivalasztas', kivalasztottRecept, kivalasztottRecept instanceof Recept);
        this.adatServiceService.kivalasztottRecept.set(kivalasztottRecept);
        const masolat = cloneDeep(kivalasztottRecept);
        console.debug('ReceptListaComponent - receptKivalasztas', masolat, masolat instanceof Recept);
        this.adatServiceService.szerkesztendoRecept.set(masolat);
        this.receptKivalasztva.emit(kivalasztottRecept);
    }

}
