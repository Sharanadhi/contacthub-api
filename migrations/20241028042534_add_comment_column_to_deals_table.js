/** 
 * @param { import("knex").Knex } knex 
 * @returns { Promise<void> } 
 */
export function up(knex) {
  return knex.schema.table('deals', function(table) {
    table.string('comments');
  });
};

/** 
 * @param { import("knex").Knex } knex 
 * @returns { Promise<void> } 
 */
export function down (knex) {
  return knex.schema.table('deals', function(table) {
    table.dropColumn('comments');
  });
};
