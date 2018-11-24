import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import mongoose from 'mongoose'
import expressValidator from 'express-validator'
import routes from './routes'

const app = express()
const env = app.get('env')
let router = ''
let dbName = 'github'
if (env === 'test') {
    router = '/'
    dbName = 'github_test'
} else {
    router = '/api'
}
const mongoDB = 'mongodb://127.0.0.1:27017/' + dbName

mongoose
    .connect(mongoDB)
    .then(() => {
        console.log('Connected Mongo! ')
    })
    .catch(err => {
        console.error('Mongo connection was failed, ', err)
    })

const pre_middleware = [
    bodyParser({
        extended: false
    }),
    cookieParser(),
    expressValidator()
]

pre_middleware.forEach(m => app.use(m))

app.use(router, routes)

export default app
