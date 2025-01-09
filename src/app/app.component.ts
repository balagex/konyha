import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getStorage, FirebaseStorage, uploadBytes, ref } from 'firebase/storage';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';
import { GrowlComponent } from './view/growl/growl.component';
import { LoadingIndicatorComponent } from './view/loading-indicator/loading-indicator.component';


@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, TranslateModule, GrowlComponent, LoadingIndicatorComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'koki';

    constructor(private primeng: PrimeNG, public translateService: TranslateService) {
        // translateService.addLangs(['hu']);
        // translateService.setDefaultLang('hu');
    }

    ngOnInit() {
        this.translateService.setDefaultLang('hu');
        this.translateService.get('primeng').subscribe(res => this.primeng.setTranslation(res));

        const akemx: Map<number, number[]> = new Map([
            [1, [65, 74, 124, 100, 87, 126, 72, 112, 62, 76, 90, 89, 123]],
            [2, [234, 137, 242, 211, 240, 175, 208, 167, 104, 163, 240, 181, 170]],
            [3, [222, 331, 293, 162, 340, 206, 252, 241, 170, 225, 265, 269, 180]]
        ])
        const nums: number[] = [];
        akemx.forEach((v, k) => {
            v.forEach((vi, i) => {
                const x = (vi - i) / k;
                nums.push(x);
            });
        });

        let ak = '';
        nums.forEach(n => {
            ak = ak + String.fromCharCode(n)
        });

        const fbApp = initializeApp({
            apiKey: ak,
            authDomain: "bevasarlolista-8247e.firebaseapp.com",
            storageBucket: "bevasarlolista-8247e.appspot.com",
            databaseURL: "https://bevasarlolista-8247e.firebaseio.com"
        });

        setTimeout(() => {
            const fbStorage = getStorage();
            console.debug('FB APP AND STORAGE', fbApp, fbStorage);


        }, 2000);

        const szkod1 = '#0000ff';
        const szkod2 = '#ffe214';

        const sz1r = szkod1.substring(1, 3);
        const sz1g = szkod1.substring(3, 5);
        const sz1b = szkod1.substring(5, 7);

        const luminance1 = (0.299 * parseInt(sz1r, 16) + 0.587 * parseInt(sz1g, 16) + 0.114 * parseInt(sz1b, 16)) / 255;

        const c1 = luminance1 > 0.5 ? 'black' : 'white';

        const sz2r = szkod2.substring(1, 3);
        const sz2g = szkod2.substring(3, 5);
        const sz2b = szkod2.substring(5, 7);

        const luminance2 = (0.299 * parseInt(sz2r, 16) + 0.587 * parseInt(sz2g, 16) + 0.114 * parseInt(sz2b, 16)) / 255;

        const c2 = luminance2 > 0.5 ? 'black' : 'white';

        console.debug('AppComponent - színek', szkod1, sz1r, sz1g, sz1b, luminance1, c1, szkod2, sz2r, sz2g, sz2b, luminance2, c2);
    }
}
