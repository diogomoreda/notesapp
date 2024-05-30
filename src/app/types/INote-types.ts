
export type INoteType = 'reminder' | 'todo' | 'contact';

export interface INoteContent {
    title: string;
    content: string;
    imgUrl?: string;
    noteType?: INoteType;
    sharing: number[];
    updated: Date;
}

export interface INote {
    noteId: number;
    userId?: number;
    version: number;
    content: INoteContent[];
    active: boolean;
    created: Date;
}

