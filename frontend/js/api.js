// Configuração e utilitários para API
const API_BASE_URL = 'https://comunidade-conectada-backend.onrender.com';

const api = {
    // Headers padrão
    getHeaders: (includeAuth = true) => {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    },

    // Handler genérico de requests
    request: async (endpoint, options = {}) => {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        const config = {
            headers: api.getHeaders(!options.public),
            ...options
        };

        try {
            console.log(`🌐 Fazendo request para: ${url}`);
            const response = await fetch(url, config);
            
            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            let data;
            if (isJson) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                // Se for unauthorized, redirecionar para login
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                    throw new Error('Sessão expirada. Por favor, faça login novamente.');
                }

                const error = new Error(data.error || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('❌ API Request failed:', error);
            
            // Verificar se é erro de rede
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
            }
            
            throw error;
        }
    },

    // Métodos HTTP
    get: (endpoint, options = {}) => {
        return api.request(endpoint, { method: 'GET', ...options });
    },

    post: (endpoint, data = {}, options = {}) => {
        return api.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },

    put: (endpoint, data = {}, options = {}) => {
        return api.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    },

    delete: (endpoint, options = {}) => {
        return api.request(endpoint, { method: 'DELETE', ...options });
    },

    // Upload de arquivos (para futuras implementações)
    upload: async (endpoint, formData) => {
        const token = localStorage.getItem('authToken');
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    // Health check
    healthCheck: async () => {
        try {
            await api.get('/health', { public: true });
            return true;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
};

// Interceptor para adicionar loading global
let activeRequests = 0;

const originalRequest = api.request;
api.request = async function(endpoint, options = {}) {
    activeRequests++;
    updateLoadingIndicator();

    try {
        const result = await originalRequest.call(this, endpoint, options);
        return result;
    } finally {
        activeRequests--;
        updateLoadingIndicator();
    }
};

function updateLoadingIndicator() {
    // Poderia implementar um loading global aqui
    if (activeRequests > 0) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
}

// Tornar global
window.api = api;