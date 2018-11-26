import { NextFunction, RequestHandler } from 'express'
import { body, validationResult, check } from 'express-validator/check'
import passport from 'passport'
import request from 'superagent'
import User from '../models/User'

const CLIENT_ID = 'e4fc9e72fbe8f05e277c'
const CLIENT_SECRET = '79d62014bded613e11df23ec0669b08c8904242b'

export const authenticate: RequestHandler = async (req, res, next) => {
    const { code } = req.params
    try {
        const token = await request
            .post('https://github.com/login/oauth/access_token')
            .set('Accept', 'application/json')
            .send({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code
            })
        if (!token) {
            throw new Error('bad_code')
        }

        const { access_token } = JSON.parse(token.text)
        const getUserInfo = request.get(
            'https://api.github.com/user?access_token=' + access_token
        )
        const [userInfo] = await Promise.all([getUserInfo])
        const {
            avatar_url,
            id,
            login,
            gravatar_id,
            name,
            location,
            html_url
        } = userInfo.body
        let { email } = userInfo.body
        if (req.user) {
            User.findOne({ github: id }, (err, existingUser) => {
                if (err) {
                    return next(err)
                }
                if (existingUser) {
                    return res.status(403).json({
                        msg: '用户已经使用Gitub注册, 请使用 Github 登录'
                    })
                }

                User.findById(req.user.id, (err, user: any) => {
                    if (err) {
                        return next(err)
                    }
                    user.github = id
                    user.tokens.push({
                        kind: 'github',
                        accessToken: access_token
                    })
                    user.profile.name = user.profile.name || name || login
                    user.profile.picture = user.profile.picture || avatar_url
                    user.profile.location = user.profile.location || location
                    user.profile.website = user.profile.website || html_url
                    user.save((err: Error) => {
                        if (err) {
                            return next(err)
                        }
                        res.status(200).json(user)
                    })
                })
            })
        } else {
            User.findOne({ github: id }, async (err, existingUser) => {
                if (err) {
                    return next(err)
                }
                if (existingUser) {
                    return res.status(200).json(existingUser)
                }

                if (!email) {
                    const getUserEmail = request.get(
                        'https://api.github.com/user/emails?access_token=' +
                            access_token
                    )
                    const userEmails = await getUserEmail
                    console.log(userEmails, ' === ')
                    email = userEmails.body.find((info: any) => info.primary)
                        .email
                }
                User.findOne({ email: email }, (err, existingEmailUser) => {
                    if (err) {
                        return next(err)
                    }
                    if (existingEmailUser) {
                        return res.status(403).json({
                            msg:
                                '已经有一个账户使用此邮件地址, 登录此账户并手动绑定github账户'
                        })
                    }

                    const user: any = new User()

                    user.email = email
                    user.github = id
                    user.tokens.push({
                        kind: 'github',
                        accessToken: access_token
                    })
                    user.profile.name = name || login
                    user.profile.picture = avatar_url
                    user.profile.location = location
                    user.profile.website = html_url
                    user.save((err: Error) => {
                        if (err) {
                            return next(err)
                        }
                        res.status(200).json(user)
                    })
                })
            })
        }
    } catch (err) {
        return res.end(err)
    }
}

export let login: RequestHandler[] = [
    body('email')
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({ min: 5 })
        .withMessage('must be at least 5 chars long')
        .matches(/\d/)
        .withMessage('must contain a number'),
    (req, res, next) => {
        const errors = validationResult(req)
        // 这里的验证为 服务器端的 fallback 验证,
        // 实际优先在客户端进行验证
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(403).json(info)
            }

            req.logIn(user, err => {
                if (err) {
                    return next(err)
                }

                console.log(req.user)
                console.log(req.session)
                res.status(200).json(user)
            })
        })(req, res, next)
    }
]
