exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(table) {
            table.increments().primary()
            table.string('username', 20).unique()
            table.string('email', 100).unique()
            table.binary('password', 60)
            table
                .timestamp('createdAt')
                .notNullable()
                .defaultTo(knex.fn.now())
            table
                .timestamp('updatedAt')
                .notNullable()
                .defaultTo(knex.fn.now())
            table.string('passwordResetToken')
            table.dateTime('passwordResetExpires')
            table.string('emailConfirmationToken')
            table.boolean('isEmailConfirmed').defaultTo(false)
        })
    ])
}

exports.down = function(knex, Promise) {
    return Promise.all([knex.schema.dropTable('users')])
}
