import dayjs from 'dayjs'
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

    it('the start time must later than now', () => {
        expect(() => {
            schedule.setTime('2017-1-29')
        }).toThrow()
    })

    // 这个测试需要修改 jest _fakeSetTimeout 这个函数的源码中关于 delay 的那一行
    // it('monthly timer ', () => {
    //     jest.useFakeTimers()
    //     const callback = jest.fn()
    //     const startDate = '2018-11-29'
    //     const endDate = '2019-3-11'
    //     schedule
    //         .setTime(startDate)
    //         .monthly()
    //         .run(callback)
    //     const diffms = dayjs(endDate).diff(dayjs(), 'millisecond')
    //     jest.advanceTimersByTime(diffms)
    //     expect(callback).toHaveBeenCalledTimes(4)
    // })

    it('daily timer ', () => {
        jest.useFakeTimers()
        const callback = jest.fn()
        const startDate = '2019-2-27'
        const endDate = '2019-3-1 23:59:59'
        schedule
            .setTime(startDate)
            .daily()
            .run(callback)
        const diffms = dayjs(endDate).diff(dayjs(), 'millisecond')
        jest.advanceTimersByTime(diffms)
        expect(callback).toHaveBeenCalledTimes(3)
    })
})
