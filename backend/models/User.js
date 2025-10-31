const connection = require('../config/database');

class User {
    static async create(userData) {
        try {
            console.log('📝 Iniciando criação de usuário:', userData);

            const query = `INSERT INTO usuarios (nome, email, senha, tipo, telefone, endereco, cidade, estado) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const params = [
                userData.nome,
                userData.email,
                userData.senha, 
                userData.tipo,
                userData.telefone || null,
                userData.endereco || null,
                userData.cidade || null,
                userData.estado || null
            ];

            console.log('🔧 Parâmetros da query:', params);

            const result = await connection.query(query, params);
            console.log('✅ Usuário criado com ID:', result[0].insertId);
            return result[0];
            
        } catch (error) {
            console.error('❌ Erro na criação do usuário:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            console.log('🔍 Buscando usuário por email:', email);
            
            const query = 'SELECT * FROM usuarios WHERE email = ?';
            const result = await connection.query(query, [email]);
            const user = result[0][0];
            
            console.log('📊 Usuário encontrado:', user ? 'Sim' : 'Não');
            return user;
            
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            console.log('🔍 Buscando usuário por ID:', id);
            
            const query = 'SELECT * FROM usuarios WHERE id = ?';
            const result = await connection.query(query, [id]);
            const user = result[0][0];
            
            console.log('📊 Usuário encontrado por ID:', user ? 'Sim' : 'Não');
            return user;
            
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }
}

module.exports = User;