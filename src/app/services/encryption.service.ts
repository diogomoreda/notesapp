import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';


@Injectable({
    providedIn: 'root'
})
export class EncryptionService 
{
    private secretKey = 'my-api-secret-key';

    constructor() { }

    encrypt(message: string): string {
        return CryptoJS.AES.encrypt(message, this.secretKey).toString();
    }

    decrypt(encryptedMessage: string): string {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}
