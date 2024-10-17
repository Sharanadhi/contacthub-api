/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table('users', function (table) {
    table.string('resetPasswordToken'); 
    table.timestamp("resetPasswordExpires");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('resetPasswordToken').dropColumn('resetPasswordExpires'); 
  });
}
