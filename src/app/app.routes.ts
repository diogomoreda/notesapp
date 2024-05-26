import { Routes } from '@angular/router';
import { NotesExplorerComponent } from './components/notes-explorer/notes-explorer.component';

export const routes: Routes = [
    { path: '', component: NotesExplorerComponent },
    { path: 'note/:id', component: NotesExplorerComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
