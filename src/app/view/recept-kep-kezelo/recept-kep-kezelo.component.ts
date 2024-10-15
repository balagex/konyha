import { Component, ViewChild, computed, effect, input, signal, untracked } from '@angular/core';
import { StorageReference } from 'firebase/storage';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { AdatServiceService } from '../../adat-service.service';
import { GrowlService } from '../growl/growl.service';
import { ImageModule } from 'primeng/image';

@Component({
    selector: 'app-recept-kep-kezelo',
    standalone: true,
    imports: [ButtonModule, ConfirmPopupModule, ImageModule],
    templateUrl: './recept-kep-kezelo.component.html',
    styleUrl: './recept-kep-kezelo.component.scss'
})
export class ReceptKepKezeloComponent {

    kepInfo = input<StorageReference>();
    sajatE = input.required<boolean>();

    urlInfo = computed(() => {

        return {
            kepUrl: signal<string>(null)
        };
    });


    @ViewChild('kepTorlesConfirmPopupRef', { static: false }) kepTorlesConfirmPopup: ConfirmPopup;

    constructor(private confirmationService: ConfirmationService, private adatServiceService: AdatServiceService, private growlService: GrowlService) {

        effect(() => {
            const kepUtvonal = this.kepInfo()?.fullPath;
            untracked(() => {
                this.adatServiceService.receptKepURLLekerese(kepUtvonal).subscribe({
                    next: (kepURL) => {
                        console.debug('ReceptKepKezeloComponent - Teszt kép URL ', kepURL);
                        this.urlInfo().kepUrl.set(kepURL);
                    },
                    error: (kuh) => {
                        console.error('ReceptKepKezeloComponent - URL LEKÉRÉS HIBA ! ', kuh);
                    }
                });
            });
        });
    }


    kepTorles(event: Event): void {
        console.debug('ReceptKepKezeloComponent - linkTorles', event);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'kepTorlesConfirmPopupRef',
            message: 'Biztos töröli a képet?',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                console.debug('ReceptKepKezeloComponent - Kép tetelTorles OK', this.kepInfo(), this.sajatE());
                this.confirmationService.close();
                // TODO megcsinálni
            },
            reject: () => {
                console.debug('ReceptKepKezeloComponent - Kép tetelTorles CANCEL', this.kepInfo(), this.sajatE());
                this.confirmationService.close();
            }
        });
    }

    kepTorlesAccept() {
        this.kepTorlesConfirmPopup.accept();
    }

    kepTorlesReject() {
        this.kepTorlesConfirmPopup.reject();
    }
}
