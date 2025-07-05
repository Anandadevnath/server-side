import { Request, Response } from "express";
import { Book } from "../models/book.model";
import express from "express";
import { z } from "zod";

export const booksRoute = express.Router();

const BookZodSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    genre: z.enum(["FICTION", "NON_FICTION", "SCIENCE", "HISTORY", "BIOGRAPHY", "FANTASY"]),
    isbn: z.string().min(1, "ISBN is required"),
    description: z.string().optional(),
    image: z.string().url("Invalid URL format").optional(),
    copies: z.number().int().nonnegative(),
    available: z.boolean().optional(),
});

booksRoute.post("/", async (req: Request, res: Response) => {
    try {
        const body = await BookZodSchema.parseAsync(req.body);
        const book = await Book.create(body);
        res.status(201).json({
            success: true,
            message: "Book created successfully",
            data: book
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }
});
//get all books
booksRoute.get("/", async (req: Request, res: Response) => {
    try {
        const { filter, sortBy = "createdAt", sort = "desc", limit = "10" } = req.query;

        const query: any = {};
        if (filter) {
            query.genre = filter;
        }

        const sortObj: any = {};
        sortObj[sortBy as string] = sort === "asc" ? 1 : -1;

        const books = await Book.find(query)
            .sort(sortObj)
            .limit(Number(limit));

        res.json({
            success: true,
            message: "Books retrieved successfully",
            data: books
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
//get single book with id
booksRoute.get("/:bookId", async (req: Request, res: Response) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId);
        res.json({
            success: true,
            message: "Book retrieved successfully",
            data: book
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// Update a book by ID
booksRoute.patch("/:bookId", async (req: Request, res: Response) => {
    try {
        const body = await BookZodSchema.partial().parseAsync(req.body);
        const { bookId } = req.params;
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            body,
            { new: true, runValidators: true }
        );
        if (!updatedBook) {
            res.status(404).json({
                success: false,
                message: "Book not found",
            });
            return;
        }
        res.json({
            success: true,
            message: "Book updated successfully",
            data: updatedBook
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }
});

// Delete a book by ID
booksRoute.delete("/:bookId", async (req: Request, res: Response) => {
    try {
        const { bookId } = req.params;
        await Book.findByIdAndDelete(bookId);
        res.json({
            success: true,
            message: "Book deleted successfully",
            data: null
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});