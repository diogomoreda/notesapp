import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { IUser, IUserType } from '../types/IUser-types';
import { ILoginCredentials } from '../types/types';
import { Observable, Subject, map, of } from 'rxjs';
import { INote } from '../types/INote-types';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private loggedIn: boolean | null = null;
    private user: IUser | null;

    private loginSubject: Subject<boolean> = new Subject<boolean>();
    login$: Observable<boolean> = this.loginSubject.asObservable();
    emitLoginState(state: boolean) {
        this.loginSubject.next(state);
    }
    

    constructor(
        private serverService: ServerService,
    ) {
        this.user = this.serverService.serverGetUser();
        this.loggedIn = this.user !== null;
    }


    getUser(): IUser | null {
        return this.user;
    }


    isLoggedIn(): boolean {
        return this.loggedIn ? this.loggedIn : false;
    }


    getAccess(note: INote): boolean {
        if (!note.userId) return true;                                      // no userId in note, this is a public note so it can be accessed by anyone
        if (!this.user) return false;                                       // the note has an Id, the current user must be  
        if (!this.user.userId) return false;                                // an authenticated user so it can view the note
        if (note.userId === this.user.userId) return true;                  // the user is the owner, so it has access
        if (note.content[note.version].sharing.includes(this.user.userId))  // the note has been shared with this user, so it has access
            return true;
        return false;    // none of the above? no access then
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
                    this.user = null;
                    this.serverService.serverClearUser();
                    this.emitLoginState(false);
                    return false;
                }
                this.loggedIn = true;
                this.user = result;
                this.serverService.serverSetUser(this.user);
                this.emitLoginState(true);
                return true;
            }) 
        );
    }


    logout(): Observable<void> {
        return of(null).pipe(
            map(() => {
                this.loggedIn = false;
                this.user = null;
                this.serverService.serverClearUser();
                this.emitLoginState(false);
            })
        );
    }
}
