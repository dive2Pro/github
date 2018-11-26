import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import expressSession from 'express-session'
import mongo from 'connect-mongo'
import mongoose from 'mongoose'
import expressValidator from 'express-validator'
import passport from 'passport'
import routes from './routes'
import * as passportConfig from './config/passport'

const MongoStore = mongo(expressSession)
console.log(passportConfig)
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
const mongoUrl = 'mongodb://127.0.0.1:27017/'
const mongoDB = mongoUrl + dbName

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
    expressValidator(),
    expressSession({
        secret: '-sec-ret',
        store: new MongoStore({
            url: mongoUrl,
            autoReconnect: true
        })
    }),
    passport.initialize(),
    passport.session()
]
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

pre_middleware.forEach(m => app.use(m))

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
})
app.use(router, routes)

export default app
