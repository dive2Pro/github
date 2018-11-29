import { Schema, Document, Error, model } from 'mongoose'

export type BuiltByModel = {
    username: string
    href: string
    avatar: string
}

export type TrendingModel = Document & {
    type: string
    date: Date
    language: string
    author: string
    name: string
    url: string
    languageColor: string
    stars: number
    forks: number
    currentPeriodStars: number
    builtBy: BuiltByModel[]
}

const BuiltBySchema = new Schema({
    username: String,
    href: String,
    avatar: String
})

const TrendingSchema = new Schema({
    type: String,
    date: Date,
    language: String,
    author: String,
    name: { type: String },
    url: String,
    languageColor: String,
    stars: Number,
    forks: Number,
    currentPeriodStars: Number,
    builtBy: [BuiltBySchema]
})

const builtBy = model('BuiltBy', BuiltBySchema)
const trending = model('Trending', TrendingSchema)

/**
 * to add date field
 */
TrendingSchema.pre('init', () => {})

export { builtBy, trending as Trending }
