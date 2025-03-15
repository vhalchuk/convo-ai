export interface Service {
    initialize?(): Promise<void> | void;
    cleanup?(): Promise<void> | void;
    name: string;
}