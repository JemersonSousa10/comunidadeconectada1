const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ CORREÇÃO CRÍTICA: Estrutura correta do req.user
    req.user = {
      id: decoded.id,      // ✅ AGORA VEM DO TOKEN CORRETO
      email: decoded.email,
      tipo: decoded.tipo
    };
    
    console.log('🔐 Usuário autenticado no middleware:', req.user);
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { auth };