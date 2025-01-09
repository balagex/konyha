import { NgClass } from '@angular/common';
import { Component, ViewChild, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReceptLink } from '../../model/recept-link.type';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { cloneDeep } from 'lodash';
import { AdatServiceService } from '../../adat-service.service';

@Component({
    selector: 'app-recept-linker',
    imports: [ButtonModule, FormsModule, InputTextModule, NgClass, ConfirmPopupModule],
    templateUrl: './recept-linker.component.html',
    styleUrl: './recept-linker.component.scss'
})
export class ReceptLinkerComponent {

    @ViewChild('linkConfirmPopupRef', { static: false }) linkTorlesConfirmPopup: ConfirmPopup;

    link = input.required<ReceptLink>();
    sajatE = input.required<boolean>();
    ujLinkFelvetelE = input.required<boolean>();

    linkTorlesOK = output<ReceptLink>();
    linkModositva = output<ReceptLink>();

    // public szerkesztesAlatt = signal<boolean>(false);
    // public szerkesztettLink = signal<ReceptLink>(null);

    // Azért csináljuk így, hogy ha a külvilágban receptet váltanak, vagy új recept felvételét indítják, akkor a recept szerkesztőbe
    // ágyazott minden link kezelő alapállapotba álljon. Enélkül egy megnyitott új link felvétel recept váltáskor is nyitva maradt.
    szerkesztesiAdatok = computed(() => {

        const recept = this.adatServiceService.szerkesztendoRecept()

        return {
            szerkesztesAlatt: signal<boolean>(false),
            szerkesztettLink: signal<ReceptLink>(null)
        };
    });

    constructor(private adatServiceService: AdatServiceService, private confirmationService: ConfirmationService) { }

    openLink(): void {
        console.debug('ReceptLinkerComponent - openLink ', this.link());
        window.open(this.link().link, '_blnak');
    }

    linkModositasInditas(): void {
        console.debug('ReceptLinkerComponent - linkModositasInditas ', this.link());
        const linkClone = cloneDeep(this.link());
        this.szerkesztesiAdatok().szerkesztettLink.set(linkClone);
        this.szerkesztesiAdatok().szerkesztesAlatt.set(true);
    }

    ujLinkRogzitesInditas(): void {
        console.debug('ReceptLinkerComponent - ujLinkRogzitesInditas');
        const ujREcept = new ReceptLink(null);
        ujREcept.nev = ' ';
        ujREcept.link = ' ';
        this.szerkesztesiAdatok().szerkesztettLink.set(ujREcept);
        this.szerkesztesiAdatok().szerkesztesAlatt.set(true);
        setTimeout(() => {
            this.szerkesztesiAdatok().szerkesztettLink().nev = '';
            this.szerkesztesiAdatok().szerkesztettLink().link = '';
        }, 100);
    }

    linkModMegse(): void {
        console.debug('ReceptLinkerComponent - linkModositas ', this.ujLinkFelvetelE());
        this.szerkesztesiAdatok().szerkesztettLink.set(null);
        this.szerkesztesiAdatok().szerkesztesAlatt.set(false);
    }

    linkNevModositas(nev: string): void {
        console.debug('ReceptLinkerComponent - linkNevModositas ', nev);
        this.szerkesztesiAdatok().szerkesztettLink().nev = nev;
    }

    linkLinkModositas(link: string): void {
        console.debug('ReceptLinkerComponent - linkLinkModositas ', link);
        this.szerkesztesiAdatok().szerkesztettLink().link = link;
    }

    linkModOK(): void {
        this.linkModositva.emit(this.szerkesztesiAdatok().szerkesztettLink());
        this.szerkesztesiAdatok().szerkesztesAlatt.set(false);
        console.debug('ReceptLinkerComponent - linkModOK ', this.szerkesztesiAdatok().szerkesztettLink());
    }

    linkTorles(event: Event): void {
        console.debug('ReceptLinkerComponent - linkTorles', event, this.link());
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'linkConfirmPopupRef',
            message: 'Biztos töröli a linket?',
            header: null,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                console.debug('ReceptLinkerComponent - LINK tetelTorles OK', this.link());
                this.confirmationService.close();
                this.linkTorlesOK.emit(this.link());
            },
            reject: () => {
                console.debug('ReceptLinkerComponent - LINK tetelTorles CANCEL', this.link());
                this.confirmationService.close();
            }
        });
    }

    linkTorlesAccept() {
        this.linkTorlesConfirmPopup.onAccept();
    }

    linkTorlesReject() {
        this.linkTorlesConfirmPopup.onReject();
    }

}
