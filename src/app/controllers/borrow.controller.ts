import express, { Request, Response } from "express";
import { z } from "zod";
import { Borrow } from "../models/borrow.model";
import { Book } from "../models/book.model";

export const borrowRoute = express.Router();

const BorrowZodSchema = z.object({
    book: z.string().min(1, "Book ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    dueDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

borrowRoute.post("/", async (req: Request, res: Response) => {
    try {
        const body = await BorrowZodSchema.parseAsync(req.body);

        // Find the book
        const book = await Book.findById(body.book);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }
        // Check available copies
        if (book.copies < body.quantity) {
            return res.status(400).json({
                success: false,
                message: "Not enough copies available",
            });
        }
        book.copies -= body.quantity;
        await book.save();
        
        // Update available status if copies become 0
        await book.updateAvailableStatus();
        
        const borrow = await Borrow.create({
            book: body.book,
            quantity: body.quantity,
            dueDate: new Date(body.dueDate),
        });
        return res.status(201).json({
            success: true,
            message: "Book borrowed successfully",
            data: borrow,
        });

    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }
});
borrowRoute.get("/", async (req: Request, res: Response) => {
    try {
        const summary = await Borrow.aggregate([
            {
                $group: {
                    _id: "$book",
                    totalQuantity: { $sum: "$quantity" }
                }
            },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookInfo"
                }
            },
            { $unwind: "$bookInfo" },
            {
                $project: {
                    _id: 0,
                    book: {
                        title: "$bookInfo.title",
                        isbn: "$bookInfo.isbn"
                    },
                    totalQuantity: 1
                }
            }
        ]);
        res.json({
            success: true,
            message: "Borrowed books summary retrieved successfully",
            data: summary
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }
});