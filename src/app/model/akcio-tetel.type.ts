import { YYYYMMDDToDate, dateToYYYYMMDD, napRovidites } from "../utils";
import { AkcioTetelIF } from "./akcio-tetel.interface";
import { BoltAzon, getBoltAzonViaString } from "./bolt-azon.enum";

export class AkcioTetel {

    azon: string;
    listaAzon: string;
    boltAzon: BoltAzon;
    kezdoNap: Date;
    kezdoNapNevRov: string;
    vegeNap: Date;
    vegeNapNevRov: string;
    intervallum: string;
    nev: string;
    kiemeltE: boolean;
    megjegyzes?: string;
    mentendo: boolean;

    static convertFromIfList(list: AkcioTetelIF[]): AkcioTetel[] {
        const result: AkcioTetel[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new AkcioTetel(li));
            });
        }
        return result;
    }

    constructor(tetel?: AkcioTetelIF) {
        if (tetel) {
            this.azon = tetel.azon;
            this.listaAzon = tetel.listaAzon;
            this.boltAzon = getBoltAzonViaString(tetel.boltAzon);
            this.kezdoNap = YYYYMMDDToDate(tetel.kezdoNap, 6);
            this.kezdoNapNevRov = this.kezdoNap && this.kezdoNap instanceof Date ? napRovidites(this.kezdoNap, 'hu-HU') : '';
            this.vegeNap = YYYYMMDDToDate(tetel.vegeNap, 6);
            this.vegeNapNevRov = this.vegeNap && this.vegeNap instanceof Date ? napRovidites(this.vegeNap, 'hu-HU') : '';
            this.intervallum = tetel.kezdoNap + '-' + tetel.vegeNap;
            this.nev = tetel.nev;
            this.kiemeltE = tetel.kiemeltE !== null && tetel.kiemeltE !== undefined ? tetel.kiemeltE : false;
            this.megjegyzes = tetel.megjegyzes;
            this.mentendo = false;
        } else {
            this.azon = 'AT' + (new Date()).getTime();
            this.listaAzon = null;
            this.boltAzon = BoltAzon.LIDL;
            this.kezdoNap = null;
            this.vegeNap = null;
            this.nev = '';
            this.kiemeltE = false;
            this.megjegyzes = '';
            this.mentendo = true;
        }
    }


    convertForSave(): AkcioTetelIF {
        return {
            azon: this.azon,
            listaAzon: this.listaAzon,
            boltAzon: this.boltAzon,
            kezdoNap: dateToYYYYMMDD(this.kezdoNap),
            vegeNap: dateToYYYYMMDD(this.vegeNap),
            nev: this.nev,
            kiemeltE: this.kiemeltE,
            megjegyzes: this.megjegyzes
        };
    }

}