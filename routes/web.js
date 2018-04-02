const express = require('express')
const router = express.Router()
const userController = require('./../controllers/user')
const passport = require('passport')
const RateLimit = require('express-rate-limit')

const loginLimiter = new RateLimit({
    windowMs: 5 * 60 * 1000, // 10 minute wait
    delayAfter: 5, // begin slowing down responses after the first request
    delayMs: 1500, // slow down subsequent responses by 1.5 seconds per request
    max: 10, // start blocking after 10 requests
    message:
        'Too many login attempts from this IP, please try again after 10 minutes.',
    onLimitReached: function(req, res, options) {
        req.flash('error', options.message)

        res.redirect('/login')
    }
})

const emailConfirmationLimiter = new RateLimit({
    windowMs: 5 * 60 * 1000, // 10 minute wait
    delayAfter: 5, // begin slowing down responses after the first request
    delayMs: 1500, // slow down subsequent responses by 1.5 seconds per request
    max: 10, // start blocking after 10 requests
    message:
        'Too many email confirmation requests have been sent from this IP, please try again after 10 minutes.',
    onLimitReached: function(req, res, options) {
        req.flash('error', options.message)

        res.redirect('/')
    }
})

const createAccountLimiter = new RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    delayAfter: 1, // begin slowing down responses after the first request
    delayMs: 3 * 1000, // slow down subsequent responses by 3 seconds per request
    max: 5, // start blocking after 5 requests
    message:
        'Too many accounts created from this IP, please try again after an hour.',
    onLimitReached: function(req, res, options) {
        req.flash('error', options.message)

        res.redirect('/signup')
    }
})

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Voyager',
        error: req.flash('error'),
        info: req.flash('info')
    })
})

router.get('/signup', userController.testLoginStatus, userController.signupGet)
router.get('/login', userController.testLoginStatus, userController.loginGet)
router.get('/logout', userController.logout)
router.get('/forgot', userController.testLoginStatus, userController.forgotGet)
router.get('/profile', userController.authenticate, userController.profileGet)
router.get('/auth/reset/:token', userController.resetGet)
router.get('/auth/confirm/:token', userController.confirmEmailGet)

router.post(
    '/auth/signup',
    createAccountLimiter,
    userController.signupValidation,
    userController.signupPost
)
router.post(
    '/auth/login',
    loginLimiter,
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: 'Invalid username or password.'
    })
)

router.post(
    '/auth/emailconfirmation',
    emailConfirmationLimiter,
    userController.emailValidation,
    userController.sendEmailConfirmation
)

router.post('/auth/forgot', userController.sendPasswordReset)

router.post(
    '/auth/reset/:token',
    userController.resetPasswordValidation,
    userController.resetPassword
)

module.exports = router
