const request = require('supertest')
const app = require('../app')
const expect = require('chai').expect

describe('GET /', function() {
    it('should render the homepage', async function() {
        const response = await request(app).get('/')

        expect(response.statusCode).to.equal(200)
    })
})

describe('GET /signup', function() {
    it('should render the signup page', async function() {
        const response = await request(app).get('/signup')

        expect(response.statusCode).to.equal(200)
    })
})

describe('GET /login', function() {
    it('should render the login page', async function() {
        const response = await request(app).get('/login')

        expect(response.statusCode).to.equal(200)
    })
})

describe('GET /logout', function() {
    it('should redirect a user to /', async function() {
        const response = await request(app).get('/logout')

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/')
    })
})

describe('GET /forgot', function() {
    it('should render the forgot page', async function() {
        const response = await request(app).get('/forgot')

        expect(response.statusCode).to.equal(200)
    })
})

describe('GET /profile unauthenticated', function() {
    it('should redirect the user to /login', async function() {
        const response = await request(app).get('/profile')

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/login')
    })
})

describe('GET /auth/reset/:token unauthenticated', function() {
    it('should redirect the user to /forgot', async function() {
        const response = await request(app).get('/auth/reset/random-slug')

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/forgot')
    })
})

describe('GET /auth/confirm/:token unauthenticated', function() {
    it('should redirect the user to /forgot', async function() {
        const response = await request(app).get('/auth/confirm/random-slug')

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/')
    })
})
