const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
   static async create(userData) {
        // Garantir que campos undefined sejam convertidos para NULL
        const {
            nome, email, senha, tipo, 
            telefone = null, 
            endereco = null, 
            cidade = null, 
            estado = null 
        } = userData;

        const query = `INSERT INTO usuarios (nome, email, senha, tipo, telefone, endereco, cidade, estado) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await connection.execute(query, [
            nome, email, senha, tipo, 
            telefone || null, 
            endereco || null, 
            cidade || null, 
            estado || null
        ]);
        
        return result;
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