export interface Response<T> {
    success: boolean;
    message?: string;
    content?: T;
    error?: any;
}