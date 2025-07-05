# Library Management System API Documentation

**Base URL:** `https://librarymanagement2.vercel.app`

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Book Routes](#book-routes)
- [Borrow Routes](#borrow-routes)
- [Error Handling](#error-handling)

## Overview

This API provides endpoints for managing a library system including books and borrowing functionality.

## Authentication

Currently, this API does not require authentication.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { /* response data */ }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "errors": [ /* validation errors if applicable */ ]
}
```

## Book Routes

### 1. Create a Book

**Endpoint:** `POST /api/books`

**Description:** Creates a new book in the library system.

**Request Body:**
```json
{
    "title": "string (required)",
    "author": "string (required)",
    "genre": "FICTION | NON_FICTION | SCIENCE | HISTORY | BIOGRAPHY | FANTASY (required)",
    "isbn": "string (required)",
    "description": "string (optional)",
    "image": "string (optional, must be valid URL)",
    "copies": "number (required, non-negative integer)",
    "available": "boolean (optional, defaults to true)"
}
```

**Example Request:**
```json
{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "FICTION",
    "isbn": "978-0-7432-7356-5",
    "description": "A classic American novel",
    "image": "https://example.com/gatsby.jpg",
    "copies": 5,
    "available": true
}
```

**Success Response:** `201 Created`
```json
{
    "success": true,
    "message": "Book created successfully",
    "data": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "genre": "FICTION",
        "isbn": "978-0-7432-7356-5",
        "description": "A classic American novel",
        "image": "https://example.com/gatsby.jpg",
        "copies": 5,
        "available": true,
        "createdAt": "2021-07-21T10:30:00.000Z",
        "updatedAt": "2021-07-21T10:30:00.000Z"
    }
}
```

---

### 2. Get All Books

**Endpoint:** `GET /api/books`

**Description:** Retrieves a list of all books with optional filtering and sorting.

**Query Parameters:**
- `filter` (optional): Filter by genre (FICTION, NON_FICTION, SCIENCE, HISTORY, BIOGRAPHY, FANTASY)
- `sortBy` (optional): Field to sort by (default: "createdAt")
- `sort` (optional): Sort direction "asc" or "desc" (default: "desc")
- `limit` (optional): Number of books to return (default: 10)

**Example Requests:**
```
GET /api/books
GET /api/books?filter=FICTION
GET /api/books?sortBy=title&sort=asc&limit=20
GET /api/books?filter=SCIENCE&sortBy=author&sort=asc&limit=5
```

**Success Response:** `200 OK`
```json
{
    "success": true,
    "message": "Books retrieved successfully",
    "data": [
        {
            "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald",
            "genre": "FICTION",
            "isbn": "978-0-7432-7356-5",
            "description": "A classic American novel",
            "image": "https://example.com/gatsby.jpg",
            "copies": 5,
            "available": true,
            "createdAt": "2021-07-21T10:30:00.000Z",
            "updatedAt": "2021-07-21T10:30:00.000Z"
        }
    ]
}
```

---

### 3. Get Single Book

**Endpoint:** `GET /api/books/:bookId`

**Description:** Retrieves a specific book by its ID.

**Path Parameters:**
- `bookId` (required): MongoDB ObjectId of the book

**Example Request:**
```
GET /api/books/60f7b3b3b3b3b3b3b3b3b3b3
```

**Success Response:** `200 OK`
```json
{
    "success": true,
    "message": "Book retrieved successfully",
    "data": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "genre": "FICTION",
        "isbn": "978-0-7432-7356-5",
        "description": "A classic American novel",
        "image": "https://example.com/gatsby.jpg",
        "copies": 5,
        "available": true,
        "createdAt": "2021-07-21T10:30:00.000Z",
        "updatedAt": "2021-07-21T10:30:00.000Z"
    }
}
```

---

### 4. Update a Book

**Endpoint:** `PATCH /api/books/:bookId`

**Description:** Updates an existing book. All fields are optional in the request body.

**Path Parameters:**
- `bookId` (required): MongoDB ObjectId of the book

**Request Body:** (All fields optional)
```json
{
    "title": "string",
    "author": "string",
    "genre": "FICTION | NON_FICTION | SCIENCE | HISTORY | BIOGRAPHY | FANTASY",
    "isbn": "string",
    "description": "string",
    "image": "string (must be valid URL)",
    "copies": "number (non-negative integer)",
    "available": "boolean"
}
```

**Example Request:**
```json
{
    "copies": 8,
    "description": "Updated description for the classic American novel"
}
```

**Success Response:** `200 OK`
```json
{
    "success": true,
    "message": "Book updated successfully",
    "data": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "genre": "FICTION",
        "isbn": "978-0-7432-7356-5",
        "description": "Updated description for the classic American novel",
        "image": "https://example.com/gatsby.jpg",
        "copies": 8,
        "available": true,
        "createdAt": "2021-07-21T10:30:00.000Z",
        "updatedAt": "2021-07-21T12:45:00.000Z"
    }
}
```

---

### 5. Delete a Book

**Endpoint:** `DELETE /api/books/:bookId`

**Description:** Deletes a specific book from the library system.

**Path Parameters:**
- `bookId` (required): MongoDB ObjectId of the book

**Example Request:**
```
DELETE /api/books/60f7b3b3b3b3b3b3b3b3b3b3
```

**Success Response:** `200 OK`
```json
{
    "success": true,
    "message": "Book deleted successfully",
    "data": null
}
```

---

## Borrow Routes

### 1. Borrow a Book

**Endpoint:** `POST /api/borrow`

**Description:** Creates a new borrow record and reduces the available copies of the book.

**Request Body:**
```json
{
    "book": "string (required, MongoDB ObjectId)",
    "quantity": "number (required, positive integer)",
    "dueDate": "string (required, ISO date string)"
}
```

**Example Request:**
```json
{
    "book": "60f7b3b3b3b3b3b3b3b3b3b3",
    "quantity": 2,
    "dueDate": "2024-08-15T00:00:00.000Z"
}
```

**Success Response:** `201 Created`
```json
{
    "success": true,
    "message": "Book borrowed successfully",
    "data": {
        "_id": "60f7b4b4b4b4b4b4b4b4b4b4",
        "book": "60f7b3b3b3b3b3b3b3b3b3b3",
        "quantity": 2,
        "dueDate": "2024-08-15T00:00:00.000Z",
        "createdAt": "2021-07-21T11:00:00.000Z",
        "updatedAt": "2021-07-21T11:00:00.000Z"
    }
}
```

**Business Logic:**
- Checks if the book exists
- Verifies that enough copies are available
- Reduces the book's available copies by the borrowed quantity
- Updates the book's availability status if copies reach 0

---

### 2. Get Borrowed Books Summary

**Endpoint:** `GET /api/borrow`

**Description:** Retrieves a summary of all borrowed books, grouped by book with total quantities.

**Example Request:**
```
GET /api/borrow
```

**Success Response:** `200 OK`
```json
{
    "success": true,
    "message": "Borrowed books summary retrieved successfully",
    "data": [
        {
            "book": {
                "title": "The Great Gatsby",
                "isbn": "978-0-7432-7356-5"
            },
            "totalQuantity": 3
        },
        {
            "book": {
                "title": "To Kill a Mockingbird",
                "isbn": "978-0-06-112008-4"
            },
            "totalQuantity": 1
        }
    ]
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
    "success": false,
    "message": "Validation error description",
    "errors": [
        {
            "field": "title",
            "message": "Title is required"
        }
    ]
}
```

#### 404 Not Found
```json
{
    "success": false,
    "message": "Book not found"
}
```

#### 400 Business Logic Error
```json
{
    "success": false,
    "message": "Not enough copies available"
}
```

### Validation Rules

#### Book Validation
- `title`: Required, non-empty string
- `author`: Required, non-empty string
- `genre`: Required, must be one of: FICTION, NON_FICTION, SCIENCE, HISTORY, BIOGRAPHY, FANTASY
- `isbn`: Required, non-empty string, must be unique
- `description`: Optional string
- `image`: Optional string, must be a valid URL format
- `copies`: Required, non-negative integer
- `available`: Optional boolean, defaults to true

#### Borrow Validation
- `book`: Required, valid MongoDB ObjectId
- `quantity`: Required, positive integer
- `dueDate`: Required, valid date string

---

## Sample API Testing

### Using cURL

#### Create a Book
```bash
curl -X POST https://librarymanagement2.vercel.app/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1984",
    "author": "George Orwell",
    "genre": "FICTION",
    "isbn": "978-0-452-28423-4",
    "description": "A dystopian social science fiction novel",
    "copies": 10
  }'
```

#### Get All Books
```bash
curl https://librarymanagement2.vercel.app/api/books
```

#### Get Books with Filter
```bash
curl "https://librarymanagement2.vercel.app/api/books?filter=FICTION&limit=5"
```

#### Borrow a Book
```bash
curl -X POST https://librarymanagement2.vercel.app/api/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "book": "BOOK_ID_HERE",
    "quantity": 1,
    "dueDate": "2024-08-15T00:00:00.000Z"
  }'
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. MongoDB ObjectIds are 24-character hexadecimal strings
3. The API automatically manages book availability based on copy counts
4. When all copies of a book are borrowed, the `available` field is set to `false`
5. The borrow system reduces available copies but doesn't handle returns (return functionality would need to be implemented)

## Status Codes

- `200` - OK (successful GET, PATCH, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation errors, business logic errors)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side errors)
