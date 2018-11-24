import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
    // 手机也可作为key 值
    email: { type: String, unique: true },
    // 可以通过 Oauth 第三方登录, 所以不是必须的
    password: { type: String }
})

const User = model('User', UserSchema)

export default User
