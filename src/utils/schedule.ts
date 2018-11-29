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
    public repeatMode: string | number
    private repeatDuration: number // milliseconds
    private repeatTimes: number = 0
    private isRunning: boolean = false
    public static RepeatMode = {
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
        if (startTime) {
            this.setStartTime(startTime)
        }
        this.repeatMode = Schedule.RepeatMode.Times
        this.repeatDuration = 0
    }
    private setStartTime(startTime: dayjs.ConfigType) {
        assert(
            dayjs().valueOf() < dayjs(startTime).valueOf(),
            '设定的时间必须大于当前的时间'
        )
        this.startTime = dayjs(startTime)
    }

    private checkRunning() {
        assert(this.isRunning === false, '定时器已启动')
    }

    setTime(startTime: dayjs.ConfigType) {
        this.checkRunning()
        this.setStartTime(startTime)
        return this
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

    times(times: number) {
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
        function _timesRepeat(
            count: number,
            duration: number = self.repeatDuration
        ) {
            self.isRunning = true
            if (count <= 0) {
                clearFunction()
                return
            }

            timer = setTimeout(() => {
                cb && cb.call(self)
                _timesRepeat(count - 1)
            }, duration)
        }

        function _repeat(duration?: number) {
            self.isRunning = true
            let nextDuration = duration,
                nextDayjs
            if (!nextDuration) {
                ;[nextDuration, nextDayjs] = self.nextDuration(self.startTime)
                self.startTime = nextDayjs
            }
            timer = setTimeout(() => {
                cb && cb()
                _repeat()
            }, nextDuration)
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
                _timesRepeat(this.repeatTimes, firstDuration)
            } else {
                _timesRepeat(this.repeatTimes)
            }
            return clearFunction
        }

        if (!startTime) {
            console.error('请设置初始时间')
        } else {
            _repeat(this.startTime.diff(dayjs(), 'millisecond'))
        }
        return clearFunction
    }

    private nextDuration(currentTime: dayjs.ConfigType): [number, dayjs.Dayjs] {
        let nextDayjs: dayjs.Dayjs
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
        }
        // console.log(nextDayjs.format('YYYY-MM-DD'))
        return [nextDayjs.diff(startDayjs, 'millisecond'), nextDayjs]
    }
}
