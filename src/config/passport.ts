import passport from 'passport'
import passportLocal from 'passport-local'
import passportGithub from 'passport-github'
import request = require('superagent')
import User, { UserModel } from '../models/User'

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

/**
 * 为了 Github 或者其他的第三方登录,  passport 已经有配套的 repo 来处理
 * 如果只是简单的将 密码 加密, 生成 token, 使用 bcrypt 即可
 */
const LocalStrategy = passportLocal.Strategy

passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        User.findOne({ email: email.toLowerCase() }).exec(
            (err, doc: UserModel) => {
                if (err) {
                    return done(err)
                }
                if (!doc) {
                    // res.status(403).json('用户名或者密码错误')
                    return done(undefined, false, {
                        message: `${email} not found`
                    })
                }
                // res.status(200).json(doc)
                doc.comparePassword(password, (err, isMatch) => {
                    if (err) {
                        return done(err)
                    }
                    if (isMatch) {
                        return done(undefined, doc)
                    }

                    return done(undefined, false, {
                        message: 'Invalid email or password'
                    })
                })
            }
        )
    })
)

const GithubStrategy = passportGithub.Strategy
const CLIENT_ID = 'e4fc9e72fbe8f05e277c'
const CLIENT_SECRET = '79d62014bded613e11df23ec0669b08c8904242b'

passport.use(
    new GithubStrategy(
        {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            scope: ['user'],
            callbackURL: '/api/return'
        },
        async (accessToken, refreshToken, profile: any, cb) => {
            const {
                avatar_url,
                id,
                login,
                gravatar_id,
                name,
                location,
                html_url
            } = profile._json
            let email = profile.email
            if (!email) {
                const returnedEmails = await request.get(
                    'https://api.github.com/user/emails?access_token=' +
                        accessToken
                )
                email = returnedEmails.body.find((info: any) => info.primary)
                    .email
            }

            User.findOne({ github: id }, async (err, existingUser) => {
                if (err) {
                    return cb(err)
                }
                if (existingUser) {
                    return cb(undefined, existingUser)
                }

                // }
                User.findOne({ email: email }, (err, existingEmailUser) => {
                    if (err) {
                        return cb(err)
                    }
                    if (existingEmailUser) {
                        return cb({
                            msg:
                                '已经有一个账户使用此邮件地址, 登录此账户并手动绑定github账户'
                        })
                    }

                    const user: any = new User()

                    user.email = email
                    user.github = id
                    user.tokens.push({
                        kind: 'github',
                        accessToken: accessToken
                    })

                    user.profile.name = name || login
                    user.profile.picture = avatar_url
                    user.profile.location = location
                    user.profile.website = html_url

                    user.save((err: Error) => {
                        cb(err, user)
                    })
                })
            })
        }
    )
)
