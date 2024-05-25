import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, SelectControlValueAccessor } from '@angular/forms'; // Import FormsModule
import { Observable, combineLatest, debounceTime, distinctUntilChanged, map, merge, mergeAll } from 'rxjs';

import { MatRadioModule, MatRadioGroup, MatRadioChange } from '@angular/material/radio'
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ApiNotesService } from '../../services/api-notes.service';

import { INote, INoteType } from '../../types/INote-types';
import { INoteSortOption, ISearchFilter, ISortOrder } from '../../types/types';
import { IUserType } from '../../types/IUser-types';

@Component({
  selector: 'notes-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatRadioModule, MatRadioGroup, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './notes-explorer.component.html',
  styleUrl: './notes-explorer.component.scss'
})
export class NotesExplorerComponent implements OnInit
{
    notes: INote[] = [];
    searchForm!: FormGroup;
    searchFilter: ISearchFilter = {};

    noteTypes = [
        { value: 'reminder', label: 'Reminder' },
        { value: 'todo', label: 'Todo' },
        { value: 'contact', label: 'Contact' },
    ];
    userTypes = [
        { value: 'typeA', label: 'Type A' },
        { value: 'typeB', label: 'Type B' },
    ];
    sortOptions = [
        { value: 'title', label: 'note title' },
        { value: 'content', label: 'note content' },
        { value: 'updated', label: 'last updated date' },
        { value: 'created', label: 'creation date' }
    ];
    sortOrders = [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' }
    ];

    
    constructor(
        private apiNotesService: ApiNotesService
    ) {}


    ngOnInit(): void {
        this.getNotes();
        this.initForm();
    }


    initForm() {
        this.searchForm = new FormGroup({
            stringSearchField: new FormControl('', []),
            selectedNoteType: new FormControl('', []),
            selectedUserType: new FormControl('', []),
            selectedSort: new FormControl('created', []),
            selectedOrder: new FormControl('asc', []),
        });

        const stringSearchField$: Observable<string> = this.searchForm.get('stringSearchField')!.valueChanges.pipe( debounceTime(500), distinctUntilChanged() );
        const selectedNoteType$: Observable<INoteType> = this.searchForm.get('selectedNoteType')!.valueChanges;
        const selectedUserType$: Observable<IUserType> = this.searchForm.get('selectedUserType')!.valueChanges;
        const selectedSort$: Observable<INoteSortOption> = this.searchForm.get('selectedSort')!.valueChanges;
        const selectedOrder$: Observable<ISortOrder> = this.searchForm.get('selectedOrder')!.valueChanges;
        
        merge(
            stringSearchField$,
            selectedNoteType$,
            selectedUserType$,
            selectedSort$,
            selectedOrder$
        ).subscribe(() => {
            this.searchFilter = {
                searchStr: this.searchForm.get('stringSearchField')!.value,
                noteType: this.searchForm.get('selectedNoteType')!.value,
                userType: this.searchForm.get('selectedUserType')!.value,
                sortOption: this.searchForm.get('selectedSort')!.value,
                sortOrder: this.searchForm.get('selectedOrder')!.value
            };
            this.getNotes();
        })
        
    }


    getFilters() {
        this.searchFilter = {};

    }


    clearFilters() {
        this.searchForm.reset({
            stringSearchField: '',
            selectedNoteType: '',
            selectedUserType: '',
            selectedSort: 'created',
            selectedOrder: 'asc'
        }, { emitEvent: false });
        this.searchFilter = {
            sortOption: this.searchForm.get('selectedSort')?.value,
            sortOrder: this.searchForm.get('selectedOrder')?.value
        };
        this.getNotes();
    }


    getNotes(): void {
        console.log(this.searchFilter);
        this.apiNotesService.get(this.searchFilter)
        .subscribe({
            next: (response: INote[]) => {
                this.notes = response;
            },
            error: (e: any) => {
                console.error(e);
            }
        });
    }

}
