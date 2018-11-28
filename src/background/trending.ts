import dayjs from 'dayjs'
import superagent from 'superagent'
import { trending } from '../models/trending'
import Schedule from '../utils/schedule'

const startDay = dayjs()
    .endOf('day')
    .format('YYYY-MM-DD HH:mm:ss')

function request(lang: string, since: string) {
    const trendingUrl = `https://github-trending-api.now.sh/repositories?language=${lang}&since=${since}`
    return superagent.get(trendingUrl)
}

/**
 * 用来记录每一天各种语言在 trending 榜单上面的走势
 * 所以用来保存的办法有考虑以下几种:
 *  1. 使用redis,
 *      每一天的日期作为 id 的一个标记位:
 *          `trending:${language}:${date}:${name}`: response.toString();
 *      这样设计在取的时候就会很方便:
 *      query: {
 *          timeRange: [date1, date2 ],
 *          language: [javascript, rust],
 *          name: [repoName1, repoName2]
 *      }
 *      只需要将这些条件组合,使用模糊查找来获取 可以满足大部分的需求
 *      缺点:
 *          要关联某些repo的字段, 比如 author, description, stars, forks等会比较麻烦
 *          无法作为前置条件来查询
 *  2. mongodb
 *
 * @param lang
 */
async function queryTrending(lang: string) {
    try {
        const response = await request(lang, 'daily')
        console.log(response)
    } catch (e) {
        console.error('trending query count error: ', e)
    }
}

export default function trigger(langs: string[]) {
    langs.forEach(s => {
        const clear = new Schedule()
            .repeat(1)
            .seconds(10)
            .run(() => {
                queryTrending(s)
            })
    })
}
