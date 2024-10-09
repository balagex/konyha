import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Recept } from '../../model/recept.type';
import { AdatServiceService } from '../../adat-service.service';
import { cloneDeep } from 'lodash';
import { GrowlService } from '../growl/growl.service';
import { GrowlMsg } from '../../model/groel-msg.type';

@Component({
    selector: 'app-recept-lista',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, NgClass],
    templateUrl: './recept-lista.component.html',
    styleUrl: './recept-lista.component.scss'
})
export class ReceptListaComponent {

    mobilE = input<boolean>(false);
    // Mivel a main komponens úgy lett elkészítve, hogy két helyen is tartalmazza ezt a komponenst a mobilE bemenet különböző
    // megadásával, így ebből a komponensból a különbüző módokban külön példányok jönnek létre, így ha ebbe kerülnének 
    // a szűréshez kapcsolódó változók és lista szűrés, akkor egyesetleges mód váltásnál a másik példány ezekről semmit nem
    // tudna. Emiatt a változók és az arra alapuló szűrés átkerült az AdatServiceService hatáskörébe.

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
        return this.adatServiceService.jeloltReceptLista();
    });

    kivalasztottReceptAzon = computed<string>(() => {
        return this.adatServiceService.kivalasztottRecept()?.azon;
    });


    receptKivalasztva = output<Recept>();

    constructor(private adatServiceService: AdatServiceService, private growlService: GrowlService) { }

    kedvenceketEAllitas(): void {
        this.adatServiceService.csakKedvencekE.set(!this.adatServiceService.csakKedvencekE());
    }

    listaRendezes(): void {
        const aktualisSorrend = this.adatServiceService.sortDir();
        this.adatServiceService.sortDir.set(aktualisSorrend === 1 ? -1 : 1);
    }

    csakSajatEAllitas(): void {
        this.adatServiceService.csakSajatE.set(!this.adatServiceService.csakSajatE());
    }

    szuroSzovegAllitas(szoveg: string): void {
        this.adatServiceService.listaSzuroSzoveg.set(szoveg);
    }

    szuroTorles(): void {
        this.adatServiceService.listaSzuroSzoveg.set('');
    }

    receptKivalasztas(kivalasztottRecept: Recept): void {
        this.adatServiceService.kivalasztottRecept.set(kivalasztottRecept);
        // const uzi = new GrowlMsg(kivalasztottRecept.nev, kivalasztottRecept.sajatE ? 'info' : 'hiba')
        // this.growlService.idozitettUzenetMegjelenites(uzi, kivalasztottRecept.sajatE ? 2000 : 0);
        const masolat = cloneDeep(kivalasztottRecept);
        this.adatServiceService.szerkesztendoRecept.set(masolat);
        if (this.mobilE) {
            this.receptKivalasztva.emit(kivalasztottRecept);
        }
    }

}
