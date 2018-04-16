const RateLimit = require('express-rate-limit')

exports.loginLimiter = new RateLimit({
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

exports.emailConfirmationLimiter = new RateLimit({
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

exports.createAccountLimiter = new RateLimit({
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
