import Schedule from '../schedule'

describe('Schedule tests', () => {
    let schedule: Schedule
    beforeEach(() => {
        schedule = new Schedule()
    })

    afterAll(() => {
        schedule = undefined
    })

    it('seconds later', done => {
        schedule
            .seconds(2)
            .repeat(1)
            .run(() => {
                done()
            })
    })

    it('can not change when it is running on ', () => {
        schedule
            .seconds(5)
            .repeat(1)
            .run(() => {})
        expect(() => schedule.seconds(1)).toThrow('定时器已启动')
    })

    it('clear running timer', () => {
        jest.useFakeTimers()
        const callback = jest.fn()
        schedule
            .seconds(1)
            .repeat(1)
            .run(callback)
        jest.runAllTimers()
        const cb = schedule
            .seconds(1)
            .repeat(1)
            .run(callback)
        cb()
        expect(callback).toBeCalledTimes(1)
    })
})
