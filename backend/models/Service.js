const db = require('../config/database');

class Service {
  static create(serviceData) {
    const { id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao } = serviceData;
    
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO servicos (id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.execute(sql, [id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao], 
        (err, result) => {
          if (err) reject(err);
          resolve({ id: result.insertId, ...serviceData });
        }
      );
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, u.nome as prestador_nome, u.email as prestador_email 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        ORDER BY s.criado_em DESC
      `;
      db.execute(sql, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  static getByCategory(categoria) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, u.nome as prestador_nome 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        WHERE s.categoria = ?
        ORDER BY s.criado_em DESC
      `;
      db.execute(sql, [categoria], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  static search(query) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, u.nome as prestador_nome 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        WHERE s.nome_servico LIKE ? OR s.descricao LIKE ? OR s.categoria LIKE ?
        ORDER BY s.criado_em DESC
      `;
      const searchTerm = `%${query}%`;
      db.execute(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  static getByPrestador(id_prestador) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM servicos WHERE id_prestador = ? ORDER BY criado_em DESC';
      db.execute(sql, [id_prestador], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  static delete(id, id_prestador) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM servicos WHERE id = ? AND id_prestador = ?';
      db.execute(sql, [id, id_prestador], (err, result) => {
        if (err) reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Service;