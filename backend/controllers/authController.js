const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const axios = require('axios');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, senha, tipo, cep } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Buscar endereço via ViaCEP
    let enderecoCompleto = '';
    if (cep) {
      try {
        const viaCepResponse = await axios.get(`${process.env.API_VIA_CEP}/${cep}/json/`);
        if (viaCepResponse.data && !viaCepResponse.data.erro) {
          const { logradouro, bairro, localidade, uf } = viaCepResponse.data;
          enderecoCompleto = `${logradouro}, ${bairro}, ${localidade} - ${uf}`;
        }
      } catch (cepError) {
        console.error('Erro ao buscar CEP:', cepError);
      }
    }

    const userData = {
      nome,
      email,
      senha,
      tipo,
      cep,
      endereco: enderecoCompleto || req.body.endereco
    };

    const user = await User.create(userData);
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo },
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await User.comparePassword(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      user: { 
        id: user.id, 
        nome: user.nome, 
        email: user.email, 
        tipo: user.tipo 
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};