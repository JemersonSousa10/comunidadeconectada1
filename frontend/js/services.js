const API_BASE = window.API_BASE_URL || 'https://comunidade-conectada-backend.onrender.com/api';
console.log('🔗 API_BASE:', API_BASE);

const services = {
    async loadServices() {
    try {
        console.log('🔍 Iniciando carregamento de serviços...');
        this.showLoading(true);
        
        // Debug: verificar configurações
        console.log('🌐 API_BASE:', API_BASE);
        console.log('🔐 Token:', localStorage.getItem('token'));
        console.log('👤 User:', localStorage.getItem('user'));
        
        // Obter valores dos filtros
        const search = document.getElementById('searchInput').value;
        const category = document.getElementById('categoryFilter').value;
        const sort = document.getElementById('sortFilter').value;
        
        // Construir URL com parâmetros de busca e filtros
        let url = `${API_BASE}/services`;
        const params = new URLSearchParams();
        
        if (search) params.append('q', search);
        if (category) params.append('categoria', category);
        if (sort) params.append('ordenar', sort);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        console.log('🌐 URL completa:', url);
        
        // Fazer requisição DIRETA para debug
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status da resposta:', response.status);
        console.log('🔗 Headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro da API:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const servicos = await response.json();
        console.log('✅ Serviços carregados:', servicos);
        
        this.displayServices(servicos);
        
    } catch (error) {
        console.error('❌ Erro ao carregar serviços:', error);
        alert('Erro ao carregar serviços. Verifique o console para detalhes.');
        
        // Fallback: mostrar mensagem amigável
        document.getElementById('servicesGrid').innerHTML = `
            <div class="error-message">
                <h3>😕 Não foi possível carregar os serviços</h3>
                <p>Erro: ${error.message}</p>
                <button onclick="services.loadServices()" class="btn btn-primary">
                    🔄 Tentar novamente
                </button>
            </div>
        `;
    } finally {
        this.showLoading(false);
    }
},
    
    displayServices(servicos) {
        const grid = document.getElementById('servicesGrid');
        const noServices = document.getElementById('noServicesMessage');
        
        if (servicos.length === 0) {
            grid.style.display = 'none';
            noServices.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        noServices.style.display = 'none';
        
        grid.innerHTML = servicos.map(servico => `
            <div class="servico-card" role="listitem">
                <h3>${servico.nome_servico}</h3>
                <p>${servico.descricao}</p>
                <div class="servico-meta">
                    <span class="categoria">${servico.categoria}</span>
                    <span class="preco">R$ ${servico.valor}</span>
                </div>
                <p class="prestador">Por: ${servico.prestador_nome}</p>
                <button onclick="services.verDetalhes(${servico.id})" class="btn btn-outline">
                    Ver Detalhes
                </button>
            </div>
        `).join('');
    },
    
    async verDetalhes(servicoId) {
    try {
        // Use a API do seu api.js
        const servico = await api.get(`/services/${servicoId}`);
        this.openServiceModal(servico);
        
    } catch (error) {
        console.error('Erro:', error);
        // Fallback: modal simples com dados básicos
        this.openSimpleModal(servicoId);
    }
},
    
    openServiceModal(servico) {
        const modal = document.getElementById('serviceModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = servico.nome_servico;
        modalBody.innerHTML = `
            <div class="modal-service-details">
                <p><strong>Descrição:</strong> ${servico.descricao}</p>
                <p><strong>Categoria:</strong> ${servico.categoria}</p>
                <p><strong>Valor:</strong> R$ ${servico.valor}</p>
                <p><strong>Contato:</strong> ${servico.contato}</p>
                ${servico.localizacao ? `<p><strong>Localização:</strong> ${servico.localizacao}</p>` : ''}
                <p><strong>Prestador:</strong> ${servico.prestador_nome}</p>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="services.contatarPrestador('${servico.contato}', '${servico.nome_servico}')">
                        📞 Contatar
                    </button>
                    <button class="btn btn-outline" onclick="services.favoritarServico(${servico.id})">
                        ⭐ Favoritar
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
    },
    
    openSimpleModal(servicoId) {
        const modal = document.getElementById('serviceModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Detalhes do Serviço';
        modalBody.innerHTML = `
            <div class="modal-service-details">
                <p>Detalhes completos em desenvolvimento.</p>
                <p><strong>ID do Serviço:</strong> ${servicoId}</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="alert('Funcionalidade de contato em desenvolvimento')">
                        📞 Contatar
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
    },
    
    contatarPrestador(contato, servicoNome) {
        const mensagem = `Olá, gostaria de saber mais sobre o serviço: ${servicoNome}`;
        
        // Verificar se é WhatsApp (número de telefone)
        if (contato.replace(/\D/g, '').length >= 10) {
            const telefone = contato.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
            window.open(whatsappUrl, '_blank');
        } else if (contato.includes('@')) {
            // É email
            const emailUrl = `mailto:${contato}?subject=Interesse no serviço: ${servicoNome}&body=${encodeURIComponent(mensagem)}`;
            window.location.href = emailUrl;
        } else {
            // Outro tipo de contato
            alert(`Contato: ${contato}\n\nServiço: ${servicoNome}`);
        }
    },
    
    favoritarServico(servicoId) {
        let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
        
        if (!favoritos.includes(servicoId)) {
            favoritos.push(servicoId);
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            alert('⭐ Serviço adicionado aos favoritos!');
        } else {
            alert('✅ Serviço já está nos favoritos!');
        }
    },
    
    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }
};

// Função para carregar serviços ao iniciar a página
document.addEventListener('DOMContentLoaded', function() {
    services.loadServices();
});