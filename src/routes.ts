import express from 'express'
import * as userControllers from './controllers/user'
import * as trendingControllers from './controllers/trending'
import passport from 'passport'
const routes = express.Router()
import * as repoControllers from './controllers/repo'

routes.get('/', (req, res, next) => {
    res.writeHead(200)
    res.end(`<h1>Welcome api </h1>`)
})

routes.post('/login', userControllers.login)
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
        return res.redirect(`http://localhost:3000/players/${req.user.id}`)
    }
)

/**
 * repos
 */
routes.get('/repos', repoControllers.repos)
routes.get('/repos/:id', repoControllers.repo)

/**
 * trending
 */

routes.get('/trending', trendingControllers.trending)

export default routes
