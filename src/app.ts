import express, { Application ,Request,Response } from "express"
import cors from "cors"
import { booksRoute } from "./app/controllers/book.controller"
import { borrowRoute } from "./app/controllers/borrow.controller"
const app:Application = express()

// Enhanced CORS configuration for deployment
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json())

app.use('/api/books',booksRoute)
app.use('/api/borrow',borrowRoute)

app.get('/',(req:Request,res:Response)=>{
    res.send("welcome to library  app")
})

export default app