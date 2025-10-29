const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const requirePrestador = (req, res, next) => {
  // Esta função seria complementada após verificar o tipo do usuário no banco
  // Por enquanto, apenas passa adiante
  next();
};

module.exports = { auth, requirePrestador };