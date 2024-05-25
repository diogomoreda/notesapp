import { Component, Input } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginFormComponent } from '../login-form/login-form.component';

@Component({
    selector: 'main-header',
    standalone: true,
    imports: [LoginFormComponent],
    templateUrl: './main-header.component.html',
    styleUrl: './main-header.component.scss'
})
export class MainHeaderComponent 
{
    @Input() title: string = '';
    displayLoginForm: boolean = false;

    constructor(
        private authService: AuthenticationService,
    ) { }


    toggleLoginFormDisplay(event: Event) {
        event.stopPropagation();
        this.displayLoginForm = !this.displayLoginForm;
    }

    isLoggedIn() {
        return this.authService.isLoggedIn();
    }

    hideLoginForm() {
        this.displayLoginForm = false;
    }
}
