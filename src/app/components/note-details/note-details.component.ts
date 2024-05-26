import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { INote, INoteContent } from '../../types/INote-types';
import { MarkdownModule } from 'ngx-markdown';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, SelectControlValueAccessor, Validators } from '@angular/forms'; // Import FormsModule
import { Observable, combineLatest, debounceTime, distinctUntilChanged, map, merge, mergeAll } from 'rxjs';
import { noteTypes, userTypes } from '../../data/options';

import { MatDialog } from '@angular/material/dialog';
import { MatRadioModule, MatRadioGroup, MatRadioChange } from '@angular/material/radio'
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectChange, MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { ApiNotesService } from '../../services/api-notes.service';
import { AuthenticationService } from '../../services/authentication.service';
import { IUser } from '../../types/IUser-types';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { SharingDialogComponent } from '../sharing-dialog/sharing-dialog.component';
import { ApiUsersService } from '../../services/api-users.service';


@Component({
    selector: 'note-details',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MarkdownModule, MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule],
    templateUrl: './note-details.component.html',
    styleUrl: './note-details.component.scss'
})
export class NoteDetailsComponent implements OnInit {

    loading!: boolean;
    error!: string;
    mode?: 'view' | 'edit' | 'add';

    note!: INote;
    noteLink!: any;
    noteTypes = noteTypes;

    users!: IUser[];
    
    hasAccess!: boolean;
    isOwner!: boolean;
    
    editForm!: FormGroup;
    actions: {[key: string]: any } = { 
        'edit': this.apiNotesService.patchRequest.bind(this.apiNotesService), 
        'add': this.apiNotesService.postRequest.bind(this.apiNotesService)
    }


    constructor(
        public dialogRef: MatDialogRef<NoteDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private apiNotesService: ApiNotesService,
        private apiUsersService: ApiUsersService,
        private authService: AuthenticationService,
        private router: Router
    ) {}


    ngOnInit() {
        this.editForm = new FormGroup({
            titleField: new FormControl('', [Validators.required, Validators.maxLength(50)]),
            selectedNoteType: new FormControl('', []),
            contentField: new FormControl('', [Validators.required, Validators.maxLength(300)]),
        });
        this.mode = this.data.mode || 'view';
        this.apiUsersService.getAll(this.authService.getUser()?.userId)
        .subscribe({
            next: (users: IUser[]) => {
                this.users = users;
            },
            error: (err: any) => {
                console.error(err);
            }
        })
        if (this.mode === 'add') {
            this.note = this.createNote();
            this.noteLink = this.apiNotesService.getNoteLink(this.note.noteId);
            this.hasAccess = true;
            this.isOwner = true;
            return;
        }
        this.apiNotesService.getById(+this.data.noteId)
        .subscribe({
            next: (note: INote | undefined) => {
                if (!note) throw new Error('could not retrieve data')
                this.note = note;
                this.noteLink = this.apiNotesService.getNoteLink(this.note.noteId);
                this.hasAccess = this.authService.getAccess(this.note);
                this.isOwner = this.authService.getOwnership(this.note);
            },
            error: (err: any) => {
                console.error(err);
            }
        });
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
        this.mode = 'edit';
    }


    onSaveClick() {
        if (this.mode !== 'edit' && this.mode !== 'add') return;
        if (!this.editForm.valid) return;
        const noteContent: INoteContent = {
            title: this.editForm.get('titleField')?.value,
            noteType: this.editForm.get('selectedNoteType')?.value,
            content: this.editForm.get('contentField')?.value,
            imgUrl: '',
            updated: new Date(),
            sharing: []
        }
        this.note.content.push(noteContent);
        this.note.version = this.note.content.length - 1;
        this.actions[this.mode](this.note)
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
                this.apiNotesService.deleteRequest(this.note.noteId)
                .subscribe({
                    next: () => {
                        this.dialogRef.close(true);
                    },
                    error: (err: any) => {
                        console.error(err)
                    }
                })
                
            }
        )
    }

    updateUserSharing(event: MatCheckboxChange, user: IUser) {
        this.note.content[this.note.version].sharing = this.note.content[this.note.version].sharing.filter((i: number) => i !== user.userId);
        if (event.checked) this.note.content[this.note.version].sharing.push(user.userId);
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
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                if (callback) callback();
            }
        })   
    }
}
