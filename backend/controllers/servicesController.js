const Service = require('../models/Service');
const { validationResult } = require('express-validator');

exports.createService = async (req, res) => {
  try {
    console.log('=== 🎯 CREATE SERVICE - INICIANDO ===');
    console.log('📦 Body recebido:', req.body);
    console.log('👤 UserId do token:', req.userId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome_servico, categoria, descricao, valor, contato, localizacao } = req.body;

    // ✅ CORREÇÃO: Usar os nomes EXATOS das colunas
    const serviceData = {
      id_prestador: req.userId, // ✅ id_prestador em vez de usuario_id
      nome_servico: nome_servico, // ✅ nome_servico em vez de nome
      categoria: categoria,
      descricao: descricao,
      valor: parseFloat(valor), // ✅ valor em vez de preco
      contato: contato,
      localizacao: localizacao || null
    };

    console.log('📤 Dados mapeados para criar serviço:', serviceData);

    const service = await Service.create(serviceData);
    
    console.log('✅ Serviço criado com sucesso!');
    
    res.status(201).json({
      message: 'Serviço criado com sucesso',
      service: service
    });

  } catch (error) {
    console.error('❌ ERRO NO createService:', error);
    console.error('🔍 Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.getAll();
    res.json({ services });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getServicesByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;
    const services = await Service.getByCategory(categoria);
    res.json({ services });
  } catch (error) {
    console.error('Erro ao buscar serviços por categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.searchServices = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Termo de busca não fornecido' });
    }

    const services = await Service.search(q);
    res.json({ services });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    // ✅ CORREÇÃO: Usar req.userId (que é o id_prestador)
    const services = await Service.getByPrestador(req.userId);
    res.json({ services });
  } catch (error) {
    console.error('Erro ao buscar meus serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.delete(id, req.userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Serviço não encontrado ou não autorizado' });
    }

    res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};