const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { nome, email, senha, tipo, cep, endereco } = userData;
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO usuarios (nome, email, senha, tipo, cep, endereco) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.execute(sql, [nome, email, hashedPassword, tipo, cep, endereco], 
        (err, result) => {
          if (err) reject(err);
          resolve({ id: result.insertId, nome, email, tipo });
        }
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios WHERE email = ?';
      db.execute(sql, [email], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, nome, email, tipo, cep, endereco FROM usuarios WHERE id = ?';
      db.execute(sql, [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  static comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;