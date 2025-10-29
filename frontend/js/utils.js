// Utilitários gerais para a aplicação

const utils = {
    // Formatar moeda brasileira
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Formatar data
    formatDate: (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    },

    // Validar e-mail
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validar CEP
    validateCEP: (cep) => {
        const re = /^\d{5}-?\d{3}$/;
        return re.test(cep);
    },

    // Limpar CEP (remover traços)
    cleanCEP: (cep) => {
        return cep.replace(/\D/g, '');
    },

    // Mostrar mensagens para o usuário
    showMessage: (message, type = 'info', duration = 5000) => {
        // Remove mensagens existentes
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.setAttribute('role', 'alert');
        messageDiv.setAttribute('aria-live', 'polite');

        // Adiciona ao topo da página
        const main = document.querySelector('main') || document.body;
        main.insertBefore(messageDiv, main.firstChild);

        // Remove após o tempo especificado
        if (duration > 0) {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, duration);
        }

        return messageDiv;
    },

    // Mostrar erro
    showError: (message, duration = 5000) => {
        return utils.showMessage(message, 'error', duration);
    },

    // Mostrar sucesso
    showSuccess: (message, duration = 5000) => {
        return utils.showMessage(message, 'success', duration);
    },

    // Loading state para botões
    setLoading: (button, isLoading) => {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span> Carregando...';
            button.setAttribute('aria-busy', 'true');
        } else {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
            button.removeAttribute('aria-busy');
        }
    },

    // Salvar original text do botão
    initButtonLoading: (button) => {
        button.setAttribute('data-original-text', button.textContent);
    },

    // Debounce para pesquisas
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Sanitizar input
    sanitizeInput: (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Copiar para clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            utils.showSuccess('Copiado para a área de transferência!', 2000);
            return true;
        } catch (err) {
            console.error('Falha ao copiar: ', err);
            utils.showError('Falha ao copiar para a área de transferência');
            return false;
        }
    },

    // Verificar conexão
    checkOnlineStatus: () => {
        return navigator.onLine;
    },

    // Tratamento de erro genérico
    handleError: (error, userMessage = 'Ocorreu um erro inesperado') => {
        console.error('Erro:', error);
        
        if (error.response && error.response.data && error.response.data.error) {
            utils.showError(error.response.data.error);
        } else if (error.message) {
            utils.showError(error.message);
        } else {
            utils.showError(userMessage);
        }
    },

    // Redirecionamento seguro
    redirect: (url, delay = 0) => {
        if (delay > 0) {
            setTimeout(() => {
                window.location.href = url;
            }, delay);
        } else {
            window.location.href = url;
        }
    },

    // Rolagem suave para elemento
    scrollToElement: (elementId, offset = 0) => {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
};

// Inicializar utilitários quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar botões de loading
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        utils.initButtonLoading(button);
    });
});

export default utils;