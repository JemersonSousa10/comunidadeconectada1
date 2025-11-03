const db = require('../config/database');
// REMOVEMOS O REQUIRE DO BCRYPT AQUI, POIS ELE SÓ É NECESSÁRIO NO AuthController
// O seu User.js agora deve começar assim (sem o bcrypt):

console.log('🔧 User.js carregado - ESTRUTURA AIVEN CONFIRMADA');

class User {
    static async create(userData) {
        let connection;
        try {
            console.log('🎯 USER.CREATE - Iniciando criação de usuário');
            
            // ... (restante dos logs)

            // Validações básicas
            if (!userData.email || !userData.senha || !userData.tipo) {
                throw new Error('Email, senha e tipo são obrigatórios');
            }

            // 🛑 CORREÇÃO CRÍTICA: A senha jÁ é o hash que veio do AuthController!
            // Não faça hash aqui. Apenas use o valor que está em userData.senha.
            const hashedPassword = userData.senha; 
            
            // Obter conexão
            console.log('📊 Obtendo conexão com banco...');
            connection = await db;
            console.log('✅ Conexão obtida');

            // ... (restante da sua query SQL)
            const sql = `INSERT INTO usuarios 
                (nome, email, senha, tipo, telefone, cep, endereco) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            const values = [
                userData.nome || '',
                userData.email,
                hashedPassword, // <-- USANDO O HASH CORRETO (ÚNICO)
                userData.tipo,
                userData.telefone || null,
                userData.cep || null,
                userData.endereco || null
            ];

            // ... (restante da execução da query e retorno)

            // ... (Bloco catch)
        } catch (error) {
            console.error('💥 ERRO CRÍTICO no User.create:');
            console.error('🔴 Código:', error.code);
            console.error('📝 Mensagem:', error.message);
            console.error('🔍 Stack:', error.stack);
            
            // ... (restante do bloco catch)
            throw new Error('Erro ao criar usuário: ' + error.message);
        }
    }
    // ... (restante da classe User)
}
module.exports = User;