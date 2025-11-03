const db = require('../config/database');
// Não requeremos o bcrypt aqui, ele só é usado no AuthController

console.log('🔧 User.js carregado - ESTRUTURA AIVEN CONFIRMADA');

class User {
    static async create(userData) {
        let connection;
        try {
            console.log('🎯 USER.CREATE - Iniciando criação de usuário');
            
            if (!userData.email || !userData.senha || !userData.tipo) {
                throw new Error('Email, senha e tipo são obrigatórios');
            }

            // A senha já é o hash que veio do AuthController
            const hashedPassword = userData.senha; 
            
            console.log('📊 Obtendo conexão com banco...');
            connection = await db;
            console.log('✅ Conexão obtida');

            const sql = `INSERT INTO usuarios 
                (nome, email, senha, tipo, telefone, cep, endereco) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            const values = [
                userData.nome || '',
                userData.email,
                hashedPassword,
                userData.tipo,
                userData.telefone || null,
                userData.cep || null,
                userData.endereco || null
            ];

            console.log('🛠️ Executando query CORRIGIDA:', sql);
            console.log('📦 Valores (7 parâmetros):', values);

            const [result] = await connection.execute(sql, values);
            console.log('✅ Usuário inserido no Aiven. ID:', result.insertId);

            const [users] = await connection.execute(
                `SELECT id, nome, email, tipo, telefone, cep, endereco, 
                 criado_em, atualizado_em 
                 FROM usuarios WHERE id = ?`,
                [result.insertId]
            );

            const userCriado = users[0];
            console.log('🎉 USUÁRIO CRIADO COM SUCESSO:', userCriado.email);
            
            return userCriado;
            
        } catch (error) {
            console.error('💥 ERRO CRÍTICO no User.create:');
            console.error('🔴 Código:', error.code);
            console.error('📝 Mensagem:', error.message);
            console.error('🔍 Stack:', error.stack);
            
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email já está cadastrado');
            }
            
            throw new Error('Erro ao criar usuário: ' + error.message);
        }
    }

    // ESTA FUNÇÃO ESTAVA FALTANDO OU QUEBRADA E É REQUERIDA PELO AuthController
    static async findByEmail(email) {
        try {
            console.log('🔍 Buscando usuário por email:', email);
            const connection = await db;
            const [users] = await connection.execute(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );
            console.log('✅ Busca concluída. Encontrados:', users.length);
            return users[0];
        } catch (error) {
            console.error('❌ Erro no User.findByEmail:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const connection = await db;
            const [users] = await connection.execute(
                `SELECT id, nome, email, tipo, telefone, cep, endereco, 
                 criado_em, atualizado_em 
                 FROM usuarios WHERE id = ?`,
                [id]
            );
            return users[0];
        } catch (error) {
            console.error('❌ Erro no User.findById:', error);
            throw error;
        }
    }
}

module.exports = User;