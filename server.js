const express = require('express');
const session = require('express-session')
const path =  require('path');
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(session({ secret: 'some secret here'}))
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

app.get('/sign-in', (req, res) => {
  res.sendFile(__dirname + "/public/web/sign_in_page.html");
});

app.get('/create', (req, res) => {
  res.sendFile(__dirname + "/public/web/create_account_page.html");
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

app.post("/login", function(req, res, next){
	if(req.session.loggedin){
		res.status(300).json({text: "Already logged in."});
		return;
	}
  console.log(req.body);    
  let name = req.body["username"];
  let password = req.body["password"];

  let connection = mysql.createConnection({
    host: 'localhost',       
    user: 'root',            
    password: 'qwaszx123',    
    database: 'users'  
  });
    
  connection.connect((err) => {
    if (err) {
      console.error('Failed to connect to the database: ' + err.stack);
      return;
    }
    console.log('Successfully connected to the database, connection ID: ' + connection.threadId);
  });
    
  let sql = 'SELECT password FROM users WHERE username = ?';
  connection.query(sql, [name], (error, results, fields) => {
    if (error) {
      console.error('Query failed: ' + error.stack);
      return;
    }
    if (results.length > 0 && password == results[0].password) {
      console.log('Query result: password is', results[0].password);
      req.session.loggedin = true;
      req.session.username = name;
      res.status(200).json({text:"Successful login."})
    } else {
      console.log('No eligible user was found');
      res.status(401).json({text:"Invalid user or password"})
    }
  });
    
  connection.end((err) => {
    if (err) {
      console.error('Error closing connection: ' + err.stack);
      return;
    }
    console.log('The database connection has been closed.');
  });

});

app.post("/create_account", function(req, res, next){  
  let username = req.body["username"];
  let email = req.body["email"];
  let password = req.body["password"];

  let connection = mysql.createConnection({
    host: 'localhost',       
    user: 'root',            
    password: 'qwaszx123',    
    database: 'users'  
  });
    
  connection.connect((err) => {
    if (err) {
      console.error('Failed to connect to the database: ' + err.stack);
      res.status(500).json({ error: 'Database connection failed' });
      return;
    }
    console.log('Successfully connected to the database, connection ID: ' + connection.threadId);
  });

  let checkSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(checkSql, [username, email], (error, results, fields) => {
    if (error) {
      console.error('Query failed: ' + error.stack);
      res.status(500).json({ error: 'Failed to check user existence' });
      connection.end();
      return;
    }
    if (results.length > 0) {
      res.status(300).json({ error: 'Username or email already exists' });
      connection.end();
      return;
    }

    let insertSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(insertSql, [username, email, password], (error, results, fields) => {
      if (error) {
        console.error('Query failed: ' + error.stack);
        res.status(500).json({ error: 'Failed to create user' });
        connection.end();
        return;
      }
      console.log('User created successfully');
      res.status(200).json({ message: 'User created successfully' });
      connection.end();
    });
  });
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
