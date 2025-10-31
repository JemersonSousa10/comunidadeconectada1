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

            // ✅ Use a conexão corretamente com await
            const conn = await connection;
            const [result] = await conn.execute(query, params);
            
            console.log('✅ Usuário criado com ID:', result.insertId);
            return result;
            
        } catch (error) {
            console.error('❌ Erro na criação do usuário:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            console.log('🔍 Buscando usuário por email:', email);
            
            const query = 'SELECT * FROM usuarios WHERE email = ?';
            
            // ✅ Use a conexão corretamente com await
            const conn = await connection;
            const [rows] = await conn.execute(query, [email]);
            const user = rows[0];
            
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
            
            // ✅ Use a conexão corretamente com await
            const conn = await connection;
            const [rows] = await conn.execute(query, [id]);
            const user = rows[0];
            
            console.log('📊 Usuário encontrado por ID:', user ? 'Sim' : 'Não');
            return user;
            
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }
}

module.exports = User;