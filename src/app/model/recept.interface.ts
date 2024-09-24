import { ReceptLinkIF } from "./recept-link.interface";
import { ReceptMegjegyzesIF } from "./recept-megjegyzes.interface";

export interface ReceptIF {
    azon: string;
    nev: string;
    keszites: string;
    leiras: string;
    gazdaFelhasznaloAzon: string;
    kepek: string[];
    linkek: ReceptLinkIF[];
    megjegyzesek: ReceptMegjegyzesIF[];
}