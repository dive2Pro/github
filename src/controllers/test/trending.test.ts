import supertest from 'supertest'
// @ts-ignore
import app from '../../app'
import { trending } from '../trending'
import dayjs from 'dayjs'
import { TrendingModel } from 'models/trending'

let request: supertest.SuperTest<supertest.Test>
const apiName = '/trending'

describe(apiName, () => {
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
            .get(apiName + '?dateRange=' + '["208-1-11-30", "2018-12-1"]')
            .expect(400)
            .end((err, res) => {
                expect(res.body.msg).toContain('日期格式错误')
                done()
            })
    })
    it('query with range date', done => {
        request
            .get(apiName + '?dateRange=' + '["2018-11-30", "2018-12-1"]') // just for current tests
            .expect(200)
            .end((err, res) => {
                expect(err).toBeNull()
                expect(res.body.length).toBeLessThan(3)
                done()
            })
    })
})
