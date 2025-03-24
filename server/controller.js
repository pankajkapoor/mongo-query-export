const fs = require('fs');
const DB = require('./DB');
const { ObjectId } = require('mongodb');  // this is required please don't remove it

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
      availableDb.map((option) => `<option value='${option}'>${option}</option>`),
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
    const formData = JSON.parse(body);
    let q = formData.query.trim();

    if (q.endsWith(';')) {
      q = q.slice(0, -1);
    }

    let query = q;
    query = query.replace('db.getCollection', 'db.collection');

    try {
      if (!query.includes('db.collection')) {
        const tx = query.split('db.')[1].split('.');
        const q = `db.collection('${tx[0]}').`;
        const xx = tx.slice(1);
        query = q + xx.join('.');
      }
      // query = query + '.toArray()';
      query = query + '.explain("executionStats")';

      const data = await eval(query);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200; // OK
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Set-Cookie', 'isLoading=false; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/');

      const executionTime = data.executionStats?.executionTimeMillis ?? data.stages?.[0]?.executionTimeMillisEstimate;
      let formattedTime;
      if (executionTime >= 60000) {
        // Convert to minutes, seconds, and milliseconds
        const minutes = Math.floor(executionTime / 60000);
        const seconds = Math.floor((executionTime % 60000) / 1000);
        const milliseconds = executionTime % 1000;
        formattedTime = `${minutes} min ${seconds} sec ${milliseconds} ms`;
      } else if (executionTime >= 1000) {
        // Convert to seconds and milliseconds
        const seconds = Math.floor(executionTime / 1000);
        const milliseconds = executionTime % 1000;
        formattedTime = `${seconds} sec ${milliseconds} ms`;
      } else {
        // Just milliseconds
        formattedTime = `${executionTime} ms`;
      }
      res.end(`<pre>${formattedTime}</pre>`);
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
};
