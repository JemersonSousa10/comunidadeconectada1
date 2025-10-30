const services = {
    // Carregar todos os serviços
    loadServices: async (filters = {}) => {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const servicesGrid = document.getElementById('servicesGrid');
        const noServicesMessage = document.getElementById('noServicesMessage');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        try {
            loadingIndicator.style.display = 'block';
            servicesGrid.style.display = 'none';
            noServicesMessage.style.display = 'none';
            loadMoreContainer.style.display = 'none';

            let endpoint = '/services';
            const params = new URLSearchParams();

            // Aplicar filtros
            if (filters.search) {
                params.append('q', filters.search);
            }
            if (filters.category) {
                endpoint = `/services/category/${filters.category}`;
            }

            const queryString = params.toString();
            const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

            const result = await window.api.get(fullEndpoint, { public: true });
            const servicesList = result.services || [];

            // Exibir serviços
            if (servicesList.length > 0) {
                servicesGrid.innerHTML = servicesList.map(service => 
                    services.createServiceCard(service)
                ).join('');
                
                servicesGrid.style.display = 'grid';
                noServicesMessage.style.display = 'none';
                
                // Mostrar botão "carregar mais" se houver muitos serviços
                if (servicesList.length >= 6) {
                    loadMoreContainer.style.display = 'block';
                }
            } else {
                servicesGrid.style.display = 'none';
                noServicesMessage.style.display = 'block';
                loadMoreContainer.style.display = 'none';
            }

        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            window.utils.showError('Erro ao carregar serviços. Tente novamente.');
            noServicesMessage.style.display = 'block';
            noServicesMessage.innerHTML = '<p>Erro ao carregar serviços. Tente novamente.</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    },

    // Criar card de serviço
    createServiceCard: (service) => {
        const description = service.descricao.length > 150 
            ? service.descricao.substring(0, 150) + '...' 
            : service.descricao;

        return `
            <div class="service-card" role="listitem" 
                 onclick="services.openServiceModal(${service.id})"
                 tabindex="0"
                 aria-label="${service.nome_servico} - ${window.utils.formatCurrency(service.valor)}"
                 onkeypress="if(event.key === 'Enter') services.openServiceModal(${service.id})">
                
                <div class="service-header">
                    <div>
                        <h3 class="service-title">${window.utils.sanitizeInput(service.nome_servico)}</h3>
                        <span class="service-category">${window.utils.sanitizeInput(service.categoria)}</span>
                    </div>
                    <div class="service-price">${window.utils.formatCurrency(service.valor)}</div>
                </div>
                
                <p class="service-description">${window.utils.sanitizeInput(description)}</p>
                
                <div class="service-footer">
                    <span class="service-prestador">Por: ${window.utils.sanitizeInput(service.prestador_nome)}</span>
                    <a href="#" class="service-contact" onclick="event.stopPropagation(); services.contactService(${service.id})">
                        Contatar
                    </a>
                </div>
            </div>
        `;
    },

    // Abrir modal de detalhes do serviço
    openServiceModal: async (serviceId) => {
        try {
            const result = await window.api.get('/services', { public: true });
            const service = result.services.find(s => s.id === serviceId);
            
            if (!service) {
                throw new Error('Serviço não encontrado');
            }

            const modal = document.getElementById('serviceModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');

            modalTitle.textContent = service.nome_servico;
            
            modalBody.innerHTML = `
                <div class="service-details">
                    <div class="detail-row">
                        <strong>Categoria:</strong>
                        <span>${window.utils.sanitizeInput(service.categoria)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <strong>Prestador:</strong>
                        <span>${window.utils.sanitizeInput(service.prestador_nome)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <strong>Valor:</strong>
                        <span class="service-price-large">${window.utils.formatCurrency(service.valor)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <strong>Descrição:</strong>
                        <p>${window.utils.sanitizeInput(service.descricao)}</p>
                    </div>
                    
                    ${service.localizacao ? `
                    <div class="detail-row">
                        <strong>Localização:</strong>
                        <span>${window.utils.sanitizeInput(service.localizacao)}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <strong>Contato:</strong>
                        <span>${window.utils.sanitizeInput(service.contato)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <strong>Publicado em:</strong>
                        <span>${window.utils.formatDate(service.criado_em)}</span>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="services.contactService(${service.id})">
                            📞 Entrar em Contato
                        </button>
                        <button class="btn btn-outline" onclick="window.utils.copyToClipboard('${service.contato}')">
                            📋 Copiar Contato
                        </button>
                    </div>
                </div>
            `;

            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');

        } catch (error) {
            console.error('Erro ao abrir modal:', error);
            window.utils.showError('Erro ao carregar detalhes do serviço');
        }
    },

    // Contatar serviço
    contactService: (serviceId) => {
        // Em uma implementação real, isso poderia abrir WhatsApp, email, etc.
        window.utils.showMessage('Funcionalidade de contato em desenvolvimento', 'info');
        
        // Simulação de contato
        const modal = document.getElementById('serviceModal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    },

    // Buscar serviços com filtros
    searchServices: async () => {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        const filters = {};
        
        if (searchInput.value.trim()) {
            filters.search = searchInput.value.trim();
        }
        
        if (categoryFilter.value) {
            filters.category = categoryFilter.value;
        }

        await services.loadServices(filters);
    },

    // Obter serviços do usuário logado (para prestadores)
    getMyServices: async () => {
        try {
            return await window.api.get('/services/my-services');
        } catch (error) {
            console.error('Erro ao obter meus serviços:', error);
            throw error;
        }
    },

    // Criar novo serviço
    createService: async (serviceData) => {
        try {
            const result = await window.api.post('/services', serviceData);
            window.utils.showSuccess('Serviço criado com sucesso!');
            return result;
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            throw error;
        }
    },

    // Deletar serviço
    deleteService: async (serviceId) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) {
            return false;
        }

        try {
            await window.api.delete(`/services/${serviceId}`);
            window.utils.showSuccess('Serviço excluído com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            window.utils.showError('Erro ao excluir serviço');
            return false;
        }
    },

    // Obter categorias disponíveis (hardcoded por enquanto)
    getCategories: () => {
        return [
            { value: 'reparos', label: 'Reparos Domésticos' },
            { value: 'limpeza', label: 'Limpeza' },
            { value: 'aulas', label: 'Aulas Particulares' },
            { value: 'cuidados', label: 'Cuidados Pessoais' },
            { value: 'tecnologia', label: 'Tecnologia' },
            { value: 'eventos', label: 'Eventos' },
            { value: 'outros', label: 'Outros' }
        ];
    }
};

// Handler para cadastro de serviço
async function handleServiceCreate(event) {
    event.preventDefault();
    
    if (!window.auth.requirePrestador()) return;
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    window.utils.setLoading(submitBtn, true);

    try {
        const formData = {
            nome_servico: document.getElementById('nome_servico').value,
            categoria: document.getElementById('categoria').value,
            descricao: document.getElementById('descricao').value,
            valor: parseFloat(document.getElementById('valor').value),
            contato: document.getElementById('contato').value,
            localizacao: document.getElementById('localizacao').value
        };

        await services.createService(formData);
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        window.utils.handleError(error, 'Erro ao criar serviço');
    } finally {
        window.utils.setLoading(submitBtn, false);
    }
}

// Inicializar serviços quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar CSS para modal
    const style = document.createElement('style');
    style.textContent = `
        .service-details .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .service-details .detail-row strong {
            min-width: 120px;
            color: var(--text-primary);
        }
        
        .service-details .detail-row span,
        .service-details .detail-row p {
            flex: 1;
            text-align: right;
            margin: 0;
        }
        
        .service-price-large {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--success-color);
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            justify-content: center;
        }
        
        .loading-spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        body.loading {
            cursor: wait;
        }
        
        body.loading * {
            cursor: wait !important;
        }
    `;
    document.head.appendChild(style);
});

// Export para uso global
window.services = services;
window.handleServiceCreate = handleServiceCreate;