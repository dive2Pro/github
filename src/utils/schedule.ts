/**
 * 链式调用
 *  const schedule = new Schedule()
 *  schedule.days().minutes().hours().repeat().run(cb)
 */
import dayjs from 'dayjs'
// @ts-ignore
import relativeTime from 'dayjs/plugin/relativeTime'
import { NextFunction } from 'express'

dayjs.extend(relativeTime)

class Schedule {
    private startTime: dayjs.Dayjs
    private repeatMode: string | number
    private repeatDuration: number // minutes
    private repeatTimes: number = 0
    private isRunning: boolean = false
    private static RepeatMode = {
        Daily: 'daily',
        Monthly: 'monthly',
        Yearly: 'yearly',
        Times: 'times'
    }

    /**
     *
     * @param startTime - 以这个时间点为起点
     */
    constructor(startTime: dayjs.ConfigType) {
        this.startTime = startTime && dayjs(startTime)
        this.repeatMode = Schedule.RepeatMode.Times
        this.repeatDuration = 0
    }

    days(value: number) {
        this.changeDuration(value * 24 * 60)
        return this
    }

    minutes(value: number) {
        this.changeDuration(value)
        return this
    }

    hours(value: number) {
        this.changeDuration(value * 60)
        return this
    }
    private changeDuration(val: number) {
        this.repeatDuration += val
    }
    private changeMode(mode: string | number) {
        this.repeatMode = mode
    }
    daily() {
        this.changeMode(Schedule.RepeatMode.Daily)
        return this
    }
    monthly() {
        this.changeMode(Schedule.RepeatMode.Monthly)
        return this
    }
    yearly() {
        this.changeMode(Schedule.RepeatMode.Yearly)
        return this
    }

    repeat(times: number) {
        this.changeMode(Schedule.RepeatMode.Times)
        this.repeatTimes = times
        return this
    }

    // todo : use child_process ?
    run(cb: NextFunction) {
        let duration = this.repeatDuration
        const { startTime } = this
        let clearFunction = () => {}
        const self = this
        self.isRunning = true
        async function _repeat(count: number, duration: number) {
            if (count <= 0) {
                return
            }
            const timer = setTimeout(() => {
                cb()
                _repeat(count - 1, duration)
            }, self.nextDuration(duration))
            clearFunction = () => {
                clearTimeout(timer)
                self.isRunning = false
            }
        }
        if (this.repeatMode === Schedule.RepeatMode.Times) {
            duration = this.repeatDuration * 60 * 1000
            // 如果有设置起点
            if (this.startTime) {
                const diffDayjs = this.startTime.add(duration, 'minute')
                const firstDuration = diffDayjs.diff(
                    this.startTime,
                    'millisecond'
                )
                _repeat(this.repeatTimes, firstDuration)
            } else {
                _repeat(this.repeatTimes, duration)
            }
            return
        }

        if (startTime) {
            return console.error('请在初始化时设置时间')
        }
        _repeat(Number.MAX_SAFE_INTEGER, this.nextDuration(this.startTime))
        return clearFunction
    }

    nextDuration(currentTime: dayjs.ConfigType) {
        let nextDayjs
        const startDayjs = dayjs(currentTime)
        switch (this.repeatMode) {
            case Schedule.RepeatMode.Daily:
                nextDayjs = startDayjs.add(1, 'day')
                break
            case Schedule.RepeatMode.Monthly:
                nextDayjs = startDayjs.add(1, 'month')
                break
            case Schedule.RepeatMode.Yearly:
                nextDayjs = startDayjs.add(1, 'year')
                break
            case Schedule.RepeatMode.Times:
                return this.repeatDuration * 60 * 1000
        }
        return nextDayjs.diff(startDayjs, 'millisecond')
    }
}
