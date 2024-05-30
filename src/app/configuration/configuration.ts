
export const MaxFilterSearchLength: number = 60;

export const MaxNoteTitleLength: number = 60;

export const MaxNoteContentLength: number = 500;

export const MaxUploadFileSize: number = 0.3 * 1024 * 1024; // 300kb Default max size is 5MB

// options for select boxes

export const noteTypes = [
    { value: 'reminder', label: 'Reminder' },
    { value: 'todo', label: 'Todo' },
    { value: 'contact', label: 'Contact' },
];

export const accessTypes = [
    { value: 'private', label: 'Created by me' },
    { value: 'shared', label: 'Shared with me' },
    { value: 'public', label: 'Public' },
];

export const sortOptions = [
    { value: 'title', label: 'note title' },
    { value: 'content', label: 'note content' },
    { value: 'updated', label: 'last updated date' },
    { value: 'created', label: 'creation date' }
];

export const sortOrders = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
];