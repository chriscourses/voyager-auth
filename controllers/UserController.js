const passport = require('passport')
const bcrypt = require('bcrypt')
const crypto = require('crypto-promise')
const User = require('../models/User')
const moment = require('moment')
const { check, validationResult } = require('express-validator/check')
const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN
})

const saltRounds = 10

/*
* *-----------------------------
*  Middleware 
* *-----------------------------
*/

exports.authenticate = (req, res, next) => {
    if (req.isAuthenticated()) next()
    else res.redirect('/login')
}

exports.testLoginStatus = (req, res, next) => {
    if (req.isAuthenticated()) res.redirect('/')
    else next()
}

/*
* *-----------------------------
*  Create User Functionality
* *-----------------------------
*/

/**
 * GET /signup
 */

exports.signupGet = (req, res) => {
    res.render('account/signup', { title: 'Sign Up' })
}

/**
 * POST /signup
 */

// validation rules
exports.signupValidation = [
    check('username')
        .isLength({ min: 4, max: 20 })
        .withMessage('username must be between 4 and 20 characters'),
    check('email')
        .isEmail()
        .withMessage('must be an email'),
    check('password', 'passwords must be at least 8 chars long').isLength({
        min: 8
    }),
    check(
        'passwordConfirmation',
        'passwordConfirmation field must have the same value as the password field'
    )
        .exists()
        .custom((value, { req }) => value === req.body.password)
]

exports.signupPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('account/signup', { errors: errors.array() })
    } else {
        createUser(req, res, next)
    }
}

async function sendEmailConfirmation(req, token) {
    const data = {
        from: 'Chris Courses Email Confirmation <me@samples.mailgun.org>',
        to: req.body.email,
        subject: '✔ Reset your password on chriscourses.com',
        text: `Confirm your email address to complete your Chris Courses account associated with the email ${
            req.body.email
        }. It's easy — just click the button below.\n\nhttp://${
            req.headers.host
        }/auth/confirm/${token}`
    }

    try {
        await mailgun.messages().send(data)
    } catch (err) {
        console.log(err)
    }
}

async function createUser(req, res, next) {
    try {
        const hash = await bcrypt.hash(req.body.password, saltRounds)
        let emailConfirmationToken = await crypto.randomBytes(16)
        emailConfirmationToken = emailConfirmationToken.toString('hex')

        const user = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            emailConfirmationToken: emailConfirmationToken
        }).save()

        sendEmailConfirmation(req, emailConfirmationToken)

        req.login(user, err => {
            if (err) return next(err)
            return res.redirect('/')
        })
    } catch (err) {
        if (err.parent.code === 'ER_DUP_ENTRY') {
            res.render('account/signup', {
                error: ['Username or email already taken.']
            })
        }
    }
}

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    const user = await User.findById(id)

    done(null, user)
})

/**
 * POST /auth/emailconfirmation
 */

exports.emailValidation = [
    check('email')
        .isEmail()
        .withMessage('must be an email')
]

exports.sendEmailConfirmation = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('/', { errors: errors.array() })
    } else {
        let emailConfirmationToken = await crypto.randomBytes(16)
        emailConfirmationToken = emailConfirmationToken.toString('hex')

        await User.update(
            { emailConfirmationToken: emailConfirmationToken },
            {
                where: {
                    email: req.body.email
                }
            }
        )

        sendEmailConfirmation(req, emailConfirmationToken)

        res.redirect('/')
    }
}

/**
 * GET /auth/confirm/:token
 */

exports.confirmEmailGet = async (req, res) => {
    try {
        await User.update(
            { isEmailConfirmed: true },
            { where: { emailConfirmationToken: req.params.token } }
        )

        req.flash('info', `Your email at ${req.user.email} has been confirmed!`)

        res.redirect('/')
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
}

/*
* *-----------------------------
*  Login / Logout Functionality
* *-----------------------------
*/

/**
 * GET /login
 */

exports.loginGet = (req, res) => {
    res.render('account/login', {
        title: 'Login',
        error: req.flash('error'),
        info: req.flash('info')
    })
}

/**
 * GET /logout
 */

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

/**
 * GET /profile
 */

exports.profileGet = async (req, res) => {
    try {
        const userInfo = await User.findById(req.user.id)

        res.render('account/profile', {
            title: 'Profile',
            user: userInfo.toJSON()
        })
    } catch (err) {
        console.log(err)
    }
}

/*
* *-----------------------------
*  Forgot Password Functionality
* *-----------------------------
*/

/**
 * GET /forgot
 */

exports.forgotGet = (req, res) => {
    res.render('account/forgot', {
        title: 'Forgot Password',
        info: req.flash('info'),
        error: req.flash('error')
    })
}

/**
 * POST /auth/forgot
 */

exports.sendPasswordReset = async (req, res) => {
    try {
        let user = await User.findOne({ where: { email: req.body.email } })

        if (!user) {
            req.flash(
                'error',
                `The email address ${
                    req.body.email
                } is not associated with any account.`
            )
            return res.redirect('/forgot')
        }

        let token = await crypto.randomBytes(16)
        token = token.toString('hex')

        await user.update({
            passwordResetToken: token,
            passwordResetExpires: moment()
                .add(1, 'hour')
                .format()
        })

        const data = {
            from: 'Chris Courses Password Reset <me@samples.mailgun.org>',
            to: req.body.email,
            subject: '✔ Reset your password on chriscourses.com',
            text:
                'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' +
                req.headers.host +
                '/auth/reset/' +
                token +
                '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }

        await mailgun.messages().send(data)

        req.flash(
            'info',
            `An email with instructions to reset your password has been sent to ${
                req.body.email
            }`
        )
        return res.redirect('/login')
    } catch (err) {
        console.log(err)
    }
}

/**
 * GET /auth/reset/:token
 */

exports.resetGet = async (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/')

    try {
        let user = await User.findOne({
            where: {
                passwordResetToken: req.params.token
            }
        })

        if (!user || moment() > user.passwordResetExpires)
            return res.redirect('/forgot')

        res.render('account/reset', {
            title: 'Password Reset',
            token: req.params.token
        })
    } catch (err) {
        console.log(err)
        return res.redirect('/forgot')
    }
}

/**
 * POST /auth/reset/:token
 */

exports.resetPasswordValidation = [
    check('password', 'passwords must be at least 8 chars long').isLength({
        min: 8
    }),
    check(
        'passwordConfirmation',
        'passwordConfirmation field must have the same value as the password field'
    )
        .exists()
        .custom((value, { req }) => value === req.body.password)
]

exports.resetPassword = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('account/reset', {
            errors: errors.array(),
            token: req.params.token
        })
    } else {
        resetPassword(req, res, next)
    }
}

async function resetPassword(req, res, next) {
    try {
        const hash = await bcrypt.hash(req.body.password, saltRounds)

        await User.update(
            { password: hash, passwordResetExpires: null },
            { where: { passwordResetToken: req.params.token } }
        )

        const user = await User.findOne({
            where: { passwordResetToken: req.params.token }
        })

        req.login(user, err => {
            if (err) return next(err)
            return res.redirect('/')
        })
    } catch (err) {
        console.log(err)
        return res.redirect('/forgot')
    }
}
