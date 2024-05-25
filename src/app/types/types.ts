import { INote, INoteType } from "./INote-types";
import { IUser, IUserType } from "./IUser-types";

export interface IAllData {
    users: IUser[];
    notes: INote[];
}

export interface ILoginCredentials {
    username: string;
    password: string;
}

export type ISortOrder = 'asc' | 'desc';
export type INoteSortOption = 'title' | 'content' | 'updated' | 'created';

export interface ISearchFilter {
    searchStr?: string;
    noteType?: INoteType;
    userType?: IUserType;
    sortOption?: INoteSortOption; 
    sortOrder?: ISortOrder;
}

