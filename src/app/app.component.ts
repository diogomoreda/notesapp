import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { ServerService } from './services/server.service';
import { NotesExplorerComponent } from './components/notes-explorer/notes-explorer.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MainHeaderComponent, NotesExplorerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit
{
    title = 'notes app';

    constructor(
        private serverService: ServerService
    ) {}

    ngOnInit() {
        this.serverService.reset();
    }
}
