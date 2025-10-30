const auth = {
    // Verificar se usuário está logado
    isLoggedIn: () => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    },

    // Obter usuário atual
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('currentUser');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    },

    // Salvar dados de autenticação
    setAuth: (token, user) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Limpar dados de autenticação
    clearAuth: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },

    // Fazer logout
    logout: () => {
        auth.clearAuth();
        window.utils.showSuccess('Logout realizado com sucesso!');
    },

    // Obter perfil do usuário
    getProfile: async () => {
        try {
            return await window.api.get('/auth/profile');
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            throw error;
        }
    },

    // Validar força da senha
    validatePasswordStrength: (password) => {
        const requirements = {
            length: password.length >= 6,
            hasNumber: /\d/.test(password),
            hasLetter: /[a-zA-Z]/.test(password)
        };

        const strength = Object.values(requirements).filter(Boolean).length;
        
        return {
            strength,
            requirements,
            isValid: requirements.length && requirements.hasNumber && requirements.hasLetter
        };
    }
};

// Handler para registro
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    window.utils.setLoading(submitBtn, true);

    try {
        // Validar senhas
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        if (senha !== confirmarSenha) {
            throw new Error('As senhas não coincidem');
        }

        // Validar força da senha
        const passwordValidation = auth.validatePasswordStrength(senha);
        if (!passwordValidation.isValid) {
            throw new Error('A senha deve ter pelo menos 6 caracteres, incluindo letras e números');
        }

        // Coletar dados do formulário
        const formData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: senha,
            tipo: document.querySelector('input[name="tipo"]:checked').value,
            cep: document.getElementById('cep').value,
            endereco: document.getElementById('endereco').value
        };

        // Fazer request de registro
        const result = await window.api.post('/auth/register', formData, { public: true });

        // Salvar autenticação
        auth.setAuth(result.token, result.user);
        
        window.utils.showSuccess('Cadastro realizado com sucesso!');
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Erro no registro:', error);
        window.utils.handleError(error, 'Erro ao realizar cadastro');
    } finally {
        window.utils.setLoading(submitBtn, false);
    }
}

// Handler para login
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    window.utils.setLoading(submitBtn, true);

    try {
        const formData = {
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value
        };

        const result = await window.api.post('/auth/login', formData, { public: true });

        // Salvar autenticação
        auth.setAuth(result.token, result.user);
        
        window.utils.showSuccess('Login realizado com sucesso!');
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Erro no login:', error);
        window.utils.handleError(error, 'Erro ao fazer login');
    } finally {
        window.utils.setLoading(submitBtn, false);
    }
}

// Buscar CEP via API
async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    const cep = window.utils.cleanCEP(cepInput.value);

    if (!window.utils.validateCEP(cep)) {
        window.utils.showError('CEP inválido. Formato: 00000-000');
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado');
        }

        const enderecoInput = document.getElementById('endereco');
        enderecoInput.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        
        window.utils.showSuccess('Endereço preenchido automaticamente!');

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        window.utils.showError('Erro ao buscar CEP. Preencha o endereço manualmente.');
    }
}

// Proteger rotas que requerem autenticação
function requireAuth() {
    if (!auth.isLoggedIn()) {
        window.utils.showError('Você precisa estar logado para acessar esta página');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    return true;
}

// Verificar permissões de prestador
function requirePrestador() {
    if (!requireAuth()) return false;

    const user = auth.getCurrentUser();
    if (user.tipo !== 'prestador') {
        window.utils.showError('Apenas prestadores de serviços podem acessar esta funcionalidade');
        return false;
    }

    return true;
}

// Atualizar dados do usuário
async function updateUserProfile(userData) {
    try {
        const result = await window.api.put('/auth/profile', userData);
        
        // Atualizar usuário no localStorage
        const currentUser = auth.getCurrentUser();
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        window.utils.showSuccess('Perfil atualizado com sucesso!');
        return result;
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
    }
}

// Export para uso global
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.buscarCEP = buscarCEP;
window.auth = auth;