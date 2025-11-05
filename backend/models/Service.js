const db = require('../config/database');

class Service {
  static async create(serviceData) {
    const { usuario_id, nome, categoria, descricao, preco, contato, localizacao } = serviceData;
    
    const sql = `
      INSERT INTO servicos (usuario_id, nome, categoria, descricao, preco, contato, localizacao, data_criacao) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.execute(sql, [
      usuario_id, nome, categoria, descricao, preco, contato, localizacao
    ]);
    
    return { id: result.insertId, ...serviceData };
  }

  static async getAll() {
    const sql = `
      SELECT s.*, u.nome as prestador_nome 
      FROM servicos s 
      JOIN usuarios u ON s.usuario_id = u.id 
      ORDER BY s.data_criacao DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async getByCategory(categoria) {
    const sql = `
      SELECT s.*, u.nome as prestador_nome 
      FROM servicos s 
      JOIN usuarios u ON s.usuario_id = u.id 
      WHERE s.categoria = ? 
      ORDER BY s.data_criacao DESC
    `;
    const [rows] = await db.execute(sql, [categoria]);
    return rows;
  }

  static async search(query) {
    const sql = `
      SELECT s.*, u.nome as prestador_nome 
      FROM servicos s 
      JOIN usuarios u ON s.usuario_id = u.id 
      WHERE s.nome LIKE ? OR s.descricao LIKE ? 
      ORDER BY s.data_criacao DESC
    `;
    const [rows] = await db.execute(sql, [`%${query}%`, `%${query}%`]);
    return rows;
  }

  static async getByPrestador(usuario_id) {
    const sql = `
      SELECT s.*, u.nome as prestador_nome 
      FROM servicos s 
      JOIN usuarios u ON s.usuario_id = u.id 
      WHERE s.usuario_id = ? 
      ORDER BY s.data_criacao DESC
    `;
    const [rows] = await db.execute(sql, [usuario_id]);
    return rows;
  }

  static async delete(id, usuario_id) {
    const sql = 'DELETE FROM servicos WHERE id = ? AND usuario_id = ?';
    const [result] = await db.execute(sql, [id, usuario_id]);
    return result.affectedRows > 0;
  }
}

module.exports = Service;