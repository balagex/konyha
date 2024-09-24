import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserCredential, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
    providedIn: 'root'
})
export class FireAuthService {

    private token: string = null;
    private email: string = null;

    constructor(protected httpClient: HttpClient, private router: Router) { }

    regisztracio(email: string, password: string) {
        const auth = getAuth();
        return createUserWithEmailAndPassword(auth, email, password);
    }

    login(email: string, password: string) {

        const auth = getAuth();
        return signInWithEmailAndPassword(auth, email, password);
        // .then((userCredential) => {
        //     // Signed in 
        //     const user = userCredential.user;
        //     user.getIdToken().then(
        //         (token: string) => {
        //             console.debug('FB token:!', token);

        //             this.token = token;
        //             this.email = email;
        //         }
        //     );
        //     console.debug('FB SIGN IN SUCCESS!!!!', auth, userCredential);
        // });
    }

    logout() {
        const auth = getAuth();
        this.clearCredital();
        auth.signOut().then(() => {
            console.log('logout futtatva...');
            this.router.navigate(['/login']);
        });

    }

    getTokenPromise(userCredential: UserCredential) {
        return userCredential.user.getIdToken();
    }

    setCredential(token: string, email: string) {
        if (token) {
            console.log('A beállított token: ', token);
            this.token = token;
            console.log('A beállított email: ', email);
            this.email = email;
        }
    }

    clearCredital(): void {
        this.token = null;
        this.email = null;
    }

    getToken(): string {
        return this.token;
    }

    getEmail(): string {
        return this.email;
    }

    isAuthenticated(): boolean {
        return this.token != null;
    }
}
