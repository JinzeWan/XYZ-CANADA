const express = require('express');
const path =  require('path');
const app = express();
const PORT = 3000;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/web/main_page.html");
});

app.get('/service', (req, res) => {
    res.sendFile(__dirname + "/public/web/service_page.html");
});

app.get('/work', (req, res) => {
    res.sendFile(__dirname + "/public/web/our_work_page.html");
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + "/public/web/about_page.html");
});

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + "/public/web/contact_page.html");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`"Server listening at http://localhost:${PORT}`);
});
