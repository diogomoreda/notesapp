import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { AuthenticationService } from './authentication.service';
import { Observable, map, of } from 'rxjs';
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


    getNoteContent(note: INote) {
        const versionNumber = note.version || 0;
        return note.content[versionNumber];
    }

    setNoteContent(note: INote, noteContent: INoteContent): INote {
        noteContent.updated = new Date();
        note.content.push(noteContent);
        const versionNumber = note.content.length - 1;
        note.version = versionNumber;
        return note;
    }


    get(searchFilter: ISearchFilter): Observable<INote[]> {
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
                
                let filteredNotes: INote[] = notes;

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
                if (searchFilter.userType) {
                    filteredNotes = filteredNotes.filter((note: INote) => note.userType && note.userType === searchFilter.userType)
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
}
