const express = require('express');
const app = express();
const port = 5000;

var crypto = require('crypto');

app.get('/get-stream-url', (req, res) => {
  const ip = req.ip.match(/[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/gm);

  res.send(getStreamUrl('127.0.0.1', '!BkAxX:8TS&?cV'));
});

function generateSecurePathHash(expires, client_ip, secret) {
  if (!expires || !client_ip || !secret)
    throw new Error('Must provide all token components');

  var input = expires + ' ' + client_ip + ' ' + secret;
  var binaryHash = crypto.createHash('md5').update(input).digest();
  var base64Value = new Buffer(binaryHash).toString('base64');
  return base64Value.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function getStreamUrl(ip, secret) {
  const expiresTimestamp = new Date(Date.now() + 1000 * 60 * 30).getTime();
  const expires = String(Math.round(expiresTimestamp / 1000));

  const token = generateSecurePathHash(expires, ip, secret);

  return `https://example.com/video/hls/${token}/${expires}/live.m3u8`;
}

app.listen(port, () => {
  console.log(`Success! Stream link issuer is listening on port ${port}!`);
});
