import { Schema, Document, Error, model } from 'mongoose'
import bcrypt from 'bcrypt-nodejs'

type comparePasswordFunction = (
    candidatePassword: string,
    cb: (err: Error, isMatch: Boolean) => void
) => void

export type AccessToken = {
    kind: string
    accessTken: string
}
export type UserModel = Document & {
    email: string
    password: string
    comparePassword: comparePasswordFunction

    github: string

    tokens: AccessToken[]
    profile: {
        name: string
        picture: string
        location: string
        website: string
    }
}

const userSchema = new Schema(
    {
        // 手机也可作为key 值
        email: { type: String, unique: true },
        // 可以通过 Oauth 第三方登录, 所以不是必须的
        password: { type: String },
        github: String,
        tokens: Array,
        profile: {
            name: String,
            picture: String,
            location: String,
            website: String
        }
    },
    { timestamps: true }
)

const comparePassword: comparePasswordFunction = function(
    candidatePassword,
    cb
) {
    bcrypt.compare(
        candidatePassword,
        this.password,
        (err: Error, isMatch: Boolean) => {
            cb(err, isMatch)
        }
    )
}

userSchema.pre('save', function save(next: any) {
    const user = <UserModel>this

    if (!user.isModified('password')) {
        return next()
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err)
        }

        bcrypt.hash(user.password, salt, undefined, (err, hash) => {
            if (err) {
                return next(err)
            }
            user.password = hash
            next()
        })
    })
})

userSchema.methods.comparePassword = comparePassword

const User = model('User', userSchema)

export default User
