export function up (knex) {
  return knex.schema.createTable('contact_logs', function(table) {
    table.increments('id').primary();
    table.integer('contact_id').unsigned().references('id').inTable('contacts');
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('log_data');
    table.datetime('created_at');
  });
};

export function down (knex) {
  return knex.schema.dropTable('contact_logs');
};
