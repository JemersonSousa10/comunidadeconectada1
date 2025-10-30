const mysql = require('mysql2');
const path = require('path');

// Carregar .env da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectionConfig = process.env.DATABASE_URL 
  ? {
      uri: process.env.DATABASE_URL,
      multipleStatements: true,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };

console.log('🔧 Configuração do Banco:', {
  host: process.env.DB_HOST || 'Usando DATABASE_URL',
  database: process.env.DB_NAME || 'railway'
});

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o MySQL:', err.message);
    console.error('💡 Dica: Verifique suas variáveis de ambiente no Railway');
    return;
  }
  console.log('✅ Conectado ao MySQL no Railway!');
});

// Handler para erros de conexão
connection.on('error', (err) => {
  console.error('❌ Erro na conexão MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconectando ao banco...');
    connection.connect();
  }
});

module.exports = connection;