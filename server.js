const express = require('express');
const readline = require('readline');
const http = require('http');
const session = require('express-session')
const path =  require('path');
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql2');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const upload = multer({ dest: 'uploads/' });
const io = socketIo(server);

app.use(session({ secret: 'some secret here'}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/web/main_page.html");
});

app.get('/solution', (req, res) => {
  res.sendFile(__dirname + "/public/web/solution.html");
});

app.get('/service', (req, res) => {
  res.sendFile(__dirname + "/public/web/service_page.html");
});

app.get('/resource', (req, res) => {
  res.sendFile(__dirname + "/public/web/resource.html");
});

app.get('/resource/:xx', (req, res) => {
  const articleId = req.params.xx; // 路由参数

  const articlesFilePath = path.join(__dirname, 'articles.json');
  fs.readFile(articlesFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading articles.json:', err);
          return res.status(500).send('Internal Server Error');
      }

      let articles;
      try {
          articles = JSON.parse(data);
      } catch (parseErr) {
          console.error('Error parsing JSON:', parseErr);
          return res.status(500).send('Internal Server Error');
      }


      const article = articles[articleId];
      if (!article) {
          console.error(`Article not found for ID: ${articleId}`);
          return res.status(404).send('Article not found');
      }


      const templatePath = path.join(__dirname, '/public/web/article_template.html');
      fs.readFile(templatePath, 'utf8', (templateErr, template) => {
          if (templateErr) {
              console.error('Error reading template.html:', templateErr);
              return res.status(500).send('Internal Server Error');
          }

          const filledTemplate = template
              .replace('{{title}}', article.title)
              .replace('{{content}}', article.content);

          res.send(filledTemplate);
      });
  });
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

app.get('/account', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/sign-in');
  }
  res.sendFile(__dirname + "/public/web/account.html");
});

app.get('/session-data', (req, res) => {
  if (!req.session.loggedin) {
    return res.json({ loggedIn: false });
  }

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwaszx123',
    database: 'users',
  });

  connection.query(
    'SELECT subscription_status, subscription_start_date FROM users WHERE username = ?',
    [req.session.username],
    (error, results) => {
      if (error) {
        console.error('Failed to fetch subscription data:', error.stack);
        return res.status(500).json({ error: 'Failed to fetch subscription data' });
      }

      if (results.length > 0) {
        const { subscription_status, subscription_start_date } = results[0];
        res.json({
          loggedIn: true,
          username: req.session.username,
          email: req.session.email,
          subscriptionStatus: subscription_status,
          subscriptionStartDate: subscription_start_date || 0, 
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }

      connection.end();
    }
  );
});


app.get('/user-cases', (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'User must be logged in to view cases.' });
  }

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

  let sql = 'SELECT case_number, requirements, email, type, status FROM cases WHERE user = ?';
  connection.query(sql, [req.session.username], (error, results, fields) => {
    if (error) {
      console.error('Failed to fetch cases: ' + error.stack);
      res.status(500).json({ error: 'Failed to fetch cases' });
      connection.end();
      return;
    }
    res.status(200).json(results);
    connection.end();
  });
});


app.post('/submit', upload.single('file'), async (req, res) => {
  let data = req.body;

  if (!data.email || !data.selectedOption) {
    return res.status(400).json({ error: 'Email, and type are required.' });
  }

  try {
    const caseNumber = await updateCaseNumber(); // Get the new case number
    console.log('Generated case number:', caseNumber);

    // Connect to the database
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

    // Insert the new case into the database
    let username = req.session && req.session.username ? req.session.username : 'Unlogged customer';
    let insertSql = 'INSERT INTO cases (case_number, requirements, email, type, user, status) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(insertSql, [caseNumber, data.requirements, data.email, data.selectedOption, username, "Wait for quotation"], (error, results, fields) => {
      if (error) {
        console.error('Failed to insert case: ' + error.stack);
        res.status(500).json({ error: 'Failed to submit case' });
        connection.end();
        return;
      }
      console.log('Case submitted successfully');
      res.status(200).json({ message: 'Case submitted successfully', caseNumber: caseNumber });
      connection.end();
    });
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
    
  let sql = 'SELECT password, email FROM users WHERE username = ?';
  connection.query(sql, [name], (error, results, fields) => {
    if (error) {
      console.error('Query failed: ' + error.stack);
      return;
    }
    if (results.length > 0 && password == results[0].password) {
      console.log('Query result: password is', results[0].password);
      req.session.loggedin = true;
      req.session.username = name;
      req.session.email = results[0].email; 
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

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to logout' });
      } else {
          res.status(200).json({ message: 'Logged out successfully' });
      }
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

    let insertSql = 'INSERT INTO users (username, email, password, subscription_status) VALUES (?, ?, ?, ?)';
    connection.query(insertSql, [username, email, password, "none"], (error, results, fields) => {
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

io.on('connection', (socket) => {

  setTimeout(() => {
    socket.emit('chat message', 'Hello! Welcome to XYZ CANADA.');
  }, 3000);
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Message received: ' + msg);
    //const response = `Server response: You said "${msg}"`;
    //socket.emit('chat message', response);
    io.emit('chat message', msg);
});

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://localhost:${PORT}`);

  // 创建命令行接口以便服务器主动发送消息
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    io.emit('chat message', `XYZ Canada: ${input}`);
  });

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
