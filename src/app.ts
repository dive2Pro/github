import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { ErrorRequestHandler } from 'express'
import expressSession from 'express-session'
import mongo from 'connect-mongo'
import mongoose from 'mongoose'
import expressValidator from 'express-validator'
import passport from 'passport'
import triggerBackgroundTasks from './background'
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
        triggerBackgroundTasks()
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

pre_middleware.forEach(m => app.use(m))

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token')
    res.header('Access-Control-Allow-Credentials', 'true')
    const method = req.method.toLowerCase()
    if (method === 'options') {
        return res.sendStatus(200)
        // return res.status(204).setHeader('Content-Length', 0)
    }
    next()
})

// todo 添加白名单, 其他的都需要登录信息
app.use(router, routes)

// error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const { status, message } = err
    const statusStr = String(status)

    if (statusStr.startsWith('4')) {
        let msg = message
        switch (status) {
            case 401:
                msg = '没有权限, 请登录!'
                break
            default:
        }
        return res.status(status).json(msg)
    }

    // 重定向到 system error 页面
    return res.redirect(`http://localhost:3000/serverError`)
}
app.use(errorHandler)
export default app
