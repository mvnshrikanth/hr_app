const http = require('http');
const express = require('express');
const webServerConfig = require('../config/web-server.js');
const dbConfig = require('../config/database.js');
const database = require('./database.js');
const morgan = require('morgan');
const defaultThreadPoolSize = 4;

process.env.UV_THREADPOOL_SIZE = dbConfig.hrPool.poolMax + defaultThreadPoolSize;

let httpServer;
 
function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    httpServer = http.createServer(app);

    app.use(morgan('combined'));

    app.get('/', async (req, res) => {
      const result = await database.simpleExecute('select user, systimestamp from dual');
      const user = result.rows[0].USER;
      const date = result.rows[0].SYSTIMESTAMP;
 
      res.end(`DB user: ${user}\nDate: ${date}`);
    });

    app.get('/', (req, res) => {
      res.end('Hello Shrikanth!');
    });
 
    httpServer.listen(webServerConfig.port)
      .on('listening', () => {
        console.log(`Web server listening on localhost:${webServerConfig.port}`);
 
        resolve();
      })
      .on('error', err => {
        reject(err);
      });
  });
}
 
module.exports.initialize = initialize;
 
function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }
 
      resolve();
    });
  });
}
 
module.exports.close = close;