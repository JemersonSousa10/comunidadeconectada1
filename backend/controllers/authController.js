const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    console.log('📥 Dados recebidos no register:', req.body);

    const { nome, email, senha, tipo, telefone, endereco, cidade, estado } = req.body;

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

    // Criar usuário
    const userData = {
      nome,
      email,
      senha, // Em produção, isso deve ser hasheado com bcrypt
      tipo,
      telefone: telefone || null,
      endereco: endereco || null,
      cidade: cidade || null,
      estado: estado || null
    };

    console.log('📝 Dados para criar usuário:', userData);

    const result = await User.create(userData);

    console.log('🎉 Usuário criado com sucesso, ID:', result.insertId);

    const token = generateToken(result.insertId);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: { 
        id: result.insertId, 
        nome: nome, 
        email: email, 
        tipo: tipo 
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
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Comparação direta da senha (em produção usar bcrypt)
    if (senha !== user.senha) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id);

    console.log('✅ Login realizado com sucesso para:', user.email);

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
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
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
        cidade: user.cidade,
        estado: user.estado
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};