const mysql = require('mysql2/promise'); // ✅ Mude para a versão com promises
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

// ✅ Crie a conexão com a versão de promises
const connection = mysql.createConnection(connectionConfig);

// Teste de conexão
connection.then((conn) => {
  console.log('✅ Conectado ao MySQL no Railway! (usando promises)');
  return conn;
}).catch((err) => {
  console.error('❌ Erro ao conectar com o MySQL:', err.message);
  console.error('💡 Dica: Verifique suas variáveis de ambiente no Railway');
});

module.exports = connection;