import { KedvencReceptekIF } from "./kedvenc-receptek.interface";

export class KedvencReceptek {

    felhasznaloAzon: string;
    kedvencek: string[];

    static convertFromIfList(list: KedvencReceptekIF[]): KedvencReceptek[] {
        const result: KedvencReceptek[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new KedvencReceptek(li));
            });
        }
        return result;
    }

    constructor(kr?: KedvencReceptekIF) {
        if (kr) {
            this.felhasznaloAzon = kr.felhasznaloAzon;
            this.kedvencek = kr.kedvencek ? kr.kedvencek : [];
        } else {
            this.felhasznaloAzon = null;
            this.kedvencek = [];
        }
    }


    convertForSave(): KedvencReceptekIF {
        return {
            felhasznaloAzon: this.felhasznaloAzon,
            kedvencek: this.kedvencek ? this.kedvencek : []
        };
    }

}