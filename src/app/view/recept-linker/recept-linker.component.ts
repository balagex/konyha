import { NgClass } from '@angular/common';
import { Component, ViewChild, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReceptLink } from '../../model/recept-link.type';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { cloneDeep } from 'lodash';

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

    // Azért csináljuk így, hogy ha a külvilágban receptet váltanak, vagy új recept felvételét indítják, akkor a recept szerkesztőbe
    // ágyazott minden link kezelő alapállapotba álljon. Enélkül egy megnyitott új link felvétel recept váltáskor is nyitva maradt.
    linkSzerkesztesAlatt = linkedSignal({
        source: this.link,
        computation: () => false
    });

    // A szerkesztendő / megadandó név és link értékek az input változása esetén szintén reszetelődnek. 
    // Új link esetén null jön.
    szerkesztettLinkNev = linkedSignal({
        source: this.link,
        computation: input => input ? input?.nev : ''
    });

    szerkesztettLinkLink = linkedSignal({
        source: this.link,
        computation: input => input ? input?.link : ''
    });

    constructor(private confirmationService: ConfirmationService) { }

    openLink(): void {
        // console.debug('ReceptLinkerComponent - openLink ', this.link());
        window.open(this.link().link, '_blnak');
    }

    linkModositasInditas(): void {
        // console.debug('ReceptLinkerComponent - linkModositasInditas ', this.link());
        this.linkSzerkesztesAlatt.set(true);
    }

    ujLinkRogzitesInditas(): void {
        this.szerkesztettLinkNev.set(' ');
        this.szerkesztettLinkLink.set(' ');
        this.linkSzerkesztesAlatt.set(true);
        // form használata esetén nem kellene ez a kavarás, ami a mező invalid kinézetének állításához tartozik
        setTimeout(() => {
            this.szerkesztettLinkNev.set('');
            this.szerkesztettLinkLink.set('');
        }, 100);
    }

    linkModMegse(): void {
        // console.debug('ReceptLinkerComponent - linkModositas ', this.ujLinkFelvetelE());
        this.szerkesztettLinkNev.set(this.link() ? this.link().nev : '');
        this.szerkesztettLinkLink.set(this.link() ? this.link().link : '');
        this.linkSzerkesztesAlatt.set(false);
    }

    linkNevModositas(nev: string): void {
        // console.debug('ReceptLinkerComponent - linkNevModositas ', nev);
        this.szerkesztettLinkNev.set(nev);
    }

    linkLinkModositas(link: string): void {
        // console.debug('ReceptLinkerComponent - linkLinkModositas ', link);
        this.szerkesztettLinkLink.set(link);
    }

    linkModOK(): void {
        const ujREcept = new ReceptLink(null);
        ujREcept.nev = this.szerkesztettLinkNev();
        ujREcept.link = this.szerkesztettLinkLink();
        this.linkModositva.emit(ujREcept);
        this.linkSzerkesztesAlatt.set(false);
        // console.debug('ReceptLinkerComponent - linkModOK ', this.szerkesztettLinkNev(), this.szerkesztettLinkLink()); // , this.szerkesztettLink(), this.szerkesztesiAdatok().szerkesztettLink()
    }

    linkTorles(event: Event): void {
        // console.debug('ReceptLinkerComponent - linkTorles', event, this.link());
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
                // console.debug('ReceptLinkerComponent - LINK tetelTorles OK', this.link());
                this.confirmationService.close();
                this.linkTorlesOK.emit(this.link());
            },
            reject: () => {
                // console.debug('ReceptLinkerComponent - LINK tetelTorles CANCEL', this.link());
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
