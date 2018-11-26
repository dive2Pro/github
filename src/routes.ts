import express from 'express'
import * as userControllers from './controllers/user'
import passport from 'passport'
const routes = express.Router()

routes.get('/', (req, res, next) => {
    res.writeHead(200)
    res.end(`<h1>Welcome api </h1>`)
})

routes.post('/login', userControllers.login)
// routes.get('/authenticate/:code', userControllers.authenticate)

routes.get(
    '/login/github',
    passport.authenticate('github', {
        failureRedirect: '/api'
    })
)

routes.get(
    '/return',
    passport.authenticate('github', {
        failureRedirect: '/api'
    }),
    (req, res) => {
        return res.redirect(
            `http://localhost:3000/players/${req.user.id}`
        )
    }
)
export default routes
