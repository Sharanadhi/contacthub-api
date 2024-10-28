export function up (knex) {
  return knex.schema.createTable('deals', function(table) {
    table.increments('id').primary();
    table.integer('contact_id').unsigned().references('id').inTable('contacts');
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('title');
    table.string('status');
    table.string('product');
    table.string('amount');
    table.string('description');
    table.datetime('created_at');
    table.datetime('lastupdated_at');
  });
};

export function down (knex) {
  return knex.schema.dropTable('deals');
};
