import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { AuthenticationService } from './authentication.service';
import { Observable, catchError, filter, map, of } from 'rxjs';
import { INote, INoteContent, INoteType } from '../types/INote-types';
import { IUserType } from '../types/IUser-types';
import { INoteSortOption, ISearchFilter, ISortOrder } from '../types/types';

@Injectable({
    providedIn: 'root'
})
export class ApiNotesService {

    constructor(
        private serverService: ServerService,
        private authService: AuthenticationService
    ) { }

    nextId(): number {
        const pool: INote[] = this.serverService.serverGetData();
        return pool.length;
    }


    getById(noteId: number): Observable<INote | undefined> {
        return of(this.serverService.serverGetData())
        .pipe(
            map((notes: INote[]) => {
                return notes.find((note: INote) => note.noteId === noteId);
            }),
            catchError((err: any) => {
                return of(undefined)
            }) 
        );
    }


    getRequest(searchFilter: ISearchFilter): Observable<INote[]> {
        return of(this.serverService.serverGetData())
        .pipe(
            map((notes: INote[]) => {
                
                // filter by: userId   display notes from a single user
                // filter by: userType display notes from a user type group (the public property must be true for this to be included)
                // filter by: active   displays non deleted Notes
                // filter by: public

                // filter by: title
                // filter by: content
                // filter by: userType
                // filter by: noteType
                
                let filteredNotes: INote[] = notes.filter((note: INote) => note.active );

                if (!this.authService.isLoggedIn()) {
                    filteredNotes = filteredNotes.filter((note: INote) => !note.userId)
                }
                if (searchFilter.searchStr) {
                    const searchStrRegExp: RegExp = new RegExp(`${searchFilter.searchStr}`, 'i')
                    filteredNotes = filteredNotes.filter((note: INote) => { 
                        const titleMatch: boolean = searchStrRegExp.test(note.content[note.version].title);
                        const contentMatch: boolean = searchStrRegExp.test(note.content[note.version].content);
                        return titleMatch || contentMatch;
                    })
                }
                if (searchFilter.noteType) {
                    filteredNotes = filteredNotes.filter((note: INote) => note.content[note.version].noteType && note.content[note.version].noteType === searchFilter.noteType)
                }
                

                // sort by: title alphabetically
                // sort by: content alphabetically 
                // sort by: created
                // sort by: updated
                const sortedNotes: INote[] = filteredNotes.sort((noteA: INote, noteB: INote) => {
                    // sort by updated date / time
                    if (searchFilter.sortOption === 'updated') {
                        const dateA = new Date(noteA.content[noteA.version][searchFilter.sortOption]).getTime();
                        const dateB = new Date(noteB.content[noteB.version][searchFilter.sortOption]).getTime();
                        return dateA - dateB;
                    } 
                    // sort by created date / time
                    else if (searchFilter.sortOption === 'created') {
                        const dateA = new Date(noteA[searchFilter.sortOption]).getTime();
                        const dateB = new Date(noteB[searchFilter.sortOption]).getTime();
                        return dateA - dateB;
                    } 
                    // sort by either 'title' or 'content'
                    else if (searchFilter.sortOption === 'title' || searchFilter.sortOption === 'content') {
                        const termA = noteA.content[noteA.version][searchFilter.sortOption].toLowerCase();
                        const termB = noteB.content[noteB.version][searchFilter.sortOption].toLowerCase();
                        if (termA > termB) return 1;
                        if (termA < termB) return -1;
                        return 0;
                    }
                    return 0;
                });
                if (searchFilter.sortOrder === 'desc') sortedNotes.reverse();

                return sortedNotes;
            })
        );
    }


    postRequest(note: INote): Observable<boolean> {
        return of(this.serverService.serverGetData()).pipe(
            map((pool: INote[]) => {
                pool.push(note);
                this.serverService.serverSetData(pool);
                return true;
            }),
            catchError((err: any) => {
                return of(false);
            })
        );
    }


    patchRequest(updatedNote: INote): Observable<boolean> {
        console.log(this)
        return of(this.serverService.serverGetData()).pipe(
            map((pool: INote[]) => {
                const noteIndex = pool.findIndex(item => item.noteId === updatedNote.noteId);
                if (noteIndex < 0) return false;
                pool[noteIndex] = updatedNote;
                this.serverService.serverSetData(pool);
                return true;
            }),
            catchError((err: any) => {
                return of(false);
            })
        );
    }


    deleteRequest(noteId: number | number[]): Observable<boolean> {
        return of(this.serverService.serverGetData()).pipe(
            map((pool: INote[]) => {
                let noteIds: number[] = [];
                if (!Array.isArray(noteId)) noteIds.push(noteId);
                else noteIds = [...noteId];
                for (let i=0; i<noteIds.length; i++) {
                    const noteIndex = pool.findIndex((item: INote) => item.noteId === noteIds[i]);
                    if (noteIndex < 0) return false;
                    pool[noteIndex].active = false;
                }
                this.serverService.serverSetData(pool);
                return true;
            }),
            catchError((err: any) => {
                return of(false);
            })
        );
    }
}
