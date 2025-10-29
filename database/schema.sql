-- Banco de dados: comunidade_conectada
CREATE DATABASE IF NOT EXISTS comunidade_conectada 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE comunidade_conectada;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('morador', 'prestador') NOT NULL,
    cep VARCHAR(10),
    endereco VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_tipo (tipo)
);

-- Tabela de serviços
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_prestador INT NOT NULL,
    nome_servico VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    contato VARCHAR(100) NOT NULL,
    localizacao VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_prestador) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_categoria (categoria),
    INDEX idx_prestador (id_prestador),
    INDEX idx_data (criado_em)
);

-- Tabela de favoritos (para futura implementação)
CREATE TABLE favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_servico INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servico) REFERENCES servicos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorito (id_usuario, id_servico)
);

-- Tabela de avaliações (para futura implementação)
CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_servico INT NOT NULL,
    nota TINYINT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servico) REFERENCES servicos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_avaliacao (id_usuario, id_servico)
);

-- Inserir alguns dados de exemplo
INSERT INTO usuarios (nome, email, senha, tipo, cep, endereco) VALUES
('João Silva', 'joao.silva@email.com', '$2a$10$ExampleHashedPassword1', 'morador', '01234-567', 'Rua das Flores, 123 - Centro - São Paulo/SP'),
('Maria Santos', 'maria.santos@email.com', '$2a$10$ExampleHashedPassword2', 'prestador', '04567-890', 'Avenida Paulista, 1000 - Bela Vista - São Paulo/SP'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '$2a$10$ExampleHashedPassword3', 'prestador', '07890-123', 'Rua Augusta, 500 - Consolação - São Paulo/SP');

INSERT INTO servicos (id_prestador, nome_servico, categoria, descricao, valor, contato, localizacao) VALUES
(2, 'Encanador Residencial', 'reparos', 'Serviços de encanamento residencial, conserto de vazamentos, instalação de torneiras e vasos sanitários. Atendo emergências.', 120.00, '(11) 99999-1111', 'Zona Leste de São Paulo'),
(2, 'Limpeza de Caixa dÁgua', 'limpeza', 'Limpeza e higienização de caixa dágua residencial e comercial. Uso produtos adequados e seguro contra acidentes.', 200.00, '(11) 99999-1111', 'Grande São Paulo'),
(3, 'Aulas de Matemática', 'aulas', 'Aulas particulares de matemática para ensino fundamental e médio. Reforço escolar e preparação para vestibulares.', 80.00, '(11) 98888-2222', 'Online ou domicílio - Zona Sul'),
(3, 'Manutenção de Computadores', 'tecnologia', 'Formatação, limpeza, upgrade e reparo em computadores e notebooks. Atendimento a domicílio.', 150.00, '(11) 98888-2222', 'São Paulo - Todas as regiões');

-- Criar usuário para a aplicação (ajuste conforme seu ambiente)
CREATE USER IF NOT EXISTS 'comunidade_user'@'localhost' IDENTIFIED BY 'comunidade_password123';
GRANT ALL PRIVILEGES ON comunidade_conectada.* TO 'comunidade_user'@'localhost';
FLUSH PRIVILEGES;