const API_BASE = window.API_BASE_URL || 'https://comunidade-conectada-backend.onrender.com/api';
console.log('🔗 API_BASE:', API_BASE);

const services = {
  async loadServices() {
    try {
        console.log('🔍 Iniciando carregamento de serviços...');
        this.showLoading(true);
        
        const token = localStorage.getItem('token');
        console.log('🔐 Token:', token ? '✅ Presente' : '❌ Ausente');
        
        // Fazer requisição para o backend
        const response = await fetch(`${API_BASE}/services`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status do backend:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend retornou erro:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📦 Resposta completa:', data);
        
        // ✅ CORREÇÃO: Extrair o array de serviços da propriedade 'services'
        const servicos = data.services || data;
        console.log('✅ Serviços extraídos:', servicos);
        
        if (servicos && Array.isArray(servicos)) {
            this.displayServices(servicos);
        } else {
            console.error('❌ Formato inesperado:', servicos);
            throw new Error('Formato de resposta inesperado do servidor');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar serviços:', error);
        
        // Fallback em caso de erro
        this.useFallbackWithMessage(error.message);
    } finally {
        this.showLoading(false);
    }
},

useFallbackWithMessage(errorMsg) {
    console.log('🔄 Usando fallback por causa do erro:', errorMsg);
    
    // Serviços de exemplo
    const servicosExemplo = [
        {
            id: 1,
            nome_servico: "Encanador Residencial",
            descricao: "Serviços de encanamento para residências, consertos e instalações",
            categoria: "reparos",
            valor: 80.00,
            contato: "(11) 99999-9999",
            localizacao: "Centro",
            prestador_nome: "João Silva"
        },
        {
            id: 2,
            nome_servico: "Aulas de Matemática",
            descricao: "Aulas particulares para ensino fundamental e médio",
            categoria: "aulas",
            valor: 50.00,
            contato: "professora@email.com",
            localizacao: "Zona Norte",
            prestador_nome: "Maria Santos"
        }
    ];
    
    this.displayServices(servicosExemplo);
    
    // Mensagem informativa
    const grid = document.getElementById('servicesGrid');
    const existingHTML = grid.innerHTML;
    grid.innerHTML = existingHTML + `
        <div class="info-message" style="grid-column: 1 / -1; background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h4>⚠️ Erro de Formatação</h4>
            <p>Backend funcionando mas formato inesperado: ${errorMsg}</p>
            <p><small>Mostrando serviços de exemplo. O problema está no processamento da resposta.</small></p>
        </div>
    `;
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