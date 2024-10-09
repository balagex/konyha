import { Component, OnInit, computed } from '@angular/core';
import { GrowlService } from './growl.service';
import { NgClass } from '@angular/common';
import { GrowlMsg } from '../../model/groel-msg.type';

@Component({
    selector: 'app-growl',
    standalone: true,
    imports: [NgClass],
    templateUrl: './growl.component.html',
    styleUrl: './growl.component.scss'
})
export class GrowlComponent {

    uzenet = computed<GrowlMsg>(() => {
        return this.growlService.uzenet();
    });

    constructor(protected growlService: GrowlService) { }

    uzenetElrejtes(): void {
        this.growlService.uzenetElrejtes();
    }
}
