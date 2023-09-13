const { MongoClient } = require('mongodb');

async function DB(selectedDB) {
  const DB_LIST = process.env.DB_LIST;
  const SELECTED_DB_URL = JSON.parse(DB_LIST)[selectedDB];

  if (!SELECTED_DB_URL) {
    return { db: '', client: '', error: true };
  }

  const client = new MongoClient(SELECTED_DB_URL);
  await client.connect().catch(console.error);
  console.log('Connected successfully to DB');
  const db = client.db(selectedDB);

  return { db, client, error: false };
}

module.exports = DB;
