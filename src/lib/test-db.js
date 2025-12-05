import { query } from './db.js'; // import your DB helper

(async () => {
  try {
    // Select from shipments table
    const rows = await query('SELECT * FROM shipments');
    console.log('✅ Query successful, results:');
    console.table(rows);
  } catch (err) {
    console.error('❌ Query failed ➜', err);
  }
})();
