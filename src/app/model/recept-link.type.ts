import { ReceptLinkIF } from "./recept-link.interface";

export class ReceptLink {

    link: string;
    nev: string;

    static convertFromIfList(list: ReceptLinkIF[]): ReceptLink[] {
        const result: ReceptLink[] = [];
        if (list && list.length > 0) {
            list.forEach(li => {
                result.push(new ReceptLink(li));
            });
        }
        return result;
    }

    constructor(rl?: ReceptLinkIF) {
        if (rl) {
            this.link = rl.link;
            this.nev = rl.nev;
        } else {
            this.link = null;
            this.nev = null;
        }
    }


    convertForSave(): ReceptLinkIF {
        return {
            link: this.link,
            nev: this.nev
        };
    }

}