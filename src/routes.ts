import express from 'express'
import * as userControllers from './controllers/user'
const routes = express.Router()

routes.get('/', (req, res, next) => {
    res.writeHead(200)
    res.end(`<h1>Welcome api </h1>`)
})


routes.post('/login', userControllers.login)
routes.get('/authenticate/:code', userControllers.authenticate)

export default routes
