const Service = require('../models/Service');
const { validationResult } = require('express-validator');

exports.createService = async (req, res) => {
  try {
    console.log('=== 🎯 CREATE SERVICE - INICIANDO ===');
    console.log('📦 Body recebido:', req.body);
    console.log('👤 User do token:', req.user);
    console.log('👤 UserId:', req.user?.id);

    // ✅ CORREÇÃO: Usar req.user.id em vez de req.userId
    if (!req.user || !req.user.id) {
      console.error('❌ ERRO CRÍTICO: req.user ou req.user.id é undefined!');
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        details: 'Estrutura do usuário não encontrada no request'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome_servico, categoria, descricao, valor, contato, localizacao } = req.body;

    // Validar campos obrigatórios
    const camposObrigatorios = { nome_servico, categoria, descricao, valor, contato };
    const camposFaltantes = Object.keys(camposObrigatorios).filter(key => !camposObrigatorios[key]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando', 
        campos: camposFaltantes 
      });
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({ 
        error: 'Valor deve ser um número positivo' 
      });
    }

    // ✅ CORREÇÃO: Usar req.user.id
    const serviceData = {
      id_prestador: req.user.id,
      nome_servico: (nome_servico || '').trim(),
      categoria: (categoria || '').trim(),
      descricao: (descricao || '').trim(),
      valor: valorNumerico,
      contato: (contato || '').trim(),
      localizacao: (localizacao || '').trim() || null
    };

    console.log('📤 Dados validados para criar serviço:', serviceData);

    const service = await Service.create(serviceData);
    
    console.log('✅ Serviço criado com sucesso!');
    
    res.status(201).json({
      message: 'Serviço criado com sucesso',
      service: service
    });

  } catch (error) {
    console.error('❌ ERRO NO createService:', error);
    
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
    // ✅ CORREÇÃO: Usar req.user.id em vez de req.userId
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const services = await Service.getByPrestador(req.user.id);
    res.json({ services });
  } catch (error) {
    console.error('Erro ao buscar meus serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ CORREÇÃO: Usar req.user.id em vez de req.userId
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const deleted = await Service.delete(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Serviço não encontrado ou não autorizado' });
    }

    res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};