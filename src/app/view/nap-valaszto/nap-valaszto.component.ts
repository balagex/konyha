import { Component, EventEmitter, Input, Output } from '@angular/core';
import { napRovidites } from '../../utils';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-nap-valaszto',
    standalone: true,
    imports: [NgClass],
    templateUrl: './nap-valaszto.component.html',
    styleUrl: './nap-valaszto.component.scss'
})
export class NapValasztoComponent {

    @Input() napok: Date[] = [];
    @Input() kivalasztottNap: Date = null;
    @Output() napValasztas = new EventEmitter<Date>();

    napKivalasztasa(nap: Date): void {
        console.debug('NapValasztoComponent - napKivalasztasa...', nap);
        this.kivalasztottNap = nap;
        this.napValasztas.emit(nap);
    }

    napNev(nap: Date): string {
        return napRovidites(nap, 'hu-HU');
    }

}
