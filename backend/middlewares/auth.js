const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ VOLTAR para a estrutura ORIGINAL
    req.userId = decoded.userId; // ← COMO ESTAVA FUNCIONANDO
    
    console.log('🔐 Usuário autenticado no middleware, ID:', req.userId);
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { auth };