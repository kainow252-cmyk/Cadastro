// Analytics e UX melhorado

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

// Buscar CEP automaticamente
async function buscarCEP(cep) {
    try {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length !== 8) return;
        
        showToast('🔍 Buscando endereço...', 'info');
        
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            showToast('CEP não encontrado', 'error');
            return;
        }
        
        // Preencher campos automaticamente
        const addressField = document.querySelector('[name="address"]');
        const provinceField = document.querySelector('[name="province"]');
        
        if (addressField && data.logradouro) {
            addressField.value = data.logradouro;
            addressField.classList.add('field-filled');
        }
        
        if (provinceField && data.bairro) {
            provinceField.value = data.bairro;
            provinceField.classList.add('field-filled');
        }
        
        showToast('✅ Endereço preenchido automaticamente!', 'success');
        
        // Focar no próximo campo
        document.querySelector('[name="addressNumber"]')?.focus();
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showToast('Erro ao buscar CEP', 'error');
    }
}

// Validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// Validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

// Validação em tempo real de CPF/CNPJ
function setupCPFCNPJValidation() {
    const cpfCnpjField = document.querySelector('[name="cpfCnpj"]');
    if (!cpfCnpjField) return;
    
    cpfCnpjField.addEventListener('blur', function() {
        const value = this.value.replace(/\D/g, '');
        
        if (value.length === 0) return;
        
        let isValid = false;
        if (value.length === 11) {
            isValid = validarCPF(value);
        } else if (value.length === 14) {
            isValid = validarCNPJ(value);
        }
        
        if (!isValid && value.length > 0) {
            this.classList.add('field-error');
            showToast('CPF/CNPJ inválido', 'error');
        } else {
            this.classList.remove('field-error');
            this.classList.add('field-success');
        }
    });
}

// Adicionar listener de CEP
function setupCEPLookup() {
    const cepField = document.querySelector('[name="postalCode"]');
    if (!cepField) return;
    
    let timeoutId;
    cepField.addEventListener('input', function() {
        clearTimeout(timeoutId);
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            timeoutId = setTimeout(() => buscarCEP(cep), 500);
        }
    });
}

// Progress bar para formulários
function createFormProgress(currentStep, totalSteps) {
    const percentage = (currentStep / totalSteps) * 100;
    return `
        <div class="form-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="progress-text">Passo ${currentStep} de ${totalSteps}</span>
        </div>
    `;
}

// Loading state
function setLoading(element, loading = true) {
    if (loading) {
        element.disabled = true;
        element.dataset.originalText = element.innerHTML;
        element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando...';
    } else {
        element.disabled = false;
        element.innerHTML = element.dataset.originalText;
    }
}

// Copiar para clipboard com feedback
async function copyToClipboard(text, successMessage = 'Copiado!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage, 'success');
        return true;
    } catch (err) {
        showToast('Erro ao copiar', 'error');
        return false;
    }
}

// Confirmar ação
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Formatar data para exibição
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calcular dias restantes
function daysUntil(dateString) {
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Badge de status
function getStatusBadge(expiresAt, active) {
    const days = daysUntil(expiresAt);
    
    if (!active) {
        return '<span class="badge badge-danger">🔴 Desativado</span>';
    } else if (days < 0) {
        return '<span class="badge badge-warning">⚫ Expirado</span>';
    } else if (days <= 3) {
        return `<span class="badge badge-warning">⚠️ Expira em ${days}d</span>`;
    } else {
        return `<span class="badge badge-success">🟢 Ativo (${days}d)</span>`;
    }
}

// Analytics - Criar gráfico simples de barras
function createBarChart(container, data, labels) {
    const maxValue = Math.max(...data);
    
    let html = '<div class="bar-chart">';
    
    data.forEach((value, index) => {
        const percentage = (value / maxValue) * 100;
        html += `
            <div class="bar-item">
                <div class="bar-label">${labels[index]}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <span class="bar-value">${value}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Analytics - Taxa de conversão
function calculateConversionRate(views, conversions) {
    if (views === 0) return 0;
    return ((conversions / views) * 100).toFixed(1);
}

// Analytics - Carregar estatísticas de um link
async function loadLinkAnalytics(linkId) {
    try {
        const response = await axios.get(`/api/links/${linkId}/analytics`);
        
        if (response.data.ok) {
            const analytics = response.data.data;
            displayLinkAnalytics(analytics);
        }
    } catch (error) {
        showToast('Erro ao carregar analytics', 'error');
    }
}

// Analytics - Exibir estatísticas
function displayLinkAnalytics(analytics) {
    const container = document.getElementById('analytics-container');
    if (!container) return;
    
    const conversionRate = calculateConversionRate(analytics.views, analytics.conversions);
    
    container.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card">
                <div class="card-icon">👁️</div>
                <div class="card-value">${analytics.views}</div>
                <div class="card-label">Visualizações</div>
            </div>
            
            <div class="analytics-card">
                <div class="card-icon">▶️</div>
                <div class="card-value">${analytics.started}</div>
                <div class="card-label">Iniciados (${((analytics.started/analytics.views)*100).toFixed(0)}%)</div>
            </div>
            
            <div class="analytics-card">
                <div class="card-icon">✅</div>
                <div class="card-value">${analytics.conversions}</div>
                <div class="card-label">Completos (${conversionRate}%)</div>
            </div>
        </div>
        
        <div class="conversion-funnel">
            <h3>Funil de Conversão</h3>
            <div class="funnel-bar" style="width: 100%">
                <span>${analytics.views} Visualizações</span>
            </div>
            <div class="funnel-bar" style="width: ${(analytics.started/analytics.views)*100}%">
                <span>${analytics.started} Iniciados</span>
            </div>
            <div class="funnel-bar" style="width: ${(analytics.conversions/analytics.views)*100}%">
                <span>${analytics.conversions} Completos</span>
            </div>
        </div>
    `;
}

// Atalhos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+K ou Cmd+K - Buscar
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.querySelector('[type="search"]')?.focus();
        }
        
        // Ctrl+N ou Cmd+N - Novo link
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showSection('create');
        }
        
        // Ctrl+L ou Cmd+L - Ver links
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            showSection('links');
        }
    });
}

// Salvar rascunho automaticamente
let autosaveTimer;
function enableAutosave(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('input', function() {
        clearTimeout(autosaveTimer);
        
        autosaveTimer = setTimeout(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            localStorage.setItem(`autosave_${formId}`, JSON.stringify(data));
            
            // Mostrar indicador visual
            const indicator = document.getElementById('autosave-indicator');
            if (indicator) {
                indicator.textContent = '💾 Rascunho salvo';
                setTimeout(() => {
                    indicator.textContent = '';
                }, 2000);
            }
        }, 1000);
    });
    
    // Restaurar rascunho ao carregar
    const saved = localStorage.getItem(`autosave_${formId}`);
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && data[key]) {
                field.value = data[key];
            }
        });
        
        showToast('📝 Rascunho restaurado', 'info');
    }
}

// Limpar rascunho
function clearAutosave(formId) {
    localStorage.removeItem(`autosave_${formId}`);
}

// Inicializar melhorias de UX
function initUXImprovements() {
    setupCPFCNPJValidation();
    setupCEPLookup();
    setupKeyboardShortcuts();
    
    // Adicionar autosave nos formulários
    enableAutosave('create-account-form');
    enableAutosave('signup-form');
    
    console.log('✨ Melhorias de UX inicializadas');
}

// Executar quando o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUXImprovements);
} else {
    initUXImprovements();
}
