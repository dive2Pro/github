import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'

const app = express()
const body_parser_secrect = 'body-parser'

const pre_middlewares = [
    bodyParser({
        extended: false
    }),
    cookieParser()
]

pre_middlewares.forEach(m => app.use(m));


app.get('/api', (req, res, next) => {
    res.writeHead(200)
    res.end()
})

export default app
