import { ReceptLinkIF } from "./recept-link.interface";
import { ReceptLink } from "./recept-link.type";
import { ReceptMegjegyzesIF } from "./recept-megjegyzes.interface";
import { ReceptMegjegyzes } from "./recept-megjegyzes.type";
import { ReceptIF } from "./recept.interface";

export class Recept {

    azon: string;
    nev: string;
    keszites: string;
    leiras: string;
    gazdaFelhasznaloAzon: string;
    kepek: string[];
    linkek: ReceptLink[];
    megjegyzesek: ReceptMegjegyzes[];
    // származtatott érték, a kedvenxek lekérése után lehet a bejelentkezett felhazsnáló kapcsán megvizsgálni, hogy
    // az adott recept kedvenc-e
    kedvencE: boolean = false;
    // származtatott érték, a bejelentkezett felhasználó azonja és a tulaj összehasonlítása alapján
    sajatE: boolean = false;

    static convertFromIfList(list: ReceptIF[]): Recept[] {
        const result: Recept[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new Recept(li));
            });
        }
        return result;
    }

    static convertFromObject(objektum: any): Recept[] {
        const result: Recept[] = [];
        for (const [k, v] of Object.entries(objektum)) {
            console.debug('objektumban lévő recept kulcsa  és értéke', k, v);
            const adatIf = v as ReceptIF;
            result.push(new Recept(adatIf));
        }
        return result;
    }

    constructor(recept?: ReceptIF) {
        if (recept) {
            this.azon = recept.azon;
            this.nev = recept.nev;
            this.keszites = recept.keszites;
            this.leiras = recept.leiras;
            this.gazdaFelhasznaloAzon = recept.gazdaFelhasznaloAzon;
            this.kepek = recept.kepek ? recept.kepek : [];
            this.linkek = [];
            if (recept.linkek && recept.linkek.length > 0) {
                recept.linkek.forEach(rli => {
                    const rl = new ReceptLink(rli);
                    this.linkek.push(rl);
                });
            }
            this.megjegyzesek = [];
            if (recept.megjegyzesek && recept.megjegyzesek.length > 0) {
                recept.megjegyzesek.forEach(rmi => {
                    const rm = new ReceptMegjegyzes(rmi);
                    this.megjegyzesek.push(rm);
                });
            }
            this.kedvencE = false;
            this.sajatE = false;
        } else {
            this.azon = 'RE' + (new Date()).getTime();
            this.nev = null;
            this.keszites = null;
            this.leiras = null;
            this.gazdaFelhasznaloAzon = null;
            this.kepek = [];
            this.linkek = [];
            this.megjegyzesek = [];
            this.kedvencE = false;
            this.sajatE = false;
        }
    }


    convertForSave(): ReceptIF {

        const linkLista: ReceptLinkIF[] = [];
        if (this.linkek && this.linkek.length > 0) {
            this.linkek.forEach(rl => {
                const rli = rl.convertForSave();
                linkLista.push(rli);
            });
        }

        const megjegyzesLista: ReceptMegjegyzesIF[] = [];
        if (this.megjegyzesek && this.megjegyzesek.length > 0) {
            this.megjegyzesek.forEach(rm => {
                const rmi = rm.convertForSave();
                megjegyzesLista.push(rmi);
            });
        }

        return {
            azon: this.azon,
            nev: this.nev,
            keszites: this.keszites,
            leiras: this.leiras,
            gazdaFelhasznaloAzon: this.gazdaFelhasznaloAzon,
            kepek: this.kepek ? this.kepek : [],
            linkek: linkLista,
            megjegyzesek: megjegyzesLista
        };
    }

}