/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("full_name", 255).notNullable();
      table.string("email", 320).unique().notNullable();
      table.string("phone", 15).notNullable();
      table.string("password").notNullable();
      table.string("resetPasswordToken");
      table.timestamp("resetPasswordExpires");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })    
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("users");
}
