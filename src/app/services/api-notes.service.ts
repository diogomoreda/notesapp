import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { AuthenticationService } from './authentication.service';
import { Observable, catchError, filter, map, of } from 'rxjs';
import { INote, INoteContent, INoteType } from '../types/INote-types';
import { IUser, IUserType } from '../types/IUser-types';
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
        const noteIds: number[] = pool.map(i => i.noteId);
        let counter: number = 1;
        while (noteIds.includes(counter)) counter++;
        return counter;
    }


    public getNoteLink(noteId: number): string {
        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/note/${noteId}`;
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
                
                // 1. filter out deleted notes
                let filteredNotes: INote[] = notes.filter((note: INote) => note.active );

                // 2.1 logged in users may access:
                //    - notes created by themselves
                //    - notes shared with them
                //    - public notes (notes where note.userId === undefined)
                if (this.authService.isLoggedIn()) {
                    const user: IUser | null = this.authService.getUser();
                    if (user && (user.userId)) {
                        filteredNotes = filteredNotes.filter((note: INote) => (
                            !note.userId || // return public notes
                            note.userId === user.userId || // return notes created by this user
                            note.content[note.version].sharing.includes(user.userId) // return notes shared with this user
                        ));

                        // 2.1.1 logged in users may filter nots by selected access types
                        if (searchFilter.accessType && (searchFilter.accessType.length)) {
                            filteredNotes = filteredNotes.filter((note: INote) => (
                                (searchFilter.accessType?.includes('public') && !note.userId) ||
                                (searchFilter.accessType?.includes('shared') && note.content[note.version].sharing.includes(user.userId)) ||
                                (searchFilter.accessType?.includes('private') && note.userId === user.userId)
                            ))
                        }
                    }
                }

                // 2.2 logged out users can only access public notes (notes where note.userId === undefined)
                if (!this.authService.isLoggedIn()) {
                    filteredNotes = filteredNotes.filter((note: INote) => !note.userId)
                }

                // 3. filter by searchString on title and content
                if (searchFilter.searchStr) {
                    const searchStrRegExp: RegExp = new RegExp(`${searchFilter.searchStr}`, 'i')
                    filteredNotes = filteredNotes.filter((note: INote) => { 
                        const titleMatch: boolean = searchStrRegExp.test(note.content[note.version].title);
                        const contentMatch: boolean = searchStrRegExp.test(note.content[note.version].content);
                        return titleMatch || contentMatch;
                    })
                }

                // 4. filter by note types
                if (searchFilter.noteType && (searchFilter.noteType.length)) {
                    filteredNotes = filteredNotes.filter((note: INote) => (
                        note.content[note.version].noteType && 
                        searchFilter.noteType!.includes(note.content[note.version].noteType!)
                    ))
                }
                
                // 5. sort by: title alphabetically, content alphabetically, created, updated
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

                // 6. sort order: invert if required
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
