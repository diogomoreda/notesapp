import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { IUser, IUserType } from '../types/IUser-types';
import { ILoginCredentials } from '../types/types';
import { Observable, map, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private loggedIn: boolean | undefined = undefined;
    private user: IUser | undefined;
    
    constructor(
        private serverService: ServerService,
    ) {}

    isLoggedIn(): boolean {
        return this.loggedIn ? this.loggedIn : false;
    }

    login(credentials: ILoginCredentials): Observable<boolean> {
        return of(this.serverService.serverGetUsers())
        .pipe(
            map((pool: IUser[]) => {
                const result: IUser | undefined = pool.find((user: IUser) => 
                    user.username === credentials.username && 
                    user.password === credentials.password
                );
                if (!result) {
                    this.loggedIn = false;
                    this.user = undefined;
                    return false;
                }
                this.loggedIn = true;
                this.user = result;
                return true;
            }) 
        );
    }

    logout(): Observable<void> {
        return of(null).pipe(
            map(() => {
                this.loggedIn = false;
                this.user = undefined;
            })
        );
    }
}
