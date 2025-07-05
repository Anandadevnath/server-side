import { IBorrow } from "../interface/borrow.interface";
import { Schema } from "mongoose";
import mongoose from "mongoose";
const borrowSchema = new Schema<IBorrow>({
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
    dueDate: { type: Date, required: true }
});

export const Borrow = mongoose.model<IBorrow>("Borrow",borrowSchema)