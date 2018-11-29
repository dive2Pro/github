import supertest from 'supertest'
import User from '../src/models/User'
import app from '../src/app'

describe('/login', () => {
    let request: supertest.SuperTest<supertest.Test>
    const apiName = '/login'
    beforeEach(() => {
        request = supertest(app)
        return User.remove({})
    })

    afterEach(() => {
        request = undefined
        return User.remove({})
    })

    it('email 格式不正确', done => {
        const wrongEmail = '_Q_WE$@_2qwe.com'
        const wrongPassword = 'A)@Q.,dasd-+'
        request
            .post(apiName)
            .send({
                email: wrongEmail,
                password: wrongPassword
            })
            .expect(422)
            .end(function(err, res) {
                expect(res.body.errors.length).toEqual(2)
                done()
            })
    })

    it('未注册或密码错误', done => {
        const wrongEmail = 'huang@gmail.com'
        const wrongPassword = 'qwe22@qwe'
        request
            .post(apiName)
            .send({
                email: wrongEmail,
                password: wrongPassword
            })
            .expect(403)
            .end(function(err, res) {
                expect(res.body.message).toContain(wrongEmail)
                done()
            })
    })
    // TODO 可能以后会有 email 验证

    it('正常的登录', async done => {
        const email = 'huang@gmail.com'
        const password = 'qwe22@qwe'
        await User.create({ email, password })
        request
            .post(apiName)
            .send({
                email,
                password
            })
            .expect(200)
            .end((err, res) => {
                const { body } = res
                expect(err).toBeNull()
                expect(body.email).toEqual(email)
                done()
            })
    })

    // it('登录错误3次后, 返回需要验证码信息字段', () => {})
})

describe('/signup', () => {
    let request: supertest.SuperTest<supertest.Test>
    beforeEach(() => {
        request = supertest(app)
    })

    afterEach(() => {
        request = undefined
    })

    it('用户名不可重复', () => {})

    it('注册成功', () => {})
})
