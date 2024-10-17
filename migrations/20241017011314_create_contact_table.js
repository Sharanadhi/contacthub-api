/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("contacts", (table) => {
      table.increments("id").primary();
      table.string("first_name", 255).notNullable();
      table.string("last_name", 255).notNullable();
      table.string("job_title", 255).notNullable();
      table.string("company", 255).notNullable();
      table.string("business_email", 320).notNullable();
      table.string("personal_email", 320).notNullable();
      table.string("business_phone", 15).notNullable();
      table.string("personal_phone", 15).notNullable();
      table.string("address", 512).notNullable();
      table.string("status", 100).notNullable();
      table.text("comments").notNullable();
      table.string("profile_picture", 512);
      table.integer("user_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("contacts");
}
