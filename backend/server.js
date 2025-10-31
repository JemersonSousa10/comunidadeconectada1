const express = require('express');
const cors = require('cors');
const path = require('path');

// Carregar .env da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');

const app = express();

// ✅✅✅ CORREÇÃO CRÍTICA DO CORS ✅✅✅
const corsOptions = {
  origin: [
    'https://comunidadeconectada1.vercel.app',
    'https://comunidadeconectada1-git-main-jemersons-projects-4f5e2b25.vercel.app', // NOVA URL
    'https://comunidade-conectada-frontend.vercel.app',
    /\.vercel\.app$/, // PERMITE TODOS OS SUBDOMÍNIOS DO VERCEL
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
};

// Aplicar CORS antes de qualquer middleware
app.use(cors(corsOptions));

// ✅ Middleware para tratar preflight OPTIONS requests manualmente
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());

// Log de requests (útil para debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
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
        environment: process.env.NODE_ENV || 'development',
        database: 'Connected',
        cors: 'Enabled',
        allowedOrigins: [
          'https://comunidadeconectada1.vercel.app',
          'https://comunidade-conectada-frontend.vercel.app'
        ]
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
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      services: '/api/services'
    },
    cors: {
      enabled: true,
      allowedOrigins: [
        'https://comunidadeconectada1.vercel.app',
        'https://comunidade-conectada-frontend.vercel.app'
      ]
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

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: https://comunidade-conectada-backend.onrender.com/api/health`);
  console.log(`🔓 CORS: Habilitado para:`);
  console.log(`   - https://comunidadeconectada1.vercel.app`);
  console.log(`   - https://comunidade-conectada-frontend.vercel.app`);
  console.log(`   - Localhost (desenvolvimento)`);
});