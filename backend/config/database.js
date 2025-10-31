const mysql = require('mysql2/promise');
const path = require('path');

// Carregar .env da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('🔧 Configuração do Banco AIVEN:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  user: process.env.DB_USER
});

// ✅ Crie a conexão com a versão de promises
const connection = mysql.createConnection(connectionConfig);

// Teste de conexão
connection.then((conn) => {
  console.log('🎉 CONECTADO AO MYSQL NO AIVEN! (usando promises)');
  console.log('📊 Banco:', process.env.DB_NAME);
  console.log('🔗 Host:', process.env.DB_HOST);
  
  // Teste adicional: verificar se consegue executar uma query
  return conn.execute('SELECT 1 as connection_test');
}).then(([rows]) => {
  console.log('✅ Teste de query executado com sucesso:', rows[0].connection_test);
}).catch((err) => {
  console.error('❌ Erro ao conectar com o MySQL Aiven:', err.message);
  console.error('💡 Verifique suas variáveis de ambiente no Render');
});

module.exports = connection;