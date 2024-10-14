import { NgClass } from '@angular/common';
import { Component, ViewChild, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReceptLink } from '../../model/recept-link.type';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-recept-linker',
    standalone: true,
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

    public szerkesztesAlatt = signal<boolean>(false);
    public szerkesztettLink = signal<ReceptLink>(null);

    constructor(private confirmationService: ConfirmationService) { }

    openLink(): void {
        console.debug('ReceptLinkerComponent - openLink ', this.link());
        window.open(this.link().link, '_blnak');
    }

    linkModositasInditas(): void {
        console.debug('ReceptLinkerComponent - linkModositasInditas ', this.link());
        const linkClone = cloneDeep(this.link());
        this.szerkesztettLink.set(linkClone);
        this.szerkesztesAlatt.set(true);
        // TODO: ez csak teszt, át kell menni edit mode-ban, és majd onnan kell meghívni
        // this.linkModositva.emit(this.link());
    }

    linkModMegse(): void {
        console.debug('ReceptLinkerComponent - linkModositas ', this.ujLinkFelvetelE());
        if (this.ujLinkFelvetelE()) {
            this.linkModositva.emit(null);
        } else {
            this.szerkesztettLink.set(null);
            this.szerkesztesAlatt.set(false);
        }
    }

    linkNevModositas(nev: string): void {
        // TODO: befejezni
        console.debug('ReceptLinkerComponent - linkNevModositas ', nev);
    }

    linkLinkModositas(link: string): void {
        // TODO: befejezni
        console.debug('ReceptLinkerComponent - linkLinkModositas ', link);
    }

    linkModOK(): void {
        // TODO: befejezni
        this.szerkesztesAlatt.set(false);
        console.debug('ReceptLinkerComponent - linkModOK ', this.szerkesztettLink());
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
        this.linkTorlesConfirmPopup.accept();
    }

    linkTorlesReject() {
        this.linkTorlesConfirmPopup.reject();
    }

}
