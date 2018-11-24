import express from 'express'
import * as userControllers from './controllers/user'
const routes = express.Router()

routes.get('/', (req, res, next) => {
    res.writeHead(200)
    res.end()
})

routes.post('/login', userControllers.login)
routes.post('/login', () => {})

export default routes
