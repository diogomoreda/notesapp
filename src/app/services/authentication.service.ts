import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { IUser, IUserType } from '../types/IUser-types';
import { ILoginCredentials } from '../types/types';
import { Observable, map, of } from 'rxjs';
import { INote } from '../types/INote-types';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private loggedIn: boolean | undefined = undefined;
    private user: IUser | undefined;
    

    constructor(
        private serverService: ServerService,
    ) {}


    getUser(): IUser | undefined {
        return this.user;
    }


    isLoggedIn(): boolean {
        return this.loggedIn ? this.loggedIn : false;
    }


    getAccess(note: INote): boolean {
        if (!note.userId) return true; // no userId in note, this is a public note
        if (!this.user) return false;        // the note has an Id, the current user must be  
        if (!this.user.userId) return false; // an authenticated user so it can view the note
        return true;    // the user is authenticated, access is granted
    }


    getOwnership(note: INote): boolean {
        if (!note.userId) return true; // public note, may be edited by anyone
        if (!this.user) return false;
        if (!this.user.userId) return false;
        if (note.userId !== this.user.userId) return false;
        return true;
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
