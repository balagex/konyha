import { NgClass } from '@angular/common';
import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Recept } from '../../model/recept.type';
import { AdatServiceService } from '../../adat-service.service';
import { sortFunction } from '../../utils';

@Component({
    selector: 'app-recept-lista',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, NgClass],
    templateUrl: './recept-lista.component.html',
    styleUrl: './recept-lista.component.scss',
    // host: { 'class': 'helykitolto receptlista' }
})
export class ReceptListaComponent {

    mobilE = input<boolean>(false);
    public sortDir = signal<1 | -1>(1); // asc: 1, desc: -1
    public szuroSzoveg = model('');

    rendezesGombIkon = computed<string>(() => {
        return this.sortDir() === 1 ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-down-alt';
    });

    receptLista = computed<Recept[]>(() => {
        const sajatReceptek = this.adatServiceService.sajatReceptLista()
            .filter(tetel => (this.szuroSzoveg().length < 1 || (tetel.nev.toLowerCase().indexOf(this.szuroSzoveg().toLowerCase()) > -1)))
            .sort((a, b) => {
                return sortFunction(a, b, this.sortDir(), 'nev', null, false);
            });
        return sajatReceptek;
    });

    constructor(private adatServiceService: AdatServiceService) { }

    listaRendezes(): void {
        const aktualisSorrend = this.sortDir();
        this.sortDir.set(aktualisSorrend === 1 ? -1 : 1);
        // TODO: megjelenített lista rendezés
    }

    szuroTorles(): void {
        console.debug('ReceptListaComponent - szuroTorles');
        this.szuroSzoveg.set('');
    }

}
