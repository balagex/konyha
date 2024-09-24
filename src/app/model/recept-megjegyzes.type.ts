import { ReceptMegjegyzesIF } from "./recept-megjegyzes.interface";

export class ReceptMegjegyzes {

    duma: string;
    felhasznaloAzon: string;
    idopont: Date;

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
            this.idopont = new Date(megjegyzes.idopont);
        } else {
            this.duma = null;
            this.felhasznaloAzon = null;
            this.idopont = new Date();
        }
    }


    convertForSave(): ReceptMegjegyzesIF {
        return {
            duma: this.duma,
            felhasznaloAzon: this.felhasznaloAzon,
            idopont: this.idopont ? this.idopont.getTime() : null
        };
    }

}