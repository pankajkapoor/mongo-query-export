const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
const qs = require('querystring');

const DB = require('./DB');

// route => '/' @method => GET
function getIndex(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  res.end(fs.readFileSync('./index.html'));
}

// route => '/run' @method => POST
async function handlePost(req, res, dynamicParam) {
  const { db, client, error } = await DB(dynamicParam);

  if (error) {
    res.statusCode = 400; // Bad Request
    res.end(JSON.stringify({ error: 'Invalid DB URL' }));
  }

  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    const formData = qs.parse(body);
    let q = formData.query.trim();

    if (q.endsWith(';')) {
      q = q.slice(0, -1);
    }

    let query = !q.includes('toArray()') ? `${q}.toArray()` : q;
    query = query.replace('db.getCollection', 'db.collection');

    if (!query.includes('db.collection')) {
      const tx = query.split('db.')[1].split('.');
      const q = `db.collection('${tx[0]}').`;
      const xx = tx.slice(1);
      query = q + xx.join('.');
    }

    try {
      const data = await eval(query);
      const json2csvParser = new Json2csvParser({ header: true });
      const message = json2csvParser.parse(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Disposition', 'attatchment;filename=boka.csv');
      // Respond with a simple JSON message
      res.statusCode = 200; // OK
      res.end(message);
    } catch (err) {
      console.error(err);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200; // OK
      res.end("<h1 style='color:red'>Invalid query<h1>");
    }
    client.close().catch(console.error);
  });
}

// route => '/DB' @method => DB
function getDB(req, res) {
  const DB_LIST = process.env.DB_LIST;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  res.end(DB_LIST);
}

module.exports = {
  getIndex,
  handlePost,
  getDB,
};
