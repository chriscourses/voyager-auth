const request = require('supertest')
const app = require('../app')
const expect = require('chai').expect
const User = require('../models/User')

describe('A successful signup form submission', function() {
    const userData = {
        username: 'supertest',
        email: 'test@test.com',
        password: 'password',
        passwordConfirmation: 'password'
    }

    it('should create a new user in the database with a hashed password', async function() {
        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(userData)

        const user = await User.findOne({
            where: { username: 'supertest' }
        })

        expect(user.username).to.equal('supertest')
        expect(user.email).to.equal('test@test.com')
        expect(user.password.toString()).to.not.equal('password')
        expect(response.statusCode).to.equal(302)

        user.destroy()
    })
})

describe('Signup form should reject signup if', function() {
    it('all fields are empty', async function() {
        const user = {
            username: '',
            email: '',
            password: '',
            passwordConfirmation: ''
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('username is empty', async function() {
        const user = {
            username: '',
            email: 'empty@test.com',
            password: 'password',
            passwordConfirmation: 'password'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('username is under 4 characters', async function() {
        const user = {
            username: 'cal',
            email: 'cal@test.com',
            password: 'password',
            passwordConfirmation: 'password'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('username is over 20 characters', async function() {
        const user = {
            username: 'longusernametoolongtoo',
            email: 'longusernametoolong@test.com',
            password: 'password',
            passwordConfirmation: 'password'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('email is empty', async function() {
        const user = {
            username: 'emptyEmail',
            email: '',
            password: 'password',
            passwordConfirmation: 'password'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('email is invalid', async function() {
        const user = {
            username: 'supertest',
            email: 'test.com',
            password: 'password',
            passwordConfirmation: 'password'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('passwords are different', async function() {
        const user = {
            username: 'diffPass',
            email: 'diffPass@test.com',
            password: 'password',
            passwordConfirmation: 'passwordDifferent'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('password is under 8 characters', async function() {
        const user = {
            username: 'shortPass',
            email: 'shortPass@test.com',
            password: 'pass',
            passwordConfirmation: 'pass'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })
})

/*
* *-----------------------------
*  Login Page Testing
* *-----------------------------
*/

describe('A successful login post', function() {
    const userData = {
        username: 'correctUsername',
        email: 'test@test.com',
        password: 'correctPassword',
        passwordConfirmation: 'correctPassword'
    }

    it('should show a user and redirect a user to the home page', async function() {
        await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(userData)

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(userData)

        const user = await User.findOne({
            where: { username: 'correctUsername' }
        })

        expect(user.username).to.equal('correctUsername')
        expect(user.email).to.equal('test@test.com')
        expect(response.headers.location).to.equal('/')

        user.destroy()
    })
})

describe('A login should fail if', async function() {
    let user = {
        username: 'correctUsername',
        email: 'test@test.com',
        password: 'correctPassword',
        passwordConfirmation: 'correctPassword'
    }

    it('both username and password fields are empty', async function() {
        await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        user = {
            username: '',
            password: ''
        }

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.headers.location).to.equal('/login')
    })

    it('just username is empty', async function() {
        user = {
            username: '',
            password: 'correctPassword'
        }

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.headers.location).to.equal('/login')
    })

    it('just password is empty', async function() {
        const user = {
            username: 'correctUsername',
            password: ''
        }

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.headers.location).to.equal('/login')
    })

    it('username is correct, but password is incorrect', async function() {
        const user = {
            username: 'correctUsername',
            password: 'wrongPassword'
        }

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.headers.location).to.equal('/login')
    })

    it('password is correct, but username does not exist', async function() {
        const user = {
            username: 'unsetUsername',
            password: 'correctPassword'
        }

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(user)
        expect(response.headers.location).to.equal('/login')

        await User.destroy({
            where: { username: 'correctUsername' }
        })
    })
})

/*
* *-----------------------------
*  Password Reset Testing
* *-----------------------------
*/

/*
* *-----------------------------
*  Email Confirmation Testing
* *-----------------------------
*/
