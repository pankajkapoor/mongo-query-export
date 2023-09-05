const http = require('http');

const { getIndex, handlePost, getDB } = require('./controller');

require('dotenv').config();

const hostname = process.env.HOST;
const port = process.env.PORT;

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  let [, baseUrl, dynamicParam] = url.split('/');

  switch (`${method} ${baseUrl}`) {
    case 'GET /':
      getIndex(req, res);
      break;

    case 'GET DB':
      getDB(req, res);
      break;

    case 'POST run':
      if (dynamicParam) {
        await handlePost(req, res, dynamicParam);
        break;
      } else {
        res.statusCode = 400; // Bad Request
        res.end(JSON.stringify({ error: 'Invalid URL format' }));
      }

    default:
      getIndex(req, res);
      break;
  }
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
