const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

const User = sequelize.define('user', {
    username: Sequelize.STRING(20),
    email: Sequelize.STRING(100),
    password: Sequelize.STRING.BINARY,
    passwordResetToken: Sequelize.STRING,
    passwordResetExpires: Sequelize.DATE,
    emailConfirmationToken: Sequelize.STRING,
    isEmailConfirmed: Sequelize.BOOLEAN
})

module.exports = User
