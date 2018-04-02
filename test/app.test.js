const request = require('supertest')
const app = require('../app')

describe('GET /', function() {
    it('should render successfully', function(done) {
        request(app)
            .get('/')
            .expect(200, done)
    })
})

describe('GET /signup', function() {
    it('should render successfully', function(done) {
        request(app)
            .get('/signup')
            .expect(200, done)
    })
})

describe('GET /login', function() {
    it('should render successfully', function(done) {
        request(app)
            .get('/login')
            .expect(200, done)
    })
})
