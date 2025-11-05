const API_BASE_URL = 'https://comunidade-conectada-backend.onrender.com/api';
window.API_BASE_URL = API_BASE_URL;

console.log('✅ API_BASE_URL configurada:', API_BASE_URL);
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
    console.log('🚀 Iniciando cadastro...');

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
            cep: document.getElementById('cep').value.trim()
        };

        console.log('📤 Dados coletados:', formData);

        // Validações básicas
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

        console.log('✅ Todas validações passadas, enviando para API...');

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
    // Login automático após cadastro
    console.log('✅ Cadastro realizado, fazendo login automático...');
    
    // Fazer login automaticamente com as credenciais
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: formData.email,
            senha: formData.senha
        })
    });

    if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        
        // Salvar token e dados do usuário
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        console.log('✅ Login automático realizado!');
        
        // Redirecionar baseado no tipo de usuário
        if (loginData.user.tipo === 'prestador') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'services.html';
        }
    } else {
        alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
        window.location.href = 'login.html';
    }
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
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'services.html';
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

// Verificar estado de autenticação
// VERSAÃO CORRIGIDA - função checkAuthState única e completa
function checkAuthState() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('👤 Usuário autenticado:', currentUser);
            updateUIForAuthState(true);
            updateNavigation(); // ← AGORA ESTÁ SENDO CHAMADA!
        } catch (error) {
            console.error('❌ Erro ao parsear dados do usuário:', error);
            clearAuthData();
        }
    } else {
        updateUIForAuthState(false);
        updateNavigation(); // ← AGORA ESTÁ SENDO CHAMADA AQUI TAMBÉM!
    }
}

// Atualizar UI baseado no estado de autenticação
function updateUIForAuthState(isAuthenticated) {
    // Implementação conforme necessário
}

// ===== FUNÇÕES NOVAS ADICIONADAS =====

// Verificar se usuário está logado
function isLoggedIn() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
        return false;
    }
    
    try {
        // Verificar se o token não expirou
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        return !isExpired;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return false;
    }
}

// Obter usuário atual
function getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Requer que usuário seja prestador
function requirePrestador() {
    if (!isLoggedIn()) {
        alert('Você precisa estar logado para acessar esta página');
        window.location.href = 'login.html';
        return false;
    }
    
    const user = getCurrentUser();
    if (user.tipo !== 'prestador') {
        alert('Apenas prestadores de serviços podem acessar esta página');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Logout
function handleLogout() {
    console.log('👋 Realizando logout silencioso...');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    
    window.location.href = 'index.html';
}

// Verificar e redirecionar se já estiver logado
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'services.html';
        return true;
    }
    return false;
}

// Verificar e redirecionar se NÃO estiver logado
function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return true;
    }
    return false;
}

// Limpar dados de autenticação
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
}

// Função para adicionar botão de logout dinamicamente
function addLogoutButton() {
    // Verificar se já existe um botão de logout
    if (document.querySelector('.logout-btn')) return;
    
    // Procurar o menu de navegação
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Verificar se já está logado
    if (!isLoggedIn()) return;
    
    // Criar botão de logout
    const logoutLi = document.createElement('li');
    logoutLi.innerHTML = '<a href="#" class="logout-btn">🚪 Sair</a>';
    
    // Adicionar evento de clique
    const logoutBtn = logoutLi.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
    
    // Adicionar ao menu (no final)
    navMenu.appendChild(logoutLi);
}

// Função para atualizar o menu de navegação baseado no estado de login
function updateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    const isLogged = isLoggedIn();
    
    if (isLogged) {
        // Remover links de login e cadastro se existirem
        const loginLink = navMenu.querySelector('a[href="login.html"]');
        const cadastroLink = navMenu.querySelector('a[href="cadastro.html"]');
        
        if (loginLink) loginLink.parentElement.remove();
        if (cadastroLink) cadastroLink.parentElement.remove();
        
        // Adicionar link para dashboard se não existir
        if (!navMenu.querySelector('a[href="dashboard.html"]')) {
            const dashboardLi = document.createElement('li');
            dashboardLi.innerHTML = '<a href="dashboard.html">Meu Painel</a>';
            navMenu.appendChild(dashboardLi);
        }
        
        // Adicionar botão de logout
        addLogoutButton();
    }
}

// Atualizar a função checkAuthState para incluir a navegação
function checkAuthState() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('👤 Usuário autenticado:', currentUser);
            updateUIForAuthState(true);
            updateNavigation(); // ← ADICIONAR ESTA LINHA
        } catch (error) {
            console.error('❌ Erro ao parsear dados do usuário:', error);
            clearAuthData();
        }
    } else {
        updateUIForAuthState(false);
        updateNavigation(); // ← ADICIONAR ESTA LINHA TAMBÉM
    }
}

console.log('✅ auth.js carregado com sucesso!');