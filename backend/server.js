const express = require('express');
const cors = require('cors');
const open = require('open');
const path = require('path');
const db = require('./db'); // <-- คุณต้องมีไฟล์ db.js เพื่อเชื่อม MySQL

const app = express();
const PORT = 8080;

// ---------- Middleware ----------
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- View Engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Simple API for React ----------
app.get('/api/message', (req, res) => {
  res.json({ message: 'สวัสดีจาก Node.js!' });
  
});

// Express + MySQL API สำหรับ React
app.get('/api/db', (req, res) => {
  db.query('SELECT * FROM tb_about', (err, results) => {
    if (err) {
      console.error('Database query error:', err);  // แสดง error ถ้าเกิด
      return res.status(500).send('Database query error');
    }

    console.log('ผลลัพธ์จาก tb_about:', results);  // 👉 log ออก console ที่ฝั่ง backend

    res.json({ rows: results });  // ส่งให้ frontend
  });
});

// ---------- Basic HTML page (browser view) ----------
app.get('/hello', (req, res) => {
  res.send('<h1>Backend is running! ไปที่ <a href="/api/message">/api/message</a> เพื่อดูข้อมูล</h1>');
});

// ---------- Web Routes with MySQL (tb_about) ----------
app.get('/', (req, res) => {
  db.query('SELECT * FROM tb_about', (err, results) => {
    if (err) return res.status(500).send('Database query error');
    res.render('index', { rows: results });
  });
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', (req, res) => {
  const { name, name2 } = req.body;
  db.query(
    'INSERT INTO tb_about (name, name2) VALUES (?, ?)',
    [name, name2],
    (err, result) => {
      if (err) {
        console.error('❌ INSERT Error:', err);
        return res.status(500).send('Database insertion error');
      }
      res.redirect('/');
    }
  );
});

app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tb_about WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ DELETE Error:', err);
      return res.status(500).send('Error deleting record');
    }
    res.redirect('/');
  });
});

app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tb_about WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send('Error fetching record');
    if (results.length === 0) return res.status(404).send('Record not found');
    res.render('edit', { row: results[0] });
  });
});

app.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { name, name2 } = req.body;
  db.query(
    'UPDATE tb_about SET name = ?, name2 = ? WHERE id = ?',
    [name, name2, id],
    (err, result) => {
      if (err) {
        console.error('❌ UPDATE Error:', err);
        return res.status(500).send('Database update error');
      }
      res.redirect('/');
    }
  );
});

// ---------- REST API Example ----------
let books = [
  { id: 1, title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' }
];

app.get('/books', (req, res) => {
  res.json({ message: books });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/hello`;
  console.log(`🌐 Server is running at http://localhost:${PORT}`);
  open.default(url);
});
