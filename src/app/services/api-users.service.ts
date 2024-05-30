import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { Observable, catchError, filter, map, of } from 'rxjs';
import { INote, INoteContent, INoteType } from '../types/INote-types';
import { IUser, IUserType } from '../types/IUser-types';
import { INoteSortOption, ISearchFilter, ISortOrder } from '../types/types';


@Injectable({
    providedIn: 'root'
})
export class ApiUsersService {

    constructor(
        private serverService: ServerService
    ) { }


    getById(userId: number): Observable<IUser | undefined> {
        return of(this.serverService.serverGetUsers())
        .pipe(
            map((users: IUser[]) => {
                return users.find((user: IUser) => user.userId === userId);
            }),
            catchError((err: any) => {
                return of(undefined)
            }) 
        );
    }


    getAll(excludeId?: number): Observable<IUser[]> {
        if (!excludeId) excludeId = -1;
        return of(this.serverService.serverGetUsers())
        .pipe(
            map((users: IUser[]) => {
                return users
                        //.filter((user: IUser) => user.userId !== excludeId)
                        .map((user: IUser) => (
                            { userId: user.userId, username: user.userId !== excludeId ? user.username : 'you'}
                        ));
            }),
            catchError((err: any) => {
                return of([])
            }) 
        );
    }
    
}
