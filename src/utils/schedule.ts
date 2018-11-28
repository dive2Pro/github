import dayjs from 'dayjs'
import { NextFunction } from 'express'
import assert from 'assert'
import Timeout = NodeJS.Timeout

/**
 * 链式调用
 *  const schedule = new Schedule()
 *  schedule.days().minutes().hours().repeat().run(cb)
 */
export default class Schedule {
    private startTime: dayjs.Dayjs
    private repeatMode: string | number
    private repeatDuration: number // milliseconds
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
    constructor(startTime?: dayjs.ConfigType) {
        this.startTime = startTime && dayjs(startTime)
        this.repeatMode = Schedule.RepeatMode.Times
        this.repeatDuration = 0
    }

    private checkRunning() {
        assert(this.isRunning === false, '定时器已启动')
    }
    setTime(startTime: dayjs.ConfigType) {
        this.checkRunning()
        this.startTime = dayjs(startTime)
    }

    seconds(value: number) {
        this.changeDuration(value)
        return this
    }

    days(value: number) {
        this.changeDuration(value * 24 * 60 * 60)
        return this
    }

    minutes(value: number) {
        this.changeDuration(value * 60)
        return this
    }

    hours(value: number) {
        this.changeDuration(value * 60 * 60)
        return this
    }

    private changeDuration(val: number) {
        this.checkRunning()
        this.repeatDuration += val * 1000
    }
    private changeMode(mode: string | number) {
        this.checkRunning()
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
    run(cb: NextFunction): () => void {
        const self = this
        this.checkRunning()
        const duration = this.repeatDuration
        const { startTime } = self
        let timer: Timeout
        const clearFunction = () => {
            if (timer) {
                clearTimeout(timer)
            }
            self.isRunning = false
        }
        async function _repeat(count: number, duration: number) {
            self.isRunning = true
            if (count <= 0) {
                clearFunction()
                return
            }
            timer = setTimeout(() => {
                cb()
                _repeat(count - 1, duration)
            }, self.nextDuration(duration))
        }
        if (this.repeatMode === Schedule.RepeatMode.Times) {
            const { repeatTimes } = this
            if (repeatTimes <= 0) {
                console.error('请使用 .repeat() 设置次数')
                return clearFunction
            }
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
            return clearFunction
        }

        if (startTime) {
            console.error('请在初始化时设置时间')
        } else {
            _repeat(Number.MAX_SAFE_INTEGER, this.nextDuration(this.startTime))
        }
        return clearFunction
    }

    private nextDuration(currentTime: dayjs.ConfigType) {
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
                return this.repeatDuration
        }
        return nextDayjs.diff(startDayjs, 'millisecond')
    }
}
