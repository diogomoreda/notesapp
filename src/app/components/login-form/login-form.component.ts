import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { GlobalService } from '../../services/global.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ILoginCredentials } from '../../types/types';


@Component({
  selector: 'login-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ClickOutsideDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnDestroy
{
    @Output() clickOutsideEmitter = new EventEmitter<void>();
    
    loading: boolean = true;
    error: string = '';
   
    formData: ILoginCredentials = {
        username: '',
        password: ''
    };

    loggedIn: boolean = false;

    private subscriptions: Subscription[] = [];
    
    constructor(
        private authService: AuthenticationService,
        private globalService: GlobalService,
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
        const subscription = this.authService.login(this.formData)
        .subscribe({
            next: (loginResponse: boolean) => {
                if (loginResponse) {
                    this.clickOutsideEmitter.emit();
                    this.globalService.reload();
                }
            },
            error: (error: any) => {
                this.error = error.message;
            },
            complete: () => {
                this.initForm()
            }
        });
        this.subscriptions.push(subscription);
    }

    async onLogoutSubmit() {
        this.loading = true;
        const subscription = this.authService.logout()
        .subscribe({
            next: () => {
                this.loading = false;
                this.initForm();
                this.clickOutsideEmitter.emit();
                this.globalService.reload();
            },
            error: (error: any) => {
                this.error = error.message;
                this.loading = false;
            }
        });
        this.subscriptions.push(subscription);
    }


    onClickedOutside() {
        this.clickOutsideEmitter.emit();
    }


    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
