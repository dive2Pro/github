import { RequestHandler } from 'express'
import { gitHubRequest } from '../utils/request'

// TODO cache down to mongodb
/**
 *
 * @param req
 * @param req.query
 * @param req.query.language
 * @param req.query.private
 * @param req.query.name
 * @param req.query.
 * @param res
 * @param next
 */
export const repos: RequestHandler = async (req, res, next) => {

    const { user, query } = req
    try {
        const response = await gitHubRequest.get(
            `/${user.profile.name}/repos?per_page=10000`
        )

        const { text } = response
        const items = JSON.parse(text)
        res.status(200).send({
            items,
            total: items.length,
            current: 0
        })
    } catch (e) {
        next(e)
    }
}

export const repo: RequestHandler = async (req, res, next) => {
    const { id } = req.params
    const { user } = req
    try {
        const response = await gitHubRequest.get(
            `/${user.profile.name}/repos/${id}`
        )
        const { text } = response
        res.status(200).send(text)
    } catch (e) {
        next(e)
    }
}

