const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
const qs = require('querystring');
const DB = require('./DB');

// route => '/' @method => GET
function getIndex(req, res) {
  const DB_LIST = process.env.DB_LIST;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  let output = fs.readFileSync('./client/index.html', 'utf-8');
  const availableDb = Object.keys(JSON.parse(DB_LIST));

  const data = {
    options: ['<option selected disabled>---select a DB---</option>'].concat(
      availableDb.map(
        (option) => `<option value='${option}'>${option}</option>`,
      ),
    ),
  };

  const variables = Object.keys(data);

  variables.forEach((variable, index) => {
    const pattern = new RegExp(`{{${variable}}}`, 'g');
    output = output.replace(pattern, data[variable]);
  });

  res.end(output);
}

function getScript(req, res) {
  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  let output = fs.readFileSync('./client/main.js', 'utf-8');
  res.end(output);
}
function getStyle(req, res) {
  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  let output = fs.readFileSync('./client/styles.css', 'utf-8');
  res.end(output);
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

    try {
      if (!query.includes('db.collection')) {
        const tx = query.split('db.')[1].split('.');
        const q = `db.collection('${tx[0]}').`;
        const xx = tx.slice(1);
        query = q + xx.join('.');
      }

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

module.exports = {
  getIndex,
  handlePost,
  getScript,
  getStyle,
};
