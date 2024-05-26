import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {

    @Output() closeDialogEmitter = new EventEmitter<void>();

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}


    private closeDialog(data?: any): void {
        this.dialogRef.close(data);
    }

    onClickedOutside() {
        this.closeDialog()
    }

    cancel() {
        this.closeDialog();
    }

    confirm() {
        this.closeDialog(true);
    }
}