/** 
 * @param { import("knex").Knex } knex 
 * @returns { Promise<void> } 
 */
export function up(knex) {
  return knex.schema.table('contact_logs', function(table) {
    table.string('status');
  });
};

/** 
 * @param { import("knex").Knex } knex 
 * @returns { Promise<void> } 
 */
export function down (knex) {
  return knex.schema.table('contact_logs', function(table) {
    table.dropColumn('status');
  });
};
