export async function up(knex) {
  return knex.schema.createTable('scans', table => {
    table.increments('id').primary();
    table.string('barcode').notNullable();
    table.string('description').notNullable();
    table.timestamp('time_readed').defaultTo(knex.fn.now());

    table
      .integer('inventory_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('inventories')
      .onDelete('CASCADE');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('scans');
}
