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

app.listen(3333, () => {
  console.log('Server running on port 3333')
})