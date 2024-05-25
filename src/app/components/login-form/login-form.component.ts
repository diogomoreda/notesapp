import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ILoginCredentials } from '../../types/types';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'login-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ClickOutsideDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent 
{
    @Output() clickOutsideEmitter = new EventEmitter<void>();
    
    loading: boolean = true;
    error: string = '';
   
    formData: ILoginCredentials = {
        username: '',
        password: ''
    };

    loggedIn: boolean = false;
    
    constructor(
        private authService: AuthenticationService
    ) { }

    ngOnInit(): void {
        this.initForm()
    }

    private initForm() {
        this.loading = false;
        this.error = '';
        this.loggedIn = this.authService.isLoggedIn();
        this.formData = {
            username: '',
            password: ''
        };  
    }

    async onLoginSubmit() {
        this.loading = true;
        this.error = '';
        this.authService.login(this.formData)
        .subscribe({
            next: (loginResponse: boolean) => {
                if (loginResponse) {
                    this.clickOutsideEmitter.emit();
                }
            },
            error: (error: any) => {
                this.error = error.message;
            },
            complete: () => {
                this.initForm()
            }
        });
    }

    async onLogoutSubmit() {
        this.loading = true;
        this.authService.logout().subscribe({
            next: () => {
                
            },
            error: (error: any) => {
                this.error = error.message;
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
                this.initForm();
                this.clickOutsideEmitter.emit();
            }
        })
    }


    onClickedOutside() {
        this.clickOutsideEmitter.emit();
    }

    /////////////////////////////////////////////////////////////////////////////////////
    //
    //  CODE FOR TESTING / DEBUGGING:
    //
    /////////////////////////////////////////////////////////////////////////////////////
    
    fillForm(username: string, password: string) {
        this.formData = {
            username: username,
            password: password
        };  
    }
}
