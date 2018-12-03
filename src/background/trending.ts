import dayjs from 'dayjs'
import superagent from 'superagent'
import { Trending, TrendingModel } from '../models/trending'
import Schedule from '../utils/schedule'

function endToday() {
    const startDay = dayjs()
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss')
    return startDay
}

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
 *          需要 redis 配合来做缓存处理
 *
 *
 * TODO:
 *      1. 上榜最久
 *      2. 每种语言的日增的 星总数
 *      3. 各语言单日星最多的
 *          - 为何会出现这种情况
 *          - 关联大牛对此项目的评论 (这一部分可以从 Twitter, 知乎 上面获取, 这一部分应该是 interval 来获取的)
 *          - 个人开发者对此项目的评论
 * @param lang - 语言种类
 * @param type - 查询的日期类型
 */
async function queryTrending(lang: string, type: string) {
    try {
        const { body } = await request(lang, 'daily')
        let startDay = dayjs() // for test
        const results = await Promise.all(
            body.map(async (item: TrendingModel) => {
                try {
                    startDay = startDay.add(1, 'day')
                    const result = await Trending.update(
                        { name: item.name },
                        {
                            ...item,
                            type,
                            date: startDay.format() // TODO: remove , use scheme pre save hook
                        },
                        {
                            upsert: true,
                            new: true,
                            setDefaultsOnInsert: true
                        }
                    )
                    return result
                } catch (e) {
                    return {}
                }
            })
        )
        console.log('save %s trending!', lang)
        return [body, results]
    } catch (e) {
        console.error('trending query count error: ', e)
    }
}

function dailyReposAnalysis(dayRepos: TrendingModel[]) {

}

export default function trigger(langs: string[]) {
    return langs.map(s => {
        const clear = new Schedule()
            // .daily()
            .seconds(1)
            .times(1)
            .run(async function() {
                const [dayRepos] = await queryTrending(s, this.repeatMode)
                dailyReposAnalysis(dayRepos)
            })
        return clear
    })
}
