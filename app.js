const express = require('express')
const session = require('express-session')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const config = require('./config/app')
const flash = require('connect-flash')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const exphbs = require('express-handlebars')

if (config.useEnv) require('dotenv-safe').load() // Must load as early as possible

const app = express()

const User = require('./models/User')

const knexConfig = require('./knexfile')
const knex = require('knex')(knexConfig)
const KnexSessionStore = require('connect-session-knex')(session)
const store = new KnexSessionStore({ knex: knex }) // defaults to a sqlite3 database

const bcrypt = require('bcrypt')

// view engine setup
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        ifeq(a, b, options) {
            if (a === b) return options.fn(this)
            return options.inverse(this)
        },
        toJSON(object) {
            return JSON.stringify(object)
        }
    }
})

app.engine('.hbs', hbs.engine)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', '.hbs')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static('public'))
app.use(
    session({
        secret: 'UNIQUE ID',
        resave: false,
        saveUninitialized: false,
        store: store
    })
)
app.use(flash())

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())

// dynamic rendering for handlebars
app.use(function(req, res, next) {
    if (req.user) {
        res.locals.email = req.user.email
        res.locals.isEmailConfirmed = req.user.isEmailConfirmed
    }

    res.locals.login = req.isAuthenticated()
    next()
})

const routes = require('./routes/web')
app.use('/', routes)

passport.use(
    new LocalStrategy(async function(username, password, done) {
        try {
            let user = await User.findOne({ where: { username: username } })

            if (!user)
                return done(null, false, { message: 'Incorrect username.' })

            user = user.toJSON()

            const passValid = await bcrypt.compare(
                password,
                user.password.toString('utf8')
            )
            if (passValid === false)
                return done(null, false, { message: 'Incorrect password.' })

            return done(null, user)
        } catch (err) {
            return done(err)
        }
    })
)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
})

module.exports = app
