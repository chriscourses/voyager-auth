const moment = require('moment')

console.log(
    moment()
        .add(1, 'hour')
        .format()
)

console.log(new Date())
