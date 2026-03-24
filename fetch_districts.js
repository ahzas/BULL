const fs = require('fs');
const https = require('https');
const path = require('path');

const dest = path.join(__dirname, 'src', 'data', 'districts.json');

https.get('https://raw.githubusercontent.com/yusufyilmazfr/il-ilce-json/main/data/data.json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    fs.writeFileSync(dest, data);
    console.log('Districts downloaded: ' + data.length + ' bytes');
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
