import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    private reloadSubject: Subject<void> = new Subject<void>();

    reload$: Observable<void> = this.reloadSubject.asObservable();

    reload() {
        this.reloadSubject.next();
    }
}
