import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, SelectControlValueAccessor, Validators, FormArray } from '@angular/forms'; // Import FormsModule
import { Observable, Subscription, combineLatest, debounceTime, distinctUntilChanged, map, merge, mergeAll } from 'rxjs';
import { MarkdownModule } from 'ngx-markdown';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioModule, MatRadioGroup, MatRadioChange } from '@angular/material/radio'
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectChange, MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MaxUploadFileSize, MaxNoteTitleLength, MaxNoteContentLength } from '../../configuration/configuration';
import { noteTypes } from '../../configuration/configuration';
import { ApiUsersService } from '../../services/api-users.service';
import { ServerService } from '../../services/server.service';
import { ApiNotesService } from '../../services/api-notes.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

import { INote, INoteContent } from '../../types/INote-types';
import { IUser, IUserShareOption } from '../../types/IUser-types';


@Component({
    selector: 'note-details',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, MarkdownModule, MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule],
    templateUrl: './note-details.component.html',
    styleUrl: './note-details.component.scss'
})
export class NoteDetailsComponent implements OnInit, OnDestroy {

    loading!: boolean;
    error!: string;
    mode?: 'view' | 'edit' | 'add';

    note!: INote;
    noteLink!: any;
    noteTypes = noteTypes;
    encodedImg!: string;
    get encodedImgUrl() { return !this.encodedImg ? `` : `url(${this.encodedImg})` };

    createdBy!: string | null;
    users!: IUserShareOption[];
    sharingList!: IUserShareOption[];
    
    hasAccess!: boolean;
    isOwner!: boolean;
    isLoggedIn!: boolean;
    
    editForm!: FormGroup;
    actions: {[key: string]: any } = { 
        'edit': this.apiNotesService.patchRequest.bind(this.apiNotesService), 
        'add': this.apiNotesService.postRequest.bind(this.apiNotesService)
    }

    private subscriptions: Subscription[] = [];


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<NoteDetailsComponent>,
        private apiNotesService: ApiNotesService,
        private apiUsersService: ApiUsersService,
        private authService: AuthenticationService,
        private serverService: ServerService,
        private router: Router
    ) {}

    
    ngOnInit() {
        this.editForm = new FormGroup({
            titleField: new FormControl('', [Validators.required, Validators.maxLength(MaxNoteTitleLength)]),
            selectedNoteType: new FormControl('', []),
            contentField: new FormControl('', [Validators.required, Validators.maxLength(MaxNoteContentLength)]),
        });
        this.mode = this.data.mode || 'view';
        const user: IUser | null = this.authService.getUser();
        if (!user) {
            this.createdBy = null;
            this.users = [];
            this.sharingList = [];
            this.isLoggedIn = false;
            this.initMode();
            return;
        }
        this.isLoggedIn = true;
        const subscription = this.apiUsersService.getAll(user.userId)
        .subscribe({
            next: (users: IUser[]) => {
                this.users = users.map((u: IUser) => ({ 
                    userId: u.userId, 
                    username: u.username, 
                    selected: false 
                }));
                this.sharingList = this.users.filter((u: IUser) => u.userId !== user.userId);
                this.initMode();
            },
            error: (err: any) => {
                console.error(err);
                this.initMode();
            }
        });
        this.subscriptions.push(subscription)
    }


    private initMode() {
        if (this.mode === 'add') {
            this.note = this.createNote();
            this.noteLink = this.apiNotesService.getNoteLink(this.note.noteId);
            this.hasAccess = true;
            this.isOwner = true;
            this.createdBy = null;
            return;
        }
        const subscription = this.apiNotesService.getById(+this.data.noteId)
        .subscribe({
            next: (note: INote | undefined) => {
                if (note) {
                    this.note = note;
                    this.noteLink = this.apiNotesService.getNoteLink(this.note.noteId);
                    this.hasAccess = this.authService.getAccess(this.note);
                    this.isOwner = this.authService.getOwnership(this.note);
                    this.createdBy = this.note.userId ? this.getUsername(this.note.userId) : null;
                    this.encodedImg = this.note.content[this.note.version].imgUrl || '';
                    return;
                }
                console.error('unable to retrieve data')
            },
            error: (err: any) => {
                console.error(err);
            }
        });
        this.subscriptions.push(subscription);
    }


    private createNote(): INote {
        return {
            noteId: this.apiNotesService.nextId(),
            userId: this.authService.getUser()?.userId,
            version: 0,
            active: true,
            created: new Date(),
            content: []
        }
    }


    onEditClick() {
        this.editForm.get('titleField')?.setValue(this.note.content[this.note.version].title);
        this.editForm.get('selectedNoteType')?.setValue(this.note.content[this.note.version].noteType);
        this.editForm.get('contentField')?.setValue(this.note.content[this.note.version].content);
        this.sharingList.forEach((user: IUserShareOption) => {
            user.selected = this.note.content[this.note.version].sharing.includes(user.userId);
        })
        this.mode = 'edit';
    }


    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.name) {
                const fileName = file.name;
                const fileExtension = fileName.split('.').pop().toLowerCase();
                if (!['jpg', 'png'].includes(fileExtension)) {
                    this.error = `only jpg and png image files are acceptable.`
                    return; 
                }
            }
            if (file.size > MaxUploadFileSize) {
                this.error = `file is too large. max file size is ${(MaxUploadFileSize/1024)}kB.`
                return; 
            }
            this.serverService.encodeFile(file).then((encodedFile: string) => {
                this.encodedImg = encodedFile;
            });
        }
    }


    onSaveClick() {
        if (this.mode !== 'edit' && this.mode !== 'add') return;
        if (!this.editForm.valid) return;
        const noteContent: INoteContent = {
            title: this.editForm.get('titleField')?.value,
            noteType: this.editForm.get('selectedNoteType')?.value,
            content: this.editForm.get('contentField')?.value,
            imgUrl: this.encodedImg ? this.encodedImg : '',
            updated: new Date(),
            sharing: this.sharingList.filter((user: IUserShareOption) => user.selected).map((user: IUserShareOption) => user.userId),
        }
        this.note.content.push(noteContent);
        this.note.version = this.note.content.length - 1;
        const subscription = this.actions[this.mode](this.note)
        .subscribe({
            next: () => {
                if (this.mode === 'add') {
                    this.dialogRef.close(true);
                }
                this.mode = 'view';
            },
            error: (err: any) => {
                console.error(err)
            }
        })
        this.subscriptions.push(subscription);
    }


    loadRevision(revision: INoteContent) {
        this.openConfirmationDialog(
            `<div>Are You sure you would like to load this revision?</div>
            <div>All your current data will be overwritten if you confirm!</div>`,
            () => {
                this.note.content[this.note.version] = revision;
                this.onEditClick();
            }
        );
    }


    onDeleteClick() {
        this.openConfirmationDialog(
            'Are You sure you would like to delete this note?',
            () => {
                const subscription = this.apiNotesService.deleteRequest(this.note.noteId)
                .subscribe({
                    next: () => {
                        this.dialogRef.close(true);
                    },
                    error: (err: any) => {
                        console.error(err)
                    }
                })
                this.subscriptions.push(subscription);
            }
        )
    }


    getUsername(userId: number): string {
        const i = this.users.findIndex((u: IUser) => u.userId === userId);
        if (i !== -1) return this.users[i].username;
        return ''
    }


    private openConfirmationDialog(message: string, callback?: any) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
            data: {
                message: message
            }
        });
        const subscription = dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                if (callback) callback();
            }
        });
        this.subscriptions.push(subscription);
    }


    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

}
