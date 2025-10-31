const connection = require('../config/database');

class User {
    static async create(userData) {
        // Extrair e normalizar os dados - converter undefined para null
        const {
            nome,
            email, 
            senha,
            tipo,
            telefone,
            endereco,
            cidade,
            estado
        } = userData;

        const query = `INSERT INTO usuarios (nome, email, senha, tipo, telefone, endereco, cidade, estado) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Converter undefined/vazios para NULL explicitamente
        const params = [
            nome,
            email,
            senha, 
            tipo,
            telefone ? telefone : null,
            endereco ? endereco : null,
            cidade ? cidade : null,
            estado ? estado : null
        ];

        console.log('📝 Executando query com parâmetros:', params);

        try {
            const [result] = await connection.execute(query, params);
            console.log('✅ Usuário criado com ID:', result.insertId);
            return result;
        } catch (error) {
            console.error('❌ Erro na query:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        try {
            const [rows] = await connection.execute(query, [email]);
            return rows[0];
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM usuarios WHERE id = ?';
        try {
            const [rows] = await connection.execute(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }
}

module.exports = User;