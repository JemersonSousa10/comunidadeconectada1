const path = require('path');

// Carrega o .env da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 Variáveis de ambiente carregadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*** (definida)' : 'NÃO DEFINIDA');

const db = require('./config/database');

async function testConnection() {
  try {
    console.log('\n🔄 Testando conexão...');
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    console.log('✅ Conexão bem-sucedida! Resultado do teste:', rows[0].result);
    
    // Verificar se o banco existe
    const [databases] = await db.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    console.log('📊 Banco de dados existe?', dbExists ? '✅ Sim' : '❌ Não');
    
    if (dbExists) {
      const [tables] = await db.execute('SHOW TABLES');
      console.log('📋 Tabelas encontradas:', tables.map(t => Object.values(t)[0]));
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    
    // Dicas específicas baseadas no erro
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 SOLUÇÃO: Verifique:');
      console.log('   - Usuário e senha do MySQL no .env');
      console.log('   - Se o MySQL está rodando (mysql -u root -p)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 SOLUÇÃO: O banco não existe. Execute:');
      console.log('   CREATE DATABASE comunidade_conectada;');
    }
  } finally {
    process.exit();
  }
}

testConnection();