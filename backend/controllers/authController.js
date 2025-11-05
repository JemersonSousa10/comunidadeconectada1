const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ✅ CORREÇÃO: Gerar token com estrutura correta
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,  // ✅ MUDANÇA CRÍTICA: usar 'id' em vez de 'userId'
      email: user.email,
      tipo: user.tipo 
    }, 
    process.env.JWT_SECRET || 'fallback-secret', 
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    console.log('📥 Dados recebidos no register:', req.body);

    const { nome, email, senha, tipo, telefone, endereco, cep } = req.body;

    // Validações básicas
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    console.log('🔍 Verificando se usuário já existe...');

    // Verificar se o usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    console.log('✅ Usuário não existe, criando...');

    // Hash da senha
    console.log('🔐 Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(senha, 10);
    console.log('✅ Hash da senha gerado');

    const userData = {
      nome,
      email,
      senha: hashedPassword,
      tipo,
      telefone: telefone || null,
      endereco: endereco || null,
      cep: cep || null
    };

    console.log('📝 Dados para criar usuário:', userData);

    const user = await User.create(userData);

    console.log('🎉 Usuário criado com sucesso, ID:', user.id);

    // ✅ CORREÇÃO: Usar a função generateToken corrigida
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: { 
        id: user.id, 
        nome: user.nome, 
        email: user.email, 
        tipo: user.tipo,
        telefone: user.telefone,
        cep: user.cep,
        endereco: user.endereco
      },
      token
    });

  } catch (error) {
    console.error('❌ Erro detalhado no registro:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔐 Tentativa de login:', req.body.email);

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('🔐 Usuário encontrado, verificando senha...');

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    
    console.log('📊 Resultado da comparação bcrypt:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // ✅ CORREÇÃO: Usar a função generateToken corrigida
    const token = generateToken(user);

    console.log('✅ Login realizado com sucesso para:', user.email);

    res.json({
      message: 'Login realizado com sucesso',
      user: { 
        id: user.id, 
        nome: user.nome, 
        email: user.email, 
        tipo: user.tipo,
        telefone: user.telefone,
        cep: user.cep,
        endereco: user.endereco
      },
      token
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // ✅ CORREÇÃO: Usar req.user.id (estrutura correta)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ 
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        telefone: user.telefone,
        endereco: user.endereco,
        cep: user.cep
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};