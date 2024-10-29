import { ReceptOsszetevoIF } from "./recept-osszetevo.interface";

export class ReceptOsszetevo {

    nev: string;
    mennyiseg: string;

    static convertFromIfList(list: ReceptOsszetevoIF[]): ReceptOsszetevo[] {
        const result: ReceptOsszetevo[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new ReceptOsszetevo(li));
            });
        }
        return result;
    }

    constructor(megjegyzes?: ReceptOsszetevoIF) {
        if (megjegyzes) {
            this.nev = megjegyzes.nev;
            this.mennyiseg = megjegyzes.mennyiseg;
        } else {
            this.nev = null;
            this.mennyiseg = null;
        }
    }


    convertForSave(): ReceptOsszetevoIF {
        return {
            nev: this.nev,
            mennyiseg: this.mennyiseg
        };
    }

}