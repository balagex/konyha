import { ReceptOsszetevoIF } from "./recept-osszetevo.interface";

export class ReceptOsszetevo {

    nev: string;
    mennyiseg: string;
    sorrend: number;

    static convertFromIfList(list: ReceptOsszetevoIF[]): ReceptOsszetevo[] {
        const result: ReceptOsszetevo[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new ReceptOsszetevo(li));
            });
        }
        return result;
    }

    constructor(osszetevo?: ReceptOsszetevoIF) {
        if (osszetevo) {
            this.nev = osszetevo.nev;
            this.mennyiseg = osszetevo.mennyiseg;
            this.sorrend = osszetevo.sorrend
        } else {
            this.nev = null;
            this.mennyiseg = null;
            this.sorrend = null;
        }
    }


    convertForSave(): ReceptOsszetevoIF {
        return {
            nev: this.nev,
            mennyiseg: this.mennyiseg,
            sorrend: this.sorrend
        };
    }

}