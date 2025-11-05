const db = require('../config/database');

class Service {
  static async create(serviceData) {
    const { id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao } = serviceData;
    
    const sql = `INSERT INTO servicos (id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    try {
      const [result] = await db.execute(sql, [id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao]);
      return { id: result.insertId, ...serviceData };
    } catch (err) {
      throw err;
    }
  }

  static async getAll() {
    const sql = `
      SELECT s.*, u.nome as prestador_nome, u.email as prestador_email 
      FROM servicos s 
      JOIN usuarios u ON s.id_prestador = u.id 
      ORDER BY s.criado_em DESC
    `;
    
    try {
      const [results] = await db.execute(sql);
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async getByCategory(categoria) {
    const sql = `
      SELECT s.*, u.nome as prestador_nome 
      FROM servicos s 
      JOIN usuarios u ON s.id_prestador = u.id 
      WHERE s.categoria = ?
      ORDER BY s.criado_em DESC
    `;
    
    try {
      const [results] = await db.execute(sql, [categoria]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async search(query) {
    const sql = `
      SELECT s.*, u.nome as prestador_nome 
      FROM servicos s 
      JOIN usuarios u ON s.id_prestador = u.id 
      WHERE s.nome_servico LIKE ? OR s.descricao LIKE ? OR s.categoria LIKE ?
      ORDER BY s.criado_em DESC
    `;
    const searchTerm = `%${query}%`;
    
    try {
      const [results] = await db.execute(sql, [searchTerm, searchTerm, searchTerm]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async getByPrestador(id_prestador) {
    const sql = 'SELECT * FROM servicos WHERE id_prestador = ? ORDER BY criado_em DESC';
    
    try {
      const [results] = await db.execute(sql, [id_prestador]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async delete(id, id_prestador) {
    const sql = 'DELETE FROM servicos WHERE id = ? AND id_prestador = ?';
    
    try {
      const [result] = await db.execute(sql, [id, id_prestador]);
      return result.affectedRows > 0;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Service;