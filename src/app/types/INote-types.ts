import { IUserType } from "./IUser-types";

export type INoteType = 'reminder' | 'todo' | 'contact';

export interface INoteContent {
    title: string;
    content: string;
    imgUrl: string;
    noteType?: INoteType;
    public: boolean;
    updated: Date;
}

export interface INote {
    noteId: number;
    userId?: number;
    userType?: IUserType;
    version: number;
    content: INoteContent[];
    active: boolean;
    created: Date;
}

