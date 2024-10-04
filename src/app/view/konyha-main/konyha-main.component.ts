import { Component, OnInit, computed, model, signal } from '@angular/core';
import { AdatServiceService } from '../../adat-service.service';
import { FireAuthService } from '../../fire-auth.service';
import { getDatabase, ref, child, get, set, push } from "firebase/database";
import { Recept } from '../../model/recept.type';
import { UJ_SOR } from '../../common.constants';
import { ButtonModule } from 'primeng/button';
import { ReceptListaComponent } from '../recept-lista/recept-lista.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ReceptSzerkesztoComponent } from '../recept-szerkeszto/recept-szerkeszto.component';


@Component({
    selector: 'app-konyha-main',
    standalone: true,
    imports: [ButtonModule, ReceptListaComponent, ReceptSzerkesztoComponent],
    templateUrl: './konyha-main.component.html',
    styleUrl: './konyha-main.component.scss'
})
export class KonyhaMainComponent implements OnInit {

    testImgUrl: string = null;
    public ful = signal<number>(1);
    public nagyiMod = signal<boolean>(false);

    kivalasztottRecept = computed<Recept>(() => {
        return this.adatServiceService.kivalasztottRecept();
    });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService) { }

    ngOnInit() {

        this.adatServiceService.receptekLekereseAlap(this.fireAuthService.getToken()).subscribe({
            next: (receptek) => {
                console.debug('KonyhaMainComponent - RECEPTEK: ', receptek);

                this.adatServiceService.kedvencReceptekLekereseAlap(this.fireAuthService.getToken()).subscribe({
                    next: (kReceptek) => {
                        const receptLista = this.adatServiceService.receptLista();
                        const kedvencReceptekLista = this.adatServiceService.kedvencReceptekLista();
                        console.debug('KonyhaMainComponent - KEDVENC RECEPTEK: ', kReceptek, receptLista, kedvencReceptekLista);

                    },
                    error: (kReceptekError) => {
                        console.error('KonyhaMainComponent - KEDVENC RECEPT LISTA LEKERES HIBA ', kReceptekError);
                        this.fireAuthService.logout();
                    }
                });
            },
            error: (receptekError) => {
                console.error('KonyhaMainComponent - RECEPT LISTA LEKERES HIBA ', receptekError);
                this.fireAuthService.logout();
            }
        });

        // Minta a recept lista/objektum lekérésére:
        // Itt lehet
        const db = getDatabase()
        // const dbRef = ref(db);
        // get(child(dbRef, `receptek`)).then((snapshot) => {
        //     if (snapshot.exists()) {
        //         console.debug('RECEPTEK RECEPTEK RECEPTEK RECEPTEK', snapshot.val());
        //     } else {
        //         console.log("No data available");
        //     }
        // }).catch((error) => {
        //     console.error(error);
        // });

        // Minta rekord felvételére listába azonosítóval:
        // const ujRecept = new Recept();
        // ujRecept.gazdaFelhasznaloAzon = this.fireAuthService.getEmail();
        // ujRecept.nev = 'Próba';
        // ujRecept.leiras = `Több` + UJ_SOR + `soros` + UJ_SOR + `leírás`;
        // set(ref(db, 'receptek/' + ujRecept.azon), ujRecept)
        //     .then((x) => {
        //         console.debug('Új recept felvétel sikerült.', x);
        //     })
        //     .catch((xe) => {
        //         console.error('AkcioMainComponent - REcept felvétel hiba! ', xe);
        //     });

        // Minta arra, ha a firebase ad automatikusan ID-t. Ekkor is átmegy a recept lista tömbből objektumba!
        // const ujRecept = new Recept();
        // ujRecept.gazdaFelhasznaloAzon = this.fireAuthService.getEmail();
        // ujRecept.nev = 'Próba';
        // ujRecept.leiras = `Több` + UJ_SOR + `soros` + UJ_SOR + `leírás`;
        // const receptekListRef = ref(db, 'receptek');
        // const ujReceptRef = push(receptekListRef);
        // set(ujReceptRef, ujRecept)
        //     .then((x) => {
        //         console.debug('Új autoincrement ID-s recept felvétel sikerült.', x);
        //     })
        //     .catch((xe) => {
        //         console.error('AkcioMainComponent - Autoincrement ID-s recept felvétel hiba! ', xe);
        //     });

        // kép megjelenítés minta, url előállítása a letöltéshez
        // this.adatServiceService.receptKepURLLekerese('Koki/2es.png').subscribe({
        //     next: (kepURL) => {
        //         console.debug('AkcioMainComponent - Teszt kép URL ', kepURL);
        //         this.testImgUrl = kepURL;
        //     },
        //     error: (kuh) => {
        //         console.error('AkcioMainComponent - URL LEKÉRÉS HIBA ! ', kuh);
        //     }
        // });
    }

    balra(): void {
        this.ful.set(1);
    }

    jobbra(): void {
        // if (!this.adatServiceService.kivalasztottRecept()?.azon) {
        //     this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
        // }
        // this.adatServiceService.kivalasztottRecept.set(null);
        this.adatServiceService.ujSzerkesztendoReceptLetrehozasa();
        this.ful.set(2);
    }

    receptKivalasztas(event: Recept): void {
        console.debug('KonyhaMainComponent - receptKivalasztas', event);
        if (this.ful() === 1 && event?.azon) {
            this.ful.set(2);
        }
    }


    receptSzerkesztesKesz(event: Recept): void {
        console.debug('KonyhaMainComponent - receptSzerkesztesKesz', event);
        if (this.ful() === 2 && event?.azon) {
            this.balra();
        }
    }

    // Firebase fájl feltöltés példa. Itt kellene még kódban is méret ellenőrzés, illetve típus korlátozás van, de azt is ellenőrizni.
    // Ugyan olyan név megadása esetén, mint ami már fent van, felülíródik a tárolt kép. 
    onFileSelected(event: any) {

        console.debug('onFileSelected ', event);
        const file: File = event.target.files[0];

        this.adatServiceService.receptKepFeltoltese(file).subscribe({
            next: (valasz) => {
                console.debug('KonyhaMainComponent - UPLOAD RESULT', valasz);
                setTimeout(() => {
                    this.adatServiceService.receptKepTorlese(file.name).subscribe({
                        next: () => {
                            console.debug('KonyhaMainComponent - SIKERES FÁJL TÖRLÉS');
                        },
                        error: (kdh) => {
                            console.error('KonyhaMainComponent - FÁJL TÖRLÉS HIBA ! ', kdh);
                        }
                    });
                }, 10000);

            },
            error: (hiba) => {
                console.error('KonyhaMainComponent - UPLOAD HIBA ! ', hiba);
            }
        });
    }


}
