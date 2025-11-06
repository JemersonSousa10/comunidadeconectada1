const db = require('../config/database');

class Service {
  static async create(serviceData) {
  try {
    console.log('📝 MODEL SERVICE - Criando serviço com dados:', serviceData);
    
    // ✅ CORREÇÃO: Garantir que NENHUM campo seja undefined
    const { 
      id_prestador, 
      nome_servico, 
      categoria, 
      descricao, 
      valor, 
      contato, 
      localizacao 
    } = serviceData;
    
    // ✅ CORREÇÃO CRÍTICA: Converter undefined para null
    const safeIdPrestador = id_prestador ?? null;
    const safeNomeServico = nome_servico ?? null;
    const safeCategoria = categoria ?? null;
    const safeDescricao = descricao ?? null;
    const safeValor = valor ?? null;
    const safeContato = contato ?? null;
    const safeLocalizacao = localizacao ?? null;
    
    console.log('🛡️ Valores seguros para SQL:', {
      safeIdPrestador, safeNomeServico, safeCategoria, 
      safeDescricao, safeValor, safeContato, safeLocalizacao
    });
    
    const sql = `
      INSERT INTO servicos (id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao, criado_em) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    console.log('🔍 SQL:', sql);
    
    const [result] = await db.execute(sql, [
      safeIdPrestador, 
      safeNomeServico, 
      safeCategoria, 
      safeDescricao, 
      safeValor, 
      safeContato, 
      safeLocalizacao
    ]);
    
    const newService = {
      id: result.insertId,
      id_prestador: safeIdPrestador,
      nome_servico: safeNomeServico,
      categoria: safeCategoria,
      descricao: safeDescricao,
      valor: safeValor,
      contato: safeContato,
      localizacao: safeLocalizacao,
      criado_em: new Date()
    };
    
    console.log('✅ MODEL - Serviço criado no banco:', newService);
    return newService;
    
  } catch (error) {
    console.error('❌ MODEL - Erro ao criar serviço:', error);
    console.error('🔍 Stack trace:', error.stack);
    throw error;
  }
}

  static async getAll() {
    try {
      // ✅ CORREÇÃO: Usar nome_servico em vez de nome
      const sql = `
        SELECT s.*, u.nome as prestador_nome 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        ORDER BY s.criado_em DESC
      `;
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  }

  static async getByCategory(categoria) {
    try {
      const sql = `
        SELECT s.*, u.nome as prestador_nome 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        WHERE s.categoria = ? 
        ORDER BY s.criado_em DESC
      `;
      const [rows] = await db.execute(sql, [categoria]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar serviços por categoria:', error);
      throw error;
    }
  }

  static async search(query) {
    try {
      const sql = `
        SELECT s.*, u.nome as prestador_nome 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        WHERE s.nome_servico LIKE ? OR s.descricao LIKE ? 
        ORDER BY s.criado_em DESC
      `;
      const [rows] = await db.execute(sql, [`%${query}%`, `%${query}%`]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  }

  static async getByPrestador(id_prestador) {
    try {
      const sql = `
        SELECT s.*, u.nome as prestador_nome 
        FROM servicos s 
        JOIN usuarios u ON s.id_prestador = u.id 
        WHERE s.id_prestador = ? 
        ORDER BY s.criado_em DESC
      `;
      const [rows] = await db.execute(sql, [id_prestador]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar serviços do prestador:', error);
      throw error;
    }
  }

  static async delete(id, id_prestador) {
    try {
      const sql = 'DELETE FROM servicos WHERE id = ? AND id_prestador = ?';
      const [result] = await db.execute(sql, [id, id_prestador]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  }
}

module.exports = Service;