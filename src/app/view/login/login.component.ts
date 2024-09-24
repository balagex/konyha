import { Component, ModelSignal, OnInit, model, signal } from '@angular/core';
import { FireAuthService } from '../../fire-auth.service';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { dateToYYYYMMDD, napRovidites } from '../../utils';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, NgClass, FormsModule, NgIf],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

    public loginname = model('');
    public password = model('');
    public loading = false;
    public loginError = false;

    constructor(private fireAuthService: FireAuthService, private router: Router) { }

    ngOnInit() {
        const most = new Date(2024, 1, 2);

        console.log(napRovidites(most, 'hu-HU'));
        console.log(napRovidites(most, null));
        console.log(dateToYYYYMMDD(most));

    }

    keypress(event: KeyboardEvent): void {
        console.debug('keypress ', event);
        if (!this.loading) {
            this.loginError = false;
            if (event.keyCode === 13) {
                this.loginHandler();
            }
        }

    }

    loginHandler(): void {

        if (this.loginname && this.loginname().trim().length > 0 && this.password && this.password().trim().length > 0) {
            this.loading = true;
            this.loginError = false;
            console.debug('LOGIN INDUL ', this.loginname, this.password);

            this.fireAuthService.login(this.loginname(), this.password())
                .then((userCredential) => {
                    this.loading = false;
                    console.debug('LoginComponent - A belépés sikeres. ', userCredential);
                    this.fireAuthService.getTokenPromise(userCredential).then(
                        (token: string) => {
                            this.fireAuthService.setCredential(token, userCredential.user.email);
                            this.router.navigate(['/akcioLista']);
                        }
                    );
                })
                .catch((error) => {
                    this.loading = false;
                    this.loginError = true;
                    console.error('LoginComponent - Hiba történt a bejelentkezés során! ', error);

                    this.fireAuthService.clearCredital();
                });
        }
    }

}
