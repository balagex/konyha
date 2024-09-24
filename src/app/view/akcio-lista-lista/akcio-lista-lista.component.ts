import { Component, ViewChild, computed } from '@angular/core';
import { AkcioListaFelvetelComponent } from '../akcio-lista-felvetel/akcio-lista-felvetel.component';
import { AkciosLista } from '../../model/akcios-lista.type';
import { AdatServiceService } from '../../adat-service.service';
import { FireAuthService } from '../../fire-auth.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
    selector: 'app-akcio-lista-lista',
    standalone: true,
    imports: [AkcioListaFelvetelComponent, ButtonModule, ConfirmPopupModule],
    providers: [ConfirmationService],
    templateUrl: './akcio-lista-lista.component.html',
    styleUrl: './akcio-lista-lista.component.scss'
})
export class AkcioListaListaComponent {

    @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;

    ujListaModalLathato: boolean = false;
    listaModositasModalLathato: boolean = false;
    modositandoIntervallumDatumok: Date[] = [];
    modositandoListaAzon: string = null;

    listaLista = computed<AkciosLista[]>(() => {
        return this.adatServiceService.akciosListakLista();
    });

    constructor(private adatServiceService: AdatServiceService, private fireAuthService: FireAuthService, private confirmationService: ConfirmationService) {
    }

    ujFelvetelKesz(eredmeny: boolean): void {
        console.debug('AkcioListaListaComponent - ujFelvetelKesz', eredmeny);
        this.ujListaModalLathato = false;
    }

    modositasKesz(eredmeny: boolean): void {
        console.debug('AkcioListaListaComponent - modositasKesz', eredmeny);
        this.listaModositasModalLathato = false;
    }

    kivalasztottListaE(listaAzon: string): boolean {
        return this.adatServiceService.kivalasztottLista()?.azon == listaAzon;
    }

    listaModositas(lista: AkciosLista): void {
        console.debug('AkcioListaListaComponent - lista módosítás kell', lista);
        this.modositandoIntervallumDatumok = [lista.kezdoNap, lista.vegeNap];
        this.modositandoListaAzon = lista.azon;
        this.listaModositasModalLathato = true;
    }

    listaTorles(event: Event, lista: AkciosLista): void {
        console.debug('AkcioListaListaComponent - lista törlés kell', event, lista);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Biztos töröli a(z) ' + lista?.kezdonapForras + ' - ' + lista?.vegeNapForras + ' intervallumú listát?',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                console.debug('AkcioListaListaComponent - tetelTorles OK');
                if (lista) {
                    const szurttetelek = this.adatServiceService.akciosTetelLista().filter(t => t.listaAzon != lista.azon);
                    const szurtListak = this.adatServiceService.akciosListakLista().filter(l => l.azon != lista.azon);
                    const token = this.fireAuthService.getToken();
                    console.debug('AkcioListaListaComponent - lista törlés után maradó tételek és listák', szurttetelek, szurtListak);
                    this.adatServiceService.akciosTetelLista.set(szurttetelek);
                    if (this.adatServiceService.kivalasztottTetel()?.boltAzon == lista.azon) {
                        this.adatServiceService.kivalasztottTetel.set(null);
                    }
                    this.adatServiceService.mentendoAdatokMentese(token).subscribe({
                        next: (mentettTetelek) => {
                            console.debug('AkcioListaListaComponent - A lista törlés után megmaradó akciós tételek: ', mentettTetelek);
                            this.adatServiceService.akciosListakMentese(szurtListak, token).subscribe({
                                next: (mentettListak) => {
                                    this.adatServiceService.akciosListakLista.set(mentettListak);
                                    console.debug('AkcioListaListaComponent - A lista törlés után megmaradó listák tételek: ', mentettListak);
                                    this.confirmationService.close();
                                },
                                error: (listaError) => {
                                    console.error('AkcioListaListaComponent - HIBA A LISTÁK MENTÉSE SORÁN ', listaError);
                                    // TODO: kitalálni mi legyen
                                }
                            });
                        },
                        error: (modositasError) => {
                            console.error('AkcioListaListaComponent - HIBA A LISTA TÖRLÉS MIATTI AKCIOS TÉTELEK MENTÉSE SORÁN ', modositasError);
                            // TODO: kitalálni mi legyen
                        }
                    });
                }
            },
            reject: () => {
                console.debug('AkcioListaListaComponent - tetelTorles CANCEL');
                this.confirmationService.close();
            }
        });
    }

    ujListaFelvetelInditas(): void {
        console.debug('AkcioListaListaComponent - új lista kell');
        this.ujListaModalLathato = true;
    }

    listaKivalasztas(lista: AkciosLista): void {
        console.debug('AkcioListaListaComponent - lista kiválasztása');
        this.adatServiceService.kivalasztottTetel.set(null);
        this.adatServiceService.kivalasztottLista.set(lista);
    }

    listabanVanMentendotetel(lista: AkciosLista): boolean {
        const listaTetelei = this.adatServiceService.akciosTetelLista()?.filter(t => t.listaAzon == lista.azon);
        return listaTetelei && listaTetelei.length > 0 && listaTetelei.findIndex(x => x.mentendo) > -1;
    }

    accept() {
        this.confirmPopup.accept();
    }

    reject() {
        this.confirmPopup.reject();
    }

}
