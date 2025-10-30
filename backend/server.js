const express = require('express');
const cors = require('cors');
const path = require('path');

// Carregar .env da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');

const app = express();

// CORS para produção - ATUALIZE COM SUA URL DA VERCEL
const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://comunidade-conectada.vercel.app', // SUA URL DA VERCEL AQUI
  'https://*.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sem origin (como mobile apps ou curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Log de requests (útil para debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);

// Health check melhorado
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com o banco
    const db = require('./config/database');
    db.execute('SELECT 1', (err) => {
      if (err) {
        return res.status(500).json({ 
          status: 'ERROR', 
          message: 'Database connection failed',
          error: err.message 
        });
      }
      
      res.json({ 
        status: 'OK', 
        message: 'Comunidade Conectada API está funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'Connected'
      });
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Comunidade Conectada API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      services: '/api/services'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'Acesso não permitido pelo CORS' 
    });
  }
  
  res.status(500).json({ 
    error: 'Algo deu errado no servidor!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Frontend URLs permitidas:`, allowedOrigins);
});