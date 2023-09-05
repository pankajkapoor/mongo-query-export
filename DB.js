const { MongoClient } = require('mongodb');

async function DB(Selected_Db) {
  const DB_LIST = process.env.DB_LIST;
  const SELECTED_DB_URL = JSON.parse(DB_LIST)[Selected_Db];

  if (!SELECTED_DB_URL) {
    return { db: '', client: '', error: true };
  }

  const client = new MongoClient(SELECTED_DB_URL);
  await client.connect().catch(console.error);
  console.log('Connected successfully to DB');
  const db = client.db(Selected_Db);

  return { db, client, error: false };
}

module.exports = DB;
