const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Load SSL certificates
const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
};

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Start HTTPS server
https.createServer(options, app).listen(8443, () => {
  console.log('Server running on https://localhost:8443');
});