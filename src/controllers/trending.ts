import { RequestHandler } from 'express'
import dayjs from 'dayjs'
import { Trending, TrendingModel } from '../models/trending'

export const trending: RequestHandler = (req, res, next) => {
    const { query = {} } = req
    const { dateRange = '', ...rest } = query
    let dateQuery = {}
    if (dateRange.length) {
        try {
            const [start, end] = JSON.parse(dateRange).map((t: string) =>
                new Date(t).toISOString()
            )
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
    Trending.find({ ...rest, date: dateQuery }).exec(function(err, docs) {
        if (err) {
            next(err)
        } else {
            res.status(200).send(docs)
        }
    })
}
