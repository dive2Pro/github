import { RequestHandler } from 'express'
import { body, validationResult, check } from 'express-validator/check'
import passport from 'passport'

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
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(403).json(info)
            }

            res.status(200).json(user)
        })(req, res, next)
    }
]
