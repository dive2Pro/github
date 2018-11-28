import methods from 'methods'
import superagent from 'superagent'

const requestConfig = (baseUrl: string) => {
    methods.forEach(name => {
        // @ts-ignore
        const originMethod = superagent[name]
        function newMethod(url: string) {
            if (url.startsWith('http') || url.startsWith('https')) {
                return originMethod(url)
            }
            const fullUrl = baseUrl + url
            return originMethod(fullUrl)
        }
        // @ts-ignore
        superagent[name] = newMethod
    })

    return superagent
}

export const gitHubRequest = requestConfig('https://api.github.com/users')
