const express = require('express');
const app = express();
const port = 5001;

const crypto = require('crypto');
const admin = require('firebase-admin');
const serviceAccount = require("./larincam-firebase-adminsdk.json");

admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
})


app.get('/issue-stream-url', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const bearer = authHeader.split(' ');
    const bearerToken = bearer[1];
    admin
      .auth()
      .verifyIdToken(bearerToken)
      .then((decodedToken) => {
        const ip = req.ip.match(
          /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/gm
        );
        res.set('Access-Control-Allow-Origin', ['*']);
        res.status(200).json({
          status: true,
          data: getStreamUrl('127.0.0.1', 'N^YWp&gaqu|?fyA'),
        });
      })
      .catch((error) => {
        res
          .status(400)
          .json({ status: false, error: 'Could not verify auth token.' });
      });
  } else {
    res.status(400).json({ status: false, error: 'Missing auth token.' });
  }
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

  return `https://larin.cam:8443/video/hls/${token}/${expires}/live.m3u8`;
}

app.listen(port, () => {
  console.log(`Success! Stream link issuer is listening on port ${port}!`);
});
