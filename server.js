const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = 3000;

const USERS_PATH = './users.json';
let users = JSON.parse(fs.readFileSync(USERS_PATH));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'nagyonTitkosKulcs',
  resave: false,
  saveUninitialized: false
}));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 🔓 EGYSZERŰSÍTETT bejelentkezés – titkosítás nélkül (csak teszteléshez)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.loggedIn = true;
    res.redirect('/admin.html');
  } else {
    res.send('Hibás felhasználónév vagy jelszó!');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Hiba a kijelentkezéskor');
    res.redirect('/login');
  });
});

app.use((req, res, next) => {
  if (req.path === '/admin.html' && !req.session.loggedIn) {
    return res.redirect('/login');
  }
  next();
});

// Felhasználó API
app.get('/api/users', (req, res) => {
  res.json(users.map(u => u.username));
});

app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Hiányzó adatok');
  if (users.find(u => u.username === username)) return res.status(409).send('Már létezik');
  users.push({ username, password });
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.status(201).send('Felhasználó létrehozva');
});

app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  const index = users.findIndex(u => u.username === username);
  if (index === -1) return res.status(404).send('Nincs ilyen felhasználó');
  users.splice(index, 1);
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.send('Felhasználó törölve');
});

// Termék API – SQLite használatával
app.get('/api/products', (req, res) => {
  db.getAllProducts((err, products) => {
    if (err) return res.status(500).send('Hiba a termékek lekérésekor');
    res.json(products);
  });
});

app.post('/api/products', (req, res) => {
  const { nev, ar } = req.body;
  if (!nev || !ar) return res.status(400).send('Hiányzó adat');
  db.addProduct(nev, parseInt(ar), (err, product) => {
    if (err) return res.status(500).send('Hiba a termék hozzáadásakor');
    res.status(201).json(product);
  });
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.deleteProduct(id, (err) => {
    if (err) return res.status(500).send('Hiba a termék törlésekor');
    res.send('Termék törölve');
  });
});

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nev, ar } = req.body;
  if (!nev || !ar) return res.status(400).send('Hiányzó adat');
  db.updateProduct(id, nev, parseInt(ar), (err) => {
    if (err) return res.status(500).send('Hiba a termék frissítésekor');
    res.send('Termék frissítve');
  });
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});
