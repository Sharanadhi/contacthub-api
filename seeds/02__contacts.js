/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

import contactsData from "../seed_data/contacts.js";

export async function seed(knex) {
  await knex("contacts").del();
  await knex("contacts").insert(contactsData);
}
