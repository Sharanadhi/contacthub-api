/** 
 * @param { import("knex").Knex } knex 
 * @returns { Promise<void> } 
 */
export function up(knex) {
  return knex.schema.table('contacts', function(table) {
    table.string('linked_in');
  });
};

/** 
 * @param { import("knex").Knex } knex 
 * @returns { Promise<void> } 
 */
export function down (knex) {
  return knex.schema.table('contacts', function(table) {
    table.dropColumn('linked_in');
  });
};
