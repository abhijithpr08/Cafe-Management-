import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import apiRoutes from './routes/apiRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'RestroPOS backend is running',
    status: 'ok',
  })
})

app.use('/api', apiRoutes)

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()
