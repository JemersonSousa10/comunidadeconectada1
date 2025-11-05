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

// ✅ CORREÇÃO: Crie um POOL em vez de uma conexão única
const pool = mysql.createPool(connectionConfig);

// Teste de conexão
pool.getConnection()
  .then((connection) => {
    console.log('🎉 CONECTADO AO MYSQL NO AIVEN! (usando pool)');
    console.log('📊 Banco:', process.env.DB_NAME);
    console.log('🔗 Host:', process.env.DB_HOST);
    
    // Teste adicional
    return connection.execute('SELECT 1 as connection_test')
      .then(([rows]) => {
        console.log('✅ Teste de query executado com sucesso:', rows[0].connection_test);
        connection.release(); // Liberar conexão de volta para o pool
      });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com o MySQL Aiven:', err.message);
    console.error('💡 Verifique suas variáveis de ambiente no Render');
  });

// ✅ CORREÇÃO: Exporte o POOL (que tem método execute)
module.exports = pool;