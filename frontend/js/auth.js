// auth.js - Sistema de Autenticação da Comunidade Conectada

// Configuração da API
const API_BASE_URL = 'https://comunidade-conectada-backend.onrender.com';

// Elementos globais
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Sistema de autenticação carregado');
    checkAuthState();
});

// Função principal de cadastro
async function handleRegister(event) {
    event.preventDefault();
    console.log('🚀 Iniciando processo de cadastro...');

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Mostrar estado de carregamento
        submitBtn.textContent = 'Carregando...';
        submitBtn.disabled = true;

        // Coletar dados do formulário
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            senha: document.getElementById('senha').value,
            tipo: document.querySelector('input[name="tipo"]:checked').value,
            telefone: document.getElementById('telefone') ? document.getElementById('telefone').value.trim() : '',
            endereco: document.getElementById('endereco').value.trim(),
            cidade: document.getElementById('cidade') ? document.getElementById('cidade').value.trim() : '',
            estado: document.getElementById('estado') ? document.getElementById('estado').value.trim() : ''
        };

        console.log('📤 Dados coletados:', formData);

        // Validações
        if (!formData.nome || !formData.email || !formData.senha || !formData.tipo) {
            throw new Error('Por favor, preencha todos os campos obrigatórios.');
        }

        // Validar email
        if (!isValidEmail(formData.email)) {
            throw new Error('Por favor, insira um email válido.');
        }

        // Validar senha
        if (formData.senha.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        const temLetra = /[a-zA-Z]/.test(formData.senha);
        const temNumero = /[0-9]/.test(formData.senha);
        
        if (!temLetra || !temNumero) {
            throw new Error('A senha deve conter letras e números');
        }

        // Verificar confirmação de senha
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        if (formData.senha !== confirmarSenha) {
            throw new Error('As senhas não coincidem');
        }

        // Verificar termos
        const termos = document.getElementById('termos');
        if (!termos || !termos.checked) {
            throw new Error('Você deve aceitar os termos de uso');
        }

        console.log('✅ Validações passadas, enviando para API...');

        // Fazer requisição para a API
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('📥 Resposta recebida, status:', response.status);

        const data = await response.json();
        console.log('📊 Dados da resposta:', data);

        if (response.ok) {
            alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
            window.location.href = 'login.html';
        } else {
            // Tratar diferentes formatos de erro
            const errorMessage = data.error || data.message || 'Erro ao realizar cadastro';
            throw new Error(errorMessage);
        }

    } catch (error) {
        console.error('❌ Erro no registro:', error);
        alert(`❌ Erro: ${error.message}`);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Função de login
async function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Iniciando processo de login...');

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Mostrar estado de carregamento
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;

        // Coletar dados do formulário
        const email = document.getElementById('email').value.trim().toLowerCase();
        const senha = document.getElementById('senha').value;

        // Validações básicas
        if (!email || !senha) {
            throw new Error('Por favor, preencha todos os campos.');
        }

        if (!isValidEmail(email)) {
            throw new Error('Por favor, insira um email válido.');
        }

        console.log('📤 Enviando credenciais para login...');

        // Fazer requisição para a API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        console.log('📥 Resposta do login, status:', response.status);

        const data = await response.json();
        console.log('📊 Dados da resposta:', data);

        if (response.ok) {
            // Salvar token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('✅ Login realizado com sucesso!');
            alert('✅ Login realizado com sucesso!');
            
            // Redirecionar baseado no tipo de usuário
            if (data.user.tipo === 'prestador') {
                window.location.href = 'dashboard-prestador.html';
            } else {
                window.location.href = 'servicos.html';
            }
        } else {
            const errorMessage = data.error || data.message || 'Erro ao fazer login';
            throw new Error(errorMessage);
        }

    } catch (error) {
        console.error('❌ Erro no login:', error);
        alert(`❌ Erro: ${error.message}`);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Função de logout
function handleLogout() {
    console.log('👋 Realizando logout...');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    
    alert('✅ Logout realizado com sucesso!');
    window.location.href = 'index.html';
}

// Verificar estado de autenticação
function checkAuthState() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('👤 Usuário autenticado:', currentUser);
            updateUIForAuthState(true);
        } catch (error) {
            console.error('❌ Erro ao parsear dados do usuário:', error);
            clearAuthData();
        }
    } else {
        updateUIForAuthState(false);
    }
}

// Atualizar UI baseado no estado de autenticação
function updateUIForAuthState(isAuthenticated) {
    // Atualizar navbar
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        if (isAuthenticated) {
            // Remover links de login/cadastro
            const loginLink = navMenu.querySelector('a[href="login.html"]');
            const cadastroLink = navMenu.querySelector('a[href="cadastro.html"]');
            
            if (loginLink) loginLink.parentElement.remove();
            if (cadastroLink) cadastroLink.parentElement.remove();
            
            // Adicionar link de perfil e logout
            if (!navMenu.querySelector('a[href="#logout"]')) {
                const user = JSON.parse(localStorage.getItem('user'));
                const userType = user.tipo === 'prestador' ? 'Prestador' : 'Morador';
                
                const profileLi = document.createElement('li');
                profileLi.innerHTML = `<a href="profile.html">Meu Perfil (${userType})</a>`;
                
                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = '<a href="#" id="logout-link">Sair</a>';
                
                navMenu.appendChild(profileLi);
                navMenu.appendChild(logoutLi);
                
                // Adicionar evento de logout
                document.getElementById('logout-link').addEventListener('click', function(e) {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    }
}

// Função para buscar CEP
async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('❌ Por favor, digite um CEP válido com 8 dígitos.');
        return;
    }
    
    try {
        console.log('📍 Buscando CEP:', cep);
        
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        
        // Preencher os campos com os dados do CEP
        document.getElementById('endereco').value = data.logradouro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
        
        console.log('✅ CEP encontrado:', data);
        
    } catch (error) {
        console.error('❌ Erro ao buscar CEP:', error);
        alert('❌ Erro ao buscar CEP. Verifique o CEP digitado.');
    }
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Limpar dados de autenticação
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
}

// Obter token para requisições
function getAuthToken() {
    return localStorage.getItem('token');
}

// Verificar se usuário está autenticado
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Obter dados do usuário atual
function getCurrentUser() {
    if (!currentUser) {
        const userData = localStorage.getItem('user');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    }
    return currentUser;
}

// Verificar se usuário é prestador
function isPrestador() {
    const user = getCurrentUser();
    return user && user.tipo === 'prestador';
}

// Verificar se usuário é morador
function isMorador() {
    const user = getCurrentUser();
    return user && user.tipo === 'morador';
}

// Proteger rotas que requerem autenticação
function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        alert('⚠️ Você precisa estar logado para acessar esta página.');
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Proteger rotas para prestadores apenas
function requirePrestador(redirectTo = 'servicos.html') {
    if (!requireAuth()) return false;
    
    if (!isPrestador()) {
        alert('⚠️ Esta área é exclusiva para prestadores de serviços.');
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Proteger rotas para moradores apenas
function requireMorador(redirectTo = 'servicos.html') {
    if (!requireAuth()) return false;
    
    if (!isMorador()) {
        alert('⚠️ Esta área é exclusiva para moradores.');
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Redirecionar se já estiver autenticado
function redirectIfAuthenticated(redirectTo = 'servicos.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
        return true;
    }
    return false;
}

console.log('✅ auth.js carregado com sucesso!');