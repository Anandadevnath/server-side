import { Document, Model } from "mongoose";

export interface IBook {
    title: string;
    author:string;
    genre:  "FICTION" | 'NON_FICTION' | 'SCIENCE' | 'HISTORY' | 'BIOGRAPHY' | 'FANTASY'
    isbn:string;
    description:string
    image?: string;
    copies:number
    available:boolean
    updateAvailableStatus(): Promise<void>;
}

export interface IBookModel extends Model<IBook> {
    updateAvailableStatus(bookId: string): Promise<void>;
}