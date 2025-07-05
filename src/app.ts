import express, { Application ,Request,Response } from "express"
import cors from "cors"
import { booksRoute } from "./app/controllers/book.controller"
import { borrowRoute } from "./app/controllers/borrow.controller"
const app:Application = express()

// Environment-based CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://conv-cobbie-4afg47.netlify.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json())

app.use('/api/books',booksRoute)
app.use('/api/borrow',borrowRoute)

app.get('/',(req:Request,res:Response)=>{
    res.send("welcome to library  app")
})

export default app