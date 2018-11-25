import passport from 'passport'
import passportLocal from 'passport-local'
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
