const Service = require('../models/Service');
const { validationResult } = require('express-validator');

exports.createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('📥 Dados recebidos:', req.body);
    console.log('👤 Usuário autenticado:', req.user);

    // ✅ CORREÇÃO: Usar usuario_id e mapear campos corretamente
    const serviceData = {
      usuario_id: req.user.id,
      nome: req.body.nome_servico, // Mapear nome_servico → nome
      categoria: req.body.categoria,
      descricao: req.body.descricao,
      preco: req.body.valor, // Mapear valor → preco
      contato: req.body.contato,
      localizacao: req.body.localizacao
    };

    console.log('📦 Dados do serviço processados:', serviceData);

    const service = await Service.create(serviceData);
    
    console.log('✅ Serviço criado no banco:', service);
    
    res.status(201).json({
      message: 'Serviço criado com sucesso',
      service
    });
  } catch (error) {
    console.error('❌ Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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