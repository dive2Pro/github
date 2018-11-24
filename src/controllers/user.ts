import { RequestHandler } from 'express'
import { body, validationResult, check } from 'express-validator/check'
import User from '../models/User'

export let login: RequestHandler[] = [
    body('email')
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({ min: 5 })
        .withMessage('must be at least 5 chars long')
        .matches(/\d/)
        .withMessage('must contain a number'),
    (req, res, next) => {
        const errors = validationResult(req)
        // 这里的验证为 服务器端的 fallback 验证,
        // 实际优先在客户端进行验证
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        User.findOne(req.body).exec((err, doc) => {
            if (err) {
                next(err)
            } else if (!doc) {
                res.status(403).json('用户名或者密码错误')
            } else {
                res.status(200).json(doc)
            }
        })
    }
]
