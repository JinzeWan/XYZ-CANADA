const express = require('express');
const path =  require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

app.post('/submit', upload.single('file'), async (req, res) => {
  let data = req.body;

  if (!data.email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const caseNumber = await updateCaseNumber(); // 等待获取 caseNumber
    console.log('Generated case number:', caseNumber);

    console.log('Received requirements:', data.requirements);
    console.log('Received email:', data.email);
    if (req.file) {
      console.log('Received file:', req.file.originalname);
    }

    // 你可以将 caseNumber 附加到数据中
    res.json({ message: 'Data received successfully', caseNumber: caseNumber });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate case number' });
  }
});


app.post('/message', (req, res) => {
  let data = req.body;

  if (!data.email || !data.message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  console.log('Received full name:', data.fullname);
  console.log('Received email:', data.email);
  console.log('Received case number:', data.casenumber);
  console.log('Received message:', data.message);

  res.json({ message: 'Data received successfully' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`"Server listening at http://localhost:${PORT}`);
});

function updateCaseNumber() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'caseNumber.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        reject(err);
        return;
      }

      let caseNumber = parseInt(data, 10);
      if (isNaN(caseNumber)) {
        console.error('Invalid number in caseNumber.txt');
        reject(new Error('Invalid number in caseNumber.txt'));
        return;
      }

      caseNumber += 1;

      fs.writeFile(filePath, caseNumber.toString(), (err) => {
        if (err) {
          console.error('Error writing to the file:', err);
          reject(err);
          return;
        }
        console.log(`Updated case number to ${caseNumber}`);
        resolve(caseNumber);
      });
    });
  });
}
