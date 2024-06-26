import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { IUser } from '../types/IUser-types';
import { INote } from '../types/INote-types';
import { IAllData } from '../types/types';

@Injectable({
    providedIn: 'root'
})
export class ServerService {

    // writes and reads the following keys from localStorage
    // notesapp_user 
    // notesapp_users 
    // notesapp_data
    constructor(
        private encryptionService: EncryptionService
    ) {}
    

    private getNoteLink(noteId: number) {
        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/note/${noteId}`;
    }

    reset(): Promise<IAllData> {
        return new Promise((resolve, reject) => {   
            
            const users: IUser[] = [
                { userId: 1, username: 'jon', password: 'password' },
                { userId: 2, username: 'paul', password: 'password' },
                { userId: 3, username: 'peter', password: 'password' },
                { userId: 4, username: 'mary', password: 'password' },
            ];

            const data: INote[] = [
                { noteId: 1, userId: 1, version: 0, active: true, created: new Date(), content: [
                    { title: 'A Reminder from Jon', content: 'drink more water', imgUrl: '', noteType: 'reminder', sharing: [], updated: new Date() },
                ]},
                { noteId: 2, userId: 1, version: 0, active: true, created: new Date(),  content: [
                    { title: 'What Jon has to do', content: 'groceries, tours, folding', imgUrl: '', noteType: 'todo', sharing: [], updated: new Date() },
                ]},
                { noteId: 3, userId: 1, version: 0, active: true, created: new Date(),  content: [
                    { title: 'Jon contact note', content: 'mechanic: 99 999 999 999', imgUrl: '', noteType: 'contact', sharing: [], updated: new Date() },
                ]},

                { noteId: 4, userId: 2, version: 0, active: true, created: new Date(),  content: [
                    { title: 'A Reminder from Paul', content: 'do more exercise', imgUrl: '', noteType: 'reminder', sharing: [], updated: new Date() },
                ]},
                { noteId: 5, userId: 2, version: 0, active: true, created: new Date(),  content: [
                    { title: 'What Paul has to do', content: 'a lot', imgUrl: '', noteType: 'todo', sharing: [], updated: new Date() },
                ]},
                { noteId: 6, userId: 2, version: 0, active: true, created: new Date(),  content: [
                    { title: 'Paul contact note', content: 'Susie: 99 999 999 999', imgUrl: '', noteType: 'contact', sharing: [1], updated: new Date() },
                ]},

                { noteId: 7, userId: 3, version: 0, active: true, created: new Date(),  content: [
                    { title: 'A Reminder from Peter', content: 'fix the car', imgUrl: '', noteType: 'reminder', sharing: [], updated: new Date() },
                ]},
                { noteId: 8, userId: 3, version: 0, active: true, created: new Date(),  content: [
                    { title: 'What Peter has to do', content: 'get mechanic contact', imgUrl: '', noteType: 'todo', sharing: [1], updated: new Date() },
                ]},
                { noteId: 9, userId: 3, version: 0, active: true, created: new Date(),  content: [
                    { title: 'Peter contact note', content: '', imgUrl: '', noteType: 'contact', sharing: [1], updated: new Date() },
                ]},

                { noteId: 10, userId: 4, version: 0, active: true, created: new Date(),  content: [
                    { title: 'A Reminder from Mary', content: 'feed the dog', imgUrl: '', noteType: 'reminder', sharing: [1, 2], updated: new Date() },
                ]},
                { noteId: 11, userId: 4, version: 0, active: true, created: new Date(),  content: [
                    { title: 'What Mary has to do', content: 'feed the dog', imgUrl: '', noteType: 'todo', sharing: [1, 2], updated: new Date() },
                ]},
                { noteId: 12, userId: 4, version: 0, active: true, created: new Date(),  content: [
                    { title: 'Mary contact note', content: ' dog feeder: 99 999 999 999', imgUrl: '', noteType: 'contact', sharing: [], updated: new Date() },
                ]},

                { noteId: 13, userId: 0, version: 0, active: true, created: new Date(),  content: [
                    { title: 'A Reminder from an unregistered user', content: `- remind me to finish the **unregistered** user list\n- link to [next post:](${this.getNoteLink(14)})`, imgUrl: '', noteType: 'reminder', sharing: [], updated: new Date() },
                ]},
                { noteId: 14, userId: 0, version: 0, active: true, created: new Date(),  content: [
                    { title: 'What some unregistered user has to do', content: `I need to register into notes app\n- link to [next post:](${this.getNoteLink(15)}) \n- link to [previous post:](${this.getNoteLink(13)})`, imgUrl: '', noteType: undefined, sharing: [], updated: new Date() },
                ]},
                { noteId: 15, userId: 0, version: 0, active: true, created: new Date(),  content: [
                    { title: 'Unregistered user contact note', content: `registration contact: 99 999 999 999\n- link to [previous post:](${this.getNoteLink(14)})`, imgUrl: '', noteType: undefined, sharing: [], updated: new Date() },
                ]},
                
            ];

            this.serverSetUsers(users);
            console.log('SERVER RESET SCRIPT: user seeds written in localStorage');
            
            if (localStorage.getItem('notesapp_data') === null) {
                this.serverSetData(data);
                console.log('SERVER RESET SCRIPT: data seeds written in localStorage');
            }

            const allData: IAllData = {
                users: this.serverGetUsers(),
                notes: this.serverGetData()
            }

            resolve(allData);
        })
    }


    serverSetUser(data: IUser): boolean {
        try {
            const jsonData = JSON.stringify(data);
            const encryptedData = this.encryptionService.encrypt(jsonData);
            localStorage.setItem('notesapp_user', encryptedData);
            return true;
        }
        catch(e: any) {
            return false;
        }
    }


    serverClearUser(): boolean {
        try {
            localStorage.removeItem('notesapp_user');
            return true;
        }
        catch(e: any) {
            return false;
        }
    }

    serverGetUser(): IUser | null {
        try {
            const encryptedData = localStorage.getItem('notesapp_user');
            if (!encryptedData) return null;
            const jsonData = this.encryptionService.decrypt(encryptedData);
            const data = JSON.parse(jsonData);
            return data;
        }
        catch(e: any) {
            return null;
        }
    }


    serverSetUsers(data: IUser[]): boolean {
        try {
            const jsonData = JSON.stringify(data);
            const encryptedData = this.encryptionService.encrypt(jsonData);
            localStorage.setItem('notesapp_users', encryptedData);
            return true;
        }
        catch(e: any) {
            return false;
        }
    }


    serverGetUsers(): IUser[] {
        try {
            const encryptedData = localStorage.getItem('notesapp_users');
            if (!encryptedData) return [];
            const jsonData = this.encryptionService.decrypt(encryptedData);
            const data = JSON.parse(jsonData);
            return data;
        }
        catch(e: any) {
            return [];
        }
    }


    serverSetData(data: INote[]): boolean {
        try {
            const jsonData = JSON.stringify(data);
            const encryptedData = this.encryptionService.encrypt(jsonData);
            localStorage.setItem('notesapp_data', encryptedData);
            return true;
        }
        catch(e: any) {
            return false;
        }
    }


    serverGetData(): INote[] {
        try {
            const encryptedData = localStorage.getItem('notesapp_data');
            if (!encryptedData) return [];
            const jsonData = this.encryptionService.decrypt(encryptedData);
            const data = JSON.parse(jsonData);
            return data;
        }
        catch(e: any) {
            return [];
        }
    }


    async encodeFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string); 
            }
            reader.readAsDataURL(file);
        })
    }

}
