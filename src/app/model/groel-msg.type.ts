export class GrowlMsg {
    uzenet: string;
    tipus: 'info' | 'hiba';

    constructor(uzenet: string, tipus: 'info' | 'hiba' = 'info') {
        this.uzenet = uzenet;
        this.tipus = tipus;
    }
}