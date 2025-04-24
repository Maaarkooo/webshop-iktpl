// db.js – SQLite adatbázis kapcsolat Node.js-ben

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

module.exports = {
  getAllProducts(callback) {
    db.all("SELECT * FROM products", [], (err, rows) => {
      callback(err, rows);
    });
  },

  addProduct(nev, ar, callback) {
    db.run("INSERT INTO products (nev, ar) VALUES (?, ?)", [nev, ar], function(err) {
      callback(err, { id: this.lastID, nev, ar });
    });
  },

  deleteProduct(id, callback) {
    db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
      callback(err);
    });
  },

  updateProduct(id, nev, ar, callback) {
    db.run("UPDATE products SET nev = ?, ar = ? WHERE id = ?", [nev, ar, id], function(err) {
      callback(err);
    });
  }
};
