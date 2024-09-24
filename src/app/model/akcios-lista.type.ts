import { YYYYMMDDToDate, dateToYYYYMMDD } from "../utils";
import { AkciosListaIF } from "./akcios-lista.interface";

export class AkciosLista {

    azon: string;
    kezdoNap: Date;
    kezdonapForras: string;
    vegeNap: Date;
    vegeNapForras: string;

    static convertFromIfList(list: AkciosListaIF[]): AkciosLista[] {
        const result: AkciosLista[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new AkciosLista(li));
            });
        }
        return result;
    }

    constructor(lista?: AkciosListaIF) {

        if (lista) {
            this.azon = lista.azon;
            this.kezdonapForras = lista.kezdoNap;
            console.debug(YYYYMMDDToDate(lista.kezdoNap, 6));
            this.vegeNapForras = lista.vegeNap;
            console.debug(YYYYMMDDToDate(lista.vegeNap, 6));

            this.kezdoNap = YYYYMMDDToDate(lista.kezdoNap, 6);
            this.vegeNap = YYYYMMDDToDate(lista.vegeNap, 6)
        } else {
            this.azon = 'AL' + (new Date()).getTime();
            this.kezdonapForras = null;
            this.kezdoNap = null;
            this.vegeNapForras = null;
            this.vegeNap = null;
        }
    }


    convertForSave(): AkciosListaIF {
        return {
            azon: this.azon,
            kezdoNap: dateToYYYYMMDD(this.kezdoNap),
            vegeNap: dateToYYYYMMDD(this.vegeNap)
        };
    }

}