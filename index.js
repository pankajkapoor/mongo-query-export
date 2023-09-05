require('dotenv').config();
const http = require('http');
const { MongoClient } = require('mongodb');
const Json2csvParser = require('json2csv').Parser;
const qs = require('querystring');
const fs = require('fs');

const url = process.env.DB;
const hostname = process.env.HOST;
const port = process.env.PORT;
const dbName = process.env.DB_NAME;

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 200;
    res.end(fs.readFileSync('./index.html'));
  } else if (req.method === 'POST' && req.url === '/run') {
    const client = new MongoClient(url);
    await client.connect().catch(console.error);
    console.log('Connected successfully to DB');
    const db = client.db(dbName);

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
  } else {
    // Handle other HTTP methods (e.g., POST, PUT, DELETE)
    res.statusCode = 405; // Method Not Allowed
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
