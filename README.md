# Roommate Finder Backend

This is a Node.js backend API for managing roommate listings, built with Express and MongoDB.

## Features

- Create, read, update, and delete roommate listings
- Filter listings by availability
- Like roommate listings
- Retrieve listings by user email

## Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas account

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/Programming-Hero-Web-Course4/b11a10-server-side-Anandadevnath.git
   cd b11a10-server-side-Anandadevnath
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB credentials:

   ```
   DB_User=your_mongodb_username
   DB_Pass=your_mongodb_password
   PORT=5000
   ```

### Running the Server

```sh
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

- `POST /roommates` - Create a new roommate listing
- `GET /roommates` - Get all roommate listings (optional: `?available=true` and `?limit=n`)
- `GET /roommates/:id` - Get a roommate listing by ID
- `PUT /roommates/:id` - Update a roommate listing by ID
- `DELETE /roommates/:id` - Delete a roommate listing by ID
- `GET /my-listings?email=user@example.com` - Get listings by user email
- `PATCH /roommates/:id/like` - Like a roommate listing

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/).

## License

ISC
