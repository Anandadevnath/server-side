import express, { Application ,Request,Response } from "express"
import cors from "cors"
import { booksRoute } from "./app/controllers/book.controller"
import { borrowRoute } from "./app/controllers/borrow.controller"
const app:Application = express()

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json())

app.use('/api/books',booksRoute)
app.use('/api/borrow',borrowRoute)

app.get('/',(req:Request,res:Response)=>{
    res.send("welcome to library  app")
})


export default app