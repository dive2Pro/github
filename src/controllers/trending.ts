import { RequestHandler } from 'express'
import dayjs from 'dayjs'
import { Trending, TrendingModel } from '../models/trending'

function dateTransform(obj: any) {
    const { date, ...rest } = obj
    const newDate = Object.entries(date).reduce((p: any, [k, v]) => {
        p[k] = new Date(v as any).toISOString()
        return p
    }, {})
    return {
        ...rest,
        date: newDate
    }
}

export const trending: RequestHandler = (req, res, next) => {
    const { query = {} } = req
    const { dateRange = '', ...rest } = query
    let dateQuery
    if (dateRange.length) {
        dateQuery = {}
        try {
            const [start, end] = dateRange
                .split(',')
                .map((t: string) => new Date(t).toISOString())
            if (
                start.toString() === 'Invalid Date' ||
                end.toString() === 'Invalid Date'
            ) {
                throw new Error('')
            }
            dateQuery = {
                $gte: start,
                $lte: end
            }
        } catch (e) {
            return res.status(400).send({
                msg: '日期格式错误: ' + dateRange.toString()
            })
        }
    }
    const queryParams = dateQuery ? { ...rest, date: dateQuery } : rest
    Trending.find(queryParams).exec(function(err, docs) {
        if (err) {
            next(err)
        } else {
            res.status(200).send(docs)
        }
    })
}

export const repoTrending: RequestHandler = (req, res, next) => {
    const { query = {}, params } = req
    const { dateRange } = query
    const { name } = params
    if (!name) {
        return res.status(403).json({ msg: '未提供repo的查询信息' })
    }
    let dateQuery
    // 默认为这一周的
    if (!!dateRange === false) {
        dateQuery = {
            $gte: dayjs()
                .subtract(1, 'week')
                .format(),
            $lte: Date.now()
        }
    } else {
        const range = dateRange.split(',')
        if (range.length !== 2) {
            return res.status(403).json({ msg: '日期格式错误' + dateRange })
        }
        dateQuery = {
            $gte: range[0],
            $lte: range[1]
        }
    }
    const queryParams = { date: dateQuery, name }
    Trending.find(dateTransform(queryParams)).exec(function(err, docs) {
        if (err) {
            next(err)
        } else {
            res.status(200).send(docs)
        }
    })
}
