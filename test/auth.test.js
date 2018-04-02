const request = require('supertest')
const config = require('../knexfile')
const knex = require('knex')(config)
const app = require('../app')
const expect = require('chai').expect
const User = require('../models/User')

// Test that signup post request returns successfully
// Test that password in database is being hashed

describe('A successful signup form submission', function() {
    const user = {
        username: 'supertest',
        email: 'test@test.com',
        password: 'password',
        passwordConfirmation: 'password'
    }

    it('should create a new user in the database', async function() {
        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(302)

        await knex.raw('delete from users order by id desc limit 1')
    })

    it('should hash a users password', async function() {
        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(302)

        const insertedUser = await knex.raw(
            'SELECT * FROM users ORDER BY ID DESC LIMIT 1'
        )

        expect(insertedUser[0][0].password).to.not.equal(user.password)

        await knex.raw('delete from users order by id desc limit 1')
    })

    it('should create a user session', async function() {
        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(302)

        await knex.raw('delete from users order by id desc limit 1')
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

// Can't test by response code since passport uses redirect on both fail and pass for login

describe('A successful login post', function() {
    const user = {
        username: 'correctUsername',
        email: 'test@test.com',
        password: 'correctPassword',
        passwordConfirmation: 'correctPassword'
    }

    it('should redirect a user to the home page', async function() {
        await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.headers.location).to.equal('/')

        await knex.raw('delete from users order by id desc limit 1')
    })
})

describe('A login should fail if', function() {
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

        await knex.raw('delete from users order by id desc limit 1')
    })
})

/*
* *-----------------------------
*  Password Reset Testing
* *-----------------------------
*/

describe('A forgot password email submission', function() {
    it('should succeed if a valid email is used', async function() {
        const user = { email: '' }

        const response = await request(app)
            .post('/auth/forgot')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/login')

        await knex.raw(
            'delete from password_reset_tokens order by id desc limit 1'
        )
    })

    it('should fail if not an email', async function() {
        const user = { email: 'chriscourses' }

        const response = await request(app)
            .post('/auth/forgot')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(302)
    })
})

// Can't test by response code since passport uses redirect on both fail and pass for login
describe('A user visiting /auth/reset/:token', function() {
    // it('should be redirected to /forgot if they dont have a valid token in the db', async function() {
    //     const response = await request(app).get('/auth/reset/badtoken')
    //     expect(response.statusCode).to.equal(302)
    //     expect(response.headers.location).to.equal('/forgot')
    // })
    // it('should be allowed through if a valid token exists', async function() {
    //     // Generate token, visit token, check code, then delete token
    //     const user = { email: '' }
    //     let response = await request(app)
    //         .post('/auth/forgot')
    //         .set('Accept', 'application/json')
    //         .send(user)
    //     // token = Db.resetPasswordToken.last
    //     response = await request(app).get(`/reset/${token}`)
    //     expect(response.statusCode).to.equal(200)
    //     // db.resetPasswordToken.last.delete()
    // })
})

// describe('A successful password reset', function() {
//     const user = {
//         username: 'correctUsername',
//         password: 'correctPassword'
//     }

//     it('should create a unique token with an expiration date', async function() {
//         const response = await request(app)
//             .post('/login')
//             .set('Accept', 'application/json')
//             .send(user)

//         expect(response.headers.location).to.equal('/')
//     })

//     it('should allow user to visit password reset page', async function() {
//         const response = await request(app)
//             .post('/login')
//             .set('Accept', 'application/json')
//             .send(user)

//         expect(response.headers.location).to.equal('/')
//     })

//     it('should log the user in and redirect them to the home page', async function() {
//         const response = await request(app)
//             .post('/login')
//             .set('Accept', 'application/json')
//             .send(user)

//         expect(response.headers.location).to.equal('/')
//     })
// })

describe('Submitting a reset password form should fail if', function() {
    it('passwords dont match', async function() {
        const user = {
            password: 'blurgle',
            passwordConfirmation: 'durgle'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })

    it('passwords are less than 8 characters', async function() {
        const user = {
            password: 'qwert',
            passwordConfirmation: 'qwert'
        }

        const response = await request(app)
            .post('/auth/signup')
            .set('Accept', 'application/json')
            .send(user)

        expect(response.statusCode).to.equal(200)
    })
})
