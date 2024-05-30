import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, SelectControlValueAccessor, Validators } from '@angular/forms'; // Import FormsModule
import { Observable, Subscription, combineLatest, debounceTime, distinctUntilChanged, map, merge, mergeAll } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule, MatRadioGroup } from '@angular/material/radio'
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { noteTypes, accessTypes, sortOptions, sortOrders } from '../../configuration/configuration';
import { ApiNotesService } from '../../services/api-notes.service';
import { GlobalService } from '../../services/global.service';
import { AuthenticationService } from '../../services/authentication.service';
import { NoteDetailsComponent } from '../note-details/note-details.component';

import { INote, INoteType } from '../../types/INote-types';
import { INoteSortOption, ISearchFilter, ISortOrder } from '../../types/types';
import { IUserType } from '../../types/IUser-types';


@Component({
  selector: 'notes-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatToolbarModule, MatCardModule, MatGridListModule, MatRadioModule, MatRadioGroup, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './notes-explorer.component.html',
  styleUrl: './notes-explorer.component.scss'
})
export class NotesExplorerComponent implements OnInit, OnDestroy
{
    notes: INote[] = [];
    searchForm!: FormGroup;
    searchFilter: ISearchFilter = {};

    noteTypes = noteTypes;
    accessTypes = accessTypes;
    sortOptions = sortOptions;
    sortOrders = sortOrders;

    loggedIn!: boolean;
    private reloadSubscription!: Subscription;
    private loginSubscription!: Subscription;
    private subscriptions: Subscription[] = [];

    constructor(
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private apiNotesService: ApiNotesService,
        private authService: AuthenticationService,
        private globalService: GlobalService,
    ) {}


    ngOnInit(): void {
        this.loggedIn = this.authService.isLoggedIn();
        //console.log('ngOnInit', this.loggedIn);
        const subscription = this.apiNotesService.getRequest(this.searchFilter)
        .subscribe({
            next: (response: INote[]) => {
                this.notes = response;
                this.initForm();
                this.setupQueryParser();
                this.setupSubscriptions();
            },
            error: (e: any) => {
                console.error(e);
            }
        });
        this.subscriptions.push(subscription);
    }


    private initForm() {
        this.searchForm = new FormGroup({
            stringSearchField: new FormControl('', [Validators.maxLength(30)]),
            selectedNoteType: new FormControl([], []),
            selectedAccessType: new FormControl([], []),
            selectedSort: new FormControl('created', []),
            selectedOrder: new FormControl('asc', []),
        });

        const stringSearchField$: Observable<string> = this.searchForm.get('stringSearchField')!.valueChanges.pipe( debounceTime(500), distinctUntilChanged() );
        const selectedNoteType$: Observable<INoteType> = this.searchForm.get('selectedNoteType')!.valueChanges;
        const selectedAccessType$: Observable<IUserType> = this.searchForm.get('selectedAccessType')!.valueChanges;
        const selectedSort$: Observable<INoteSortOption> = this.searchForm.get('selectedSort')!.valueChanges;
        const selectedOrder$: Observable<ISortOrder> = this.searchForm.get('selectedOrder')!.valueChanges;
        
        const subscription = merge(
            stringSearchField$,
            selectedNoteType$,
            selectedAccessType$,
            selectedSort$,
            selectedOrder$
        ).subscribe(() => {
            this.searchFilter = {
                searchStr: this.searchForm.get('stringSearchField')!.value,
                noteType: this.searchForm.get('selectedNoteType')!.value,
                accessType: this.searchForm.get('selectedAccessType')!.value,
                sortOption: this.searchForm.get('selectedSort')!.value,
                sortOrder: this.searchForm.get('selectedOrder')!.value
            };
            this.getNotes();
        });
        this.subscriptions.push(subscription);
    }


    private setupQueryParser() {
        const subscription = this.route.paramMap
        .subscribe(params => {
            const noteId = params.get('id');
            if (!noteId) return;
            const dialogRef = this.openNoteDialog(+noteId);
            const sub = dialogRef.afterClosed()
            .subscribe(result => {
                this.router.navigate(['/'], { queryParams: null });
                if (result === true) this.getNotes();
            });
            this.subscriptions.push(sub);
        });
        this.subscriptions.push(subscription);
    }


    private setupSubscriptions() {
        this.reloadSubscription = this.globalService.reload$.subscribe(() => {
            this.getNotes();
        });
        this.loginSubscription = this.authService.login$.subscribe((state: boolean) => {
            // console.log('is user logged in? ', state);
            this.loggedIn = this.authService.isLoggedIn();
        })
    }


    private getNotes(): void {
        //console.log(this.searchFilter);
        const subscription = this.apiNotesService.getRequest(this.searchFilter)
        .subscribe({
            next: (response: INote[]) => {
                this.notes = response;
            },
            error: (e: any) => {
                console.error(e);
            }
        });
        this.subscriptions.push(subscription);
    }


    private openNoteDialog(noteId: number): MatDialogRef<NoteDetailsComponent, any> {
        const dialogRef = this.dialog.open(NoteDetailsComponent, {
            data: {
                mode: 'view',
                noteId: noteId,
            }
        });
        return dialogRef;
    }


    loadNoteDialog(noteId: number) {
        const dialogRef = this.openNoteDialog(+noteId);
        const subscription = dialogRef.afterClosed()
        .subscribe(result => {
            if (result === true) this.getNotes();
        });
        this.subscriptions.push(subscription);
    }


    clearFilters() {
        this.searchForm.reset({
            stringSearchField: '',
            selectedNoteType: [],
            selectedUserType: [],
            selectedSort: 'created',
            selectedOrder: 'asc'
        }, { emitEvent: false });
        this.searchFilter = {
            sortOption: this.searchForm.get('selectedSort')?.value,
            sortOrder: this.searchForm.get('selectedOrder')?.value
        };
        this.getNotes();
    }


    onAddClick() {
        const dialogRef = this.dialog.open(NoteDetailsComponent, {
            data: {
                mode: 'add'
            }
        });
        const subscription = dialogRef.afterClosed()
        .subscribe(result => {
            if (result === true) this.getNotes();
        }) 
        this.subscriptions.push(subscription);  
    }
    

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

}
