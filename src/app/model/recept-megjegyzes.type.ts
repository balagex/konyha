import { dateToYYYYMMDD, dateToYYYYMMDDhhmmss } from "../utils";
import { ReceptMegjegyzesIF } from "./recept-megjegyzes.interface";

export class ReceptMegjegyzes {

    duma: string;
    felhasznaloAzon: string;
    idopont: string;
    // származtatott, megadja, hogy a bejelentkezett felhasználó által felvett megjegyzése-e
    sajatE: boolean = false;

    static convertFromIfList(list: ReceptMegjegyzesIF[]): ReceptMegjegyzes[] {
        const result: ReceptMegjegyzes[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new ReceptMegjegyzes(li));
            });
        }
        return result;
    }

    constructor(megjegyzes?: ReceptMegjegyzesIF) {
        if (megjegyzes) {
            this.duma = megjegyzes.duma;
            this.felhasznaloAzon = megjegyzes.felhasznaloAzon;
            this.idopont = megjegyzes.idopont;
            this.sajatE = false;
        } else {
            this.duma = null;
            this.felhasznaloAzon = null;
            this.idopont = dateToYYYYMMDDhhmmss(new Date(), true);
            this.sajatE = false;
        }
    }


    convertForSave(): ReceptMegjegyzesIF {
        return {
            duma: this.duma,
            felhasznaloAzon: this.felhasznaloAzon,
            idopont: this.idopont ? this.idopont : null
        };
    }

}