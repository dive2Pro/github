import supertest from 'supertest'
// @ts-ignore
import app from '../../app'
import dayjs from 'dayjs'

let request: supertest.SuperTest<supertest.Test>
const apiName = '/trending'

describe(apiName, () => {
    const today = dayjs().format('YYYY-MM-DD')
    const tomorrow = dayjs()
        .add(1, 'day')
        .format('YYYY-MM-DD')
    const dateRange = [today, tomorrow]
    beforeEach(() => {
        request = supertest(app)
    })

    afterEach(() => {
        request = undefined
    })

    it('all query', done => {
        request
            .get(apiName)
            .expect(200)
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.length).toBeGreaterThan(0)
                done()
            })
    })

    it('query with wrong dateRange params ', done => {
        request
            .get(apiName + '?dateRange=' + `${today}, ${tomorrow} `)
            .expect(400)
            .end((err, res) => {
                expect(res.body.msg).toContain('日期格式错误')
                done()
            })
    })
    it('query with range date', done => {
        request
            .get(apiName + '?dateRange=' + `${today}, ${tomorrow}`)
            .expect(200)
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.length).toBeLessThan(3)
                done()
            })
    })

    it(' /:name  no provide dateRange query params, should return the last week data', done => {
        request
            .get(apiName + '/vue')
            .expect(200)
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.length).not.toBeNull()
                done()
            })
    })

    it('/:name dateRange 格式', done => {
        request
            .get(apiName + '/vue?dateRange=2010')
            .expect(403)
            .end((err, res) => {
                expect(res.body.msg).toContain('日期格式错误')
                request
                    .get(apiName + '/vue?dateRange=2010-2-2, 2011-3-4')
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.length).toEqual(0)
                        done()
                    })
            })
    })
})
