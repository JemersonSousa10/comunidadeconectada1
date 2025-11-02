const db = require('../config/database');
// REMOVEMOS O REQUIRE DO BCRYPT AQUI, POIS NÃO PRECISAMOS DELE NESTA FUNÇÃO.
// const bcrypt = require('bcryptjs'); 

console.log('🔧 User.js carregado - ESTRUTURA AIVEN CONFIRMADA');

class User {
    static async create(userData) {
        let connection;
        try {
            console.log('🎯 USER.CREATE - Iniciando criação de usuário');
            console.log('📦 Dados recebidos (APENAS COLUNAS EXISTENTES):', {
                email: userData.email,
                tipo: userData.tipo,
                nome: userData.nome,
                telefone: userData.telefone,
                cep: userData.cep,
                endereco: userData.endereco
            });

            // Validações básicas
            if (!userData.email || !userData.senha || !userData.tipo) {
                throw new Error('Email, senha e tipo são obrigatórios');
            }

            // 🛑 REMOVENDO O HASH DUPLO! A senha em userData.senha JÁ VEM HASHED DO AuthController.
            // console.log('🔐 Gerando hash da senha...');
            // const saltRounds = 10;
            // const hashedPassword = await bcrypt.hash(userData.senha, saltRounds); 
            // console.log('✅ Hash gerado');

            // A senha a ser usada na query é a própria userData.senha (que já é o hash)
            const hashedPassword = userData.senha; 
            
            // Obter conexão
            console.log('📊 Obtendo conexão com banco...');
            connection = await db;
            console.log('✅ Conexão obtida');

            // ✅✅✅ QUERY CORRIGIDA - APENAS COLUNAS QUE EXISTEM NA SUA TABELA ✅✅✅
            const sql = `INSERT INTO usuarios 
                (nome, email, senha, tipo, telefone, cep, endereco) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            const values = [
                userData.nome || '',
                userData.email,
                hashedPassword, // <-- AGORA É O HASH CORRETO (HASH ÚNICO)
                userData.tipo,
                userData.telefone || null,
                userData.cep || null,
                userData.endereco || null
            ];

            console.log('🛠️ Executando query CORRIGIDA:', sql);
            console.log('📦 Valores (7 parâmetros):', values);

            // Executar inserção
            const [result] = await connection.execute(sql, values);
            console.log('✅ Usuário inserido no Aiven. ID:', result.insertId);

            // Buscar usuário criado
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
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                throw new Error('Problema na estrutura do banco: ' + error.message);
            }
            
            throw new Error('Erro ao criar usuário: ' + error.message);
        }
    }

    // ... (As outras funções findByEmail e findById permanecem as mesmas)
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