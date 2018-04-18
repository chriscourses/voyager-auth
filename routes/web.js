const express = require('express')
const passport = require('passport')
const limiters = require('./limiters')
const UserController = require('./../controllers/UserController')

const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Voyager',
        error: req.flash('error'),
        info: req.flash('info')
    })
})
router.get('/signup', UserController.testLoginStatus, UserController.signupGet)
router.get('/login', UserController.testLoginStatus, UserController.loginGet)
router.get('/logout', UserController.logout)
router.get('/forgot', UserController.testLoginStatus, UserController.forgotGet)
router.get('/profile', UserController.authenticate, UserController.profileGet)
router.get('/auth/reset/:token', UserController.resetGet)
router.get('/auth/confirm/:token', UserController.confirmEmailGet)

router.post('/auth/forgot', UserController.sendPasswordReset)
router.post(
    '/auth/reset/:token',
    UserController.resetPasswordValidation,
    UserController.resetPassword
)

// Run tests without limiters in place
if (process.env.NODE_ENV === 'test') {
    router.post(
        '/auth/signup',
        UserController.signupValidation,
        UserController.signupPost
    )
    router.post(
        '/auth/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })
    )
    router.post(
        '/auth/emailconfirmation',
        UserController.emailValidation,
        UserController.sendEmailConfirmation
    )
} else {
    router.post(
        '/auth/signup',
        limiters.createAccountLimiter,
        UserController.signupValidation,
        UserController.signupPost
    )
    router.post(
        '/auth/login',
        limiters.loginLimiter,
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })
    )
    router.post(
        '/auth/emailconfirmation',
        limiters.emailConfirmationLimiter,
        UserController.emailValidation,
        UserController.sendEmailConfirmation
    )
}

module.exports = router
