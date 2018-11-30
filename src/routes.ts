import express, { RequestHandler } from 'express'
import passport from 'passport'
import expressJwt from 'express-jwt'
import jwt from 'jsonwebtoken'
import * as userControllers from './controllers/user'
import * as trendingControllers from './controllers/trending'
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
    }),
    function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User Not Authenticated')
        }
    }
)

const secretKey = 'my-secret'

const authenticate = expressJwt({
    secret: secretKey,
    requestProperty: 'auth',
    getToken(req) {
        return req.headers['x-auth-token']
    }
})

const generateToken: RequestHandler = (req, res, next) => {
    req.token = jwt.sign(
        {
            id: req.user.id
        },
        secretKey
    )
    return next()
}

routes.get(
    '/return',
    passport.authenticate('github', {
        failureRedirect: '/api'
    }),
    generateToken,
    (req, res) => {
        res.cookie('x-auth-token', `Bearer ${req.token}`)
        return res.redirect(`http://localhost:3000/user/${req.user.id}`)
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
