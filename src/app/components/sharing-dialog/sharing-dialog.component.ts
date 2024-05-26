import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '../../types/IUser-types';
import { ApiUsersService } from '../../services/api-users.service';
import { AuthenticationService } from '../../services/authentication.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-sharing-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './sharing-dialog.component.html',
    styleUrl: './sharing-dialog.component.scss'
})
export class SharingDialogComponent implements OnInit {

    users!: IUser[];
    selected!: IUser[];

    constructor(
        public dialogRef: MatDialogRef<SharingDialogComponent>,
        private apiUsersService: ApiUsersService,
        private authService: AuthenticationService
    ) {}


    ngOnInit() {
        this.apiUsersService.getAll(this.authService.getUser()?.userId)
        .subscribe({
            next: (users: IUser[]) => {
                this.users = users;
            },
            error: (err: any) => {
                console.error(err);
            }
        })
    }

    toggleUser(event: MatCheckboxChange , user: IUser) {
        this.selected = this.selected.filter((u: IUser) => u.userId !== user.userId)
        if (event.checked) this.selected.push(user);
    }

    cancel() {
        this.dialogRef.close();
    }

    confirm() {
        this.dialogRef.close(this.selected);
    }
}
