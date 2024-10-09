import { Injectable, signal } from '@angular/core';
import { GrowlMsg } from '../../model/groel-msg.type';

@Injectable({
    providedIn: 'root'
})
export class GrowlService {

    public uzenet = signal<GrowlMsg>(null);

    public uzenetKesleltetes: any = null;

    constructor() { }

    idozitettUzenetMegjelenites(uzenet: GrowlMsg, ido: number): void {

        if (this.uzenetKesleltetes) {
            clearTimeout(this.uzenetKesleltetes);
        }
        this.uzenet.set(uzenet);
        if (ido > 0) {
            this.uzenetKesleltetes = setTimeout(() => {
                this.uzenet.set(null);
            }, ido);
        }
    }

    uzenetElrejtes(): void {
        if (this.uzenetKesleltetes) {
            clearTimeout(this.uzenetKesleltetes);
        }
        this.uzenet.set(null);
    }
}
