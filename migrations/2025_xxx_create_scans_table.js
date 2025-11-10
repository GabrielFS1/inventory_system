exports.up = function(knex) {
  return knex.schema.createTable('scans', table => {
    table.increments('id').primary();
    table.string('barcode').notNullable();
    table.timestamp('time_readed').notNullable().defaultTo(knex.fn.now());
    table.string('description').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('scans');
};
