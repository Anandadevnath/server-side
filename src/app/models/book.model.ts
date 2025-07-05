import mongoose, { Schema } from "mongoose";
import { IBook, IBookModel } from "../interface/book.interface";

const bookSchema = new Schema<IBook>({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { 
        type: String, 
        required: true, 
        enum: ["FICTION", "NON_FICTION", "SCIENCE", "HISTORY", "BIOGRAPHY", "FANTASY"] 
    },
    isbn: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    copies: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true }
});

// Static method to update available status when copies become 0
bookSchema.statics.updateAvailableStatus = async function(bookId: string): Promise<void> {
    const book = await this.findById(bookId);
    if (book && book.copies === 0 && book.available) {
        book.available = false;
        await book.save();
    }
};

// Instance method to update available status
bookSchema.methods.updateAvailableStatus = async function(): Promise<void> {
    if (this.copies === 0 && this.available) {
        this.available = false;
        await this.save();
    }
};

export const Book = mongoose.model<IBook, IBookModel>("Book", bookSchema);
