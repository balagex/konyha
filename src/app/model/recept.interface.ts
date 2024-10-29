import { ReceptLinkIF } from "./recept-link.interface";
import { ReceptMegjegyzesIF } from "./recept-megjegyzes.interface";
import { ReceptOsszetevoIF } from "./recept-osszetevo.interface";

export interface ReceptIF {
    azon: string;
    nev: string;
    keszites: string;
    leiras: string;
    gazdaFelhasznaloAzon: string;
    osszetevok: ReceptOsszetevoIF[];
    linkek: ReceptLinkIF[];
    megjegyzesek: ReceptMegjegyzesIF[];
}