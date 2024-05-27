export type IUserType = 'typeA' | 'typeB';

export interface IUser {
    userId: number;
    username: string;
    password?: string;
} 

export interface IUserShareOption {
    userId: number;
    username: string;
    selected: boolean;
}



