import { FireAuthService } from './fire-auth.service';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { AkcioTetelIF } from './model/akcio-tetel.interface';
import { AkciosListaIF } from './model/akcios-lista.interface';
import { Observable, debounceTime, distinctUntilChanged, from, map, tap } from 'rxjs';
import { AkciosLista } from './model/akcios-lista.type';
import { AkcioTetel } from './model/akcio-tetel.type';
import { dateToYYYYMMDD, resizeImage, sortFunction } from './utils';
import { FirebaseStorage, StringFormat, UploadResult, deleteObject, getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import { Recept } from './model/recept.type';
import { ReceptIF } from './model/recept.interface';
import { KedvencReceptek } from './model/kedvenc-receptek.type';
import { KedvencReceptekIF } from './model/kedvenc-receptek.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root'
})
export class AdatServiceService {

    public akciosListakLista = signal<AkciosLista[]>([]);
    public kivalasztottLista = signal<AkciosLista>(null);
    public akciosTetelLista = signal<AkcioTetel[]>([]);
    public kivalasztottTetel = signal<AkcioTetel>(null);

    public nagyiMod = signal<boolean>(false);
    public akcioTetelNevLista = signal<string[]>([]);

    public receptLista = signal<Recept[]>([]);
    public kedvencReceptekLista = signal<KedvencReceptek[]>([]);
    public kivalasztottRecept = signal<Recept>(null);

    public sortDir = signal<1 | -1>(1); // asc: 1, desc: -1
    public csakKedvencekE = signal<boolean>(false);
    public csakSajatE = signal<boolean>(false);
    public listaSzuroSzoveg = signal<string>('');

    kesleltetettSzuroSzoveg = toSignal(toObservable(this.listaSzuroSzoveg).pipe(debounceTime(500), distinctUntilChanged()), {
        initialValue: '',
    });

    public jeloltReceptLista = computed<Recept[]>(() => {
        const belepettFelhasznaloAzon = this.fireAuthService.getEmail();
        const kedvencReceptek = this.kedvencReceptekLista()?.find(x => x.felhasznaloAzon == belepettFelhasznaloAzon)?.kedvencek;
        const eredmenyLista: Recept[] = this.receptLista()
            .map(recept => ({ ...recept, sajatE: recept.gazdaFelhasznaloAzon == belepettFelhasznaloAzon } as Recept))
            .map(recipe => ({ ...recipe, kedvencE: kedvencReceptek?.findIndex(kedvencReceptAzon => kedvencReceptAzon == recipe.azon) > -1 } as Recept))
            .filter(tetel => (this.listaSzuroSzoveg().length < 1
                || this.kesleltetettSzuroSzoveg().length < 1
                || (tetel.nev.toLowerCase().indexOf(this.kesleltetettSzuroSzoveg().toLowerCase()) > -1)
            ))
            .filter(szurtTetel => (this.csakKedvencekE() && szurtTetel.kedvencE) || !this.csakKedvencekE())
            .filter(szTetel => (this.csakSajatE() && szTetel.sajatE) || !this.csakSajatE())
            .sort((a, b) => {
                return sortFunction(a, b, this.sortDir(), 'nev', null, false);
            });

        // console.debug('AdatServiceService - jeloltReceptLista', eredmenyLista);
        return eredmenyLista;
    });

    constructor(protected httpClient: HttpClient, protected fireAuthService: FireAuthService) { }

    akcioTetelNevekLekereseAlap(token: string): Observable<string[]> {
        this.kivalasztottTetel.set(null);
        return this.httpClient.get<string[]>('https://bevasarlolista-8247e.firebaseio.com/akcioTetelNevek.json?auth=' + token, {
            observe: 'body',
            responseType: 'json'
        }); //.pipe(map(response => AkciosLista.convertFromIfList(response)));
    }

    akcioTetelNevekMentese(nevek: string[], token: string): Observable<string[]> {
        return this.httpClient.put<string[]>('https://bevasarlolista-8247e.firebaseio.com/akcioTetelNevek.json?auth=' + token,
            nevek,
            {
                observe: 'body',
                responseType: 'json'
            });
    }

    akciosListakLekereseAlap(token: string): Observable<AkciosLista[]> {
        this.kivalasztottTetel.set(null);
        return this.httpClient.get<AkciosListaIF[]>('https://bevasarlolista-8247e.firebaseio.com/akciosListak.json?auth=' + token, {
            observe: 'body',
            responseType: 'json'
        }).pipe(map(response => AkciosLista.convertFromIfList(response)));
    }

    akciosListakMentese(listak: AkciosLista[], token: string): Observable<AkciosLista[]> {
        this.kivalasztottTetel.set(null);
        const mentendoListak: AkciosListaIF[] = [];
        if (listak?.length > 0) {
            listak.forEach(lista => {
                mentendoListak.push(lista.convertForSave());
            });
        }
        return this.httpClient.put<AkciosListaIF[]>('https://bevasarlolista-8247e.firebaseio.com/akciosListak.json?auth=' + token,
            mentendoListak,
            {
                observe: 'body',
                responseType: 'json'
            }).pipe(map(response => AkciosLista.convertFromIfList(response)));
    }

    akciosListaFelvetel(ujLista: AkciosLista, token: string): Observable<AkciosLista[]> {
        const listak = this.akciosListakLista();
        if (ujLista) {
            listak.push(ujLista);
        }
        return this.akciosListakMentese(listak, token);
    }

    akcioTetelekLekereseAlap(token: string) {
        this.kivalasztottTetel.set(null);
        return this.httpClient.get<AkcioTetelIF[]>('https://bevasarlolista-8247e.firebaseio.com/akciosTelelek.json?auth=' + token, {
            observe: 'body',
            responseType: 'json'
        }).pipe(map(response => AkcioTetel.convertFromIfList(response)));
    }

    akciosTetelekMentese(tetelek: AkcioTetel[], token: string): Observable<AkcioTetel[]> {
        const mentendoTetelek: AkcioTetelIF[] = [];
        if (tetelek?.length > 0) {
            tetelek.forEach(tetel => {
                mentendoTetelek.push(tetel.convertForSave());
            });
        }
        return this.httpClient.put<AkcioTetelIF[]>('https://bevasarlolista-8247e.firebaseio.com/akciosTelelek.json?auth=' + token,
            mentendoTetelek,
            {
                observe: 'body',
                responseType: 'json'
            }).pipe(map(response => AkcioTetel.convertFromIfList(response)));
    }

    aktulaisHetKivalasztasa(): void {
        const maStr = dateToYYYYMMDD(new Date());
        const ezAHet = this.akciosListakLista().find(value => value.kezdonapForras <= maStr && value.vegeNapForras >= maStr);
        if (ezAHet) {
            this.kivalasztottLista.set(ezAHet);

        }
        console.debug('AdatServiceService - aktulaisHetKivalasztasa: ', this.kivalasztottLista());
    }

    mentendoAdatokMentese(token: string): Observable<AkcioTetel[]> {
        const result = new Observable<AkcioTetel[]>(
            observer => {
                this.akciosTetelekMentese(this.akciosTetelLista(), token).subscribe({
                    next: (mentettTetelek) => {
                        console.debug('AdatServiceService - A mentendő tételek mentése után lekért akciós tételek: ', mentettTetelek);
                        this.akciosTetelLista.set(mentettTetelek);
                        observer.next(mentettTetelek);
                        observer.complete();
                    },
                    error: (modositasError) => {
                        console.error('AdatServiceService - HIBA AZ AKCIOS TÉTELEK MÓDOSÍTÁSA SORÁN ', modositasError);
                        observer.error(modositasError);
                        observer.complete();
                    }
                });
            });
        return result;
    }

    receptekLekereseAlap(token: string): Observable<Recept[]> {
        return this.httpClient.get<any>('https://bevasarlolista-8247e.firebaseio.com/receptek.json?auth=' + token, {
            observe: 'body',
            responseType: 'json'
        }).pipe(
            // tap(x => console.debug('receptek RESPONSE ', x)),
            map(response => response instanceof Array ? Recept.convertFromIfList(response) : Recept.convertFromObject(response)),
            tap(rl => {
                this.receptLista.set(rl);
                if (this.kivalasztottRecept() && rl.findIndex(recept => recept.azon === this.kivalasztottRecept().azon) < 0) {
                    this.kivalasztottRecept.set(null);
                }
            })
        );
    }

    kedvencReceptekLekereseAlap(token: string): Observable<KedvencReceptek[]> {
        return this.httpClient.get<KedvencReceptekIF[]>('https://bevasarlolista-8247e.firebaseio.com/kedvencReceptek.json?auth=' + token, {
            observe: 'body',
            responseType: 'json'
        }).pipe(
            // tap(x => console.debug('kedvencReceptek RESPONSE ', x)),
            map(response => KedvencReceptek.convertFromIfList(response)),
            tap(kl => {
                this.kedvencReceptekLista.set(kl);
            })
        );
    }

    // Firebase fájl feltöltés példa. Itt kellene még kódban is méret ellenőrzés, illetve típus korlátozás van, de azt is ellenőrizni.
    // Ugyan olyan név megadása esetén, mint ami már fent van, felülíródik a tárolt kép. 
    receptKepFeltoltese(file: File): Observable<UploadResult> {

        const fbStorage: FirebaseStorage = getStorage();

        var n = Date.now();
        const filePath = `Koki/${file.name}`;
        const fileRef = ref(fbStorage, filePath);
        console.debug('receptKepFeltoltese ', file, fileRef);
        const reader = new FileReader();

        const result = new Observable<UploadResult>(
            observer => {
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    await resizeImage(reader.result as string).then((resolve: any) => {
                        console.debug('resolved image', resolve);
                        uploadString(fileRef, resolve, StringFormat.DATA_URL).then(valasz => {
                            console.debug('UPLOAD RESULT', valasz);
                            observer.next(valasz);
                            observer.complete();
                        }).catch(hiba => {
                            console.error('UPLOAD HIBA ! ', hiba);
                            observer.error(hiba);
                            observer.complete();
                        });
                    });
                };
            });
        return result;
    }
    // Ha nem lenne átméretezés, akkor így lehetne feltölteni a fájlt:
    // uploadBytes(fileRef, file).then(valasz => {
    //     console.debug('UPLOAD RESULT', valasz);
    // }).catch(hiba => {
    //     console.error('UPLOAD HIBA ! ', hiba);
    // });


    // FIGYELEM, mint a tárolt adatok mennyisége korlátoa, mint a letöltési mennyiség! Ezeket átlépve fizetni kell! Mindenképp ez alatt kell maradni!
    receptKepURLLekerese(kepLink: string): Observable<string> {
        const fbStorage: FirebaseStorage = getStorage();
        const filePath = 'Koki/2es.png';
        const fileRef = ref(fbStorage, filePath);
        const downloadPromise = getDownloadURL(fileRef);
        return from(downloadPromise);
    }

    receptKepTorlese(kepLink: string): Observable<void> {
        // fájl törlés minta
        // import { getStorage, ref, deleteObject } from "firebase/storage";

        const fbStorage: FirebaseStorage = getStorage();

        // // Create a reference to the file to delete
        const desertRef = ref(fbStorage, 'Koki/' + kepLink);

        // // Delete the file
        const deletePromise = deleteObject(desertRef);
        return from(deletePromise);
    }
}

// Lehet más módon is lekérni a listát, vagy egy konkrét elemét a listának.
// Itt viszont bekavar, hogy amíg valami a firebase oldalon tömbként [] tárolódik az adatbázisban, addig az index-et lehet
// azonosítóként megadni konkrét elem lekérdezésekor például get(child(dbRef, `receptek/0`)) módon.
// Ha viszont úgy veszünk fel elemet, hogy mi adunk neki ID-t, akkor a firebase oldalon MEGVÁLTOZIK A TÁROLÁS MÓDJA!
// Ekkor a receptek alatt már nem egy tömb lesz, hanem egy objektum, ami mezőnevei a rekord azonosítók leszenk, az egyes mező értékek
// pedig a recept objektumok.
// Egy ilyen után nem fog menni a recept lista előállítása az egyszerű módon, mert vizsgálni kellene, hogy most tömb vagy objektum jött vissza...
// A csavar pedig a dologban, hogy ha a firebase felületén nyomunk egy delete-t arra a receptre, ami egyedi azonosítóval van rögzítve, és
// a többi kulcsa csak egy index alapú sorszám, akkor hopp, objektumból megint tömb lesz...
// Bolondbiztos megoldás az lenne, ha a lekrédezés után megnéznánk, hogy a válasz az egy tömb-e vagy sem, és aszerint nyernénk ki a lista adatokat.

// Minta a recept lista/objektum lekérésére:
// Itt lehet
// const db = getDatabase()
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
