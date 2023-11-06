const { MongoClient } = require('mongodb');

async function DB(selectedDB) {
  const DB_LIST = process.env.DB_LIST;
  const DB_NAME = process.env.DB_NAME;
  const SELECTED_DB_URL = JSON.parse(DB_LIST)[selectedDB];
  const SELECTED_DB_NAME = JSON.parse(DB_NAME)[selectedDB];

  console.log(SELECTED_DB_NAME, SELECTED_DB_URL);

  if (!SELECTED_DB_URL) {
    return { db: '', client: '', error: true };
  }

  const client = new MongoClient(SELECTED_DB_URL);
  await client.connect().catch(console.error);
  console.log('Connected successfully to DB');
  const db = client.db(SELECTED_DB_NAME);

  return { db, client, error: false };
}

module.exports = DB;
