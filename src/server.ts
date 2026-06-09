import express from 'express'
import cors from 'cors'

import { routes } from './routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use(routes)

app.get('/health', (_, response) => {
  return response.json({
    status: 'ok'
  })
})

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})