// Gerar Banner de Propaganda com QR Code
let currentBannerAccountId = null;
let currentBannerLink = null;

// Abrir modal de banner
function openBannerModal(accountId, accountName) {
    currentBannerAccountId = accountId;
    
    document.getElementById('banner-account-id').value = accountId;
    
    // Pre-preencher com nome da conta se disponível
    if (accountName) {
        document.getElementById('banner-title').value = `Assine ${accountName}`;
    }
    
    document.getElementById('banner-modal').classList.remove('hidden');
    updateBannerPreview();
}

// Gerar link simples para cadastro e pagamento
function generateBannerLink() {
    const accountId = currentBannerAccountId || document.getElementById('banner-account-id').value;
    
    // Gerar linkId único para rastreamento
    const linkId = `${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = window.location.origin;
    
    // Link simples que direciona para página de cadastro
    // Cliente preenche seus dados e paga o valor do banner
    const fullLink = `${baseUrl}/cadastro/${linkId}`;
    
    currentBannerLink = fullLink;
    document.getElementById('banner-link').value = fullLink;
    
    return fullLink;
}

// Fechar modal de banner
function closeBannerModal() {
    document.getElementById('banner-modal').classList.add('hidden');
    currentBannerAccountId = null;
    currentBannerLink = null;
}

// Atualizar preview do banner
async function updateBannerPreview() {
    const title = document.getElementById('banner-title').value || 'Assine Agora!';
    const description = document.getElementById('banner-description').value || 'Plano Premium';
    const value = document.getElementById('banner-value').value || '149.90';
    const type = document.getElementById('banner-type').value;
    const color = document.getElementById('banner-color').value;
    const buttonText = document.getElementById('banner-button-text').value || 'Cadastre-se Agora';
    
    const typeText = type === 'single' ? 'Pagamento Único' : 'Assinatura Mensal';
    
    // Cores do gradient baseado na seleção
    const gradients = {
        purple: 'from-purple-600 to-pink-600',
        blue: 'from-blue-600 to-cyan-600',
        green: 'from-green-600 to-emerald-600',
        orange: 'from-orange-600 to-red-600',
        red: 'from-red-600 to-rose-600'
    };
    
    const gradient = gradients[color] || gradients.purple;
    
    // Gerar link atualizado
    const link = generateBannerLink();
    let qrCodeDataUrl = '';
    
    if (link && typeof QRCode !== 'undefined') {
        try {
            qrCodeDataUrl = await QRCode.toDataURL(link, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (err) {
            console.error('Erro ao gerar QR Code:', err);
        }
    }
    
    // HTML do preview
    const previewHTML = `
        <div class="w-full h-full bg-gradient-to-br ${gradient} p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <!-- Decoração de fundo -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            
            <!-- Conteúdo -->
            <div class="relative z-10">
                <div class="mb-6">
                    <div class="text-sm font-semibold mb-2 opacity-90">${typeText}</div>
                    <h1 class="text-4xl font-bold mb-4 leading-tight">${title}</h1>
                    <p class="text-lg opacity-90 mb-6">${description}</p>
                    <div class="text-5xl font-bold mb-2">
                        R$ ${parseFloat(value).toFixed(2).replace('.', ',')}
                        ${type === 'monthly' ? '<span class="text-2xl">/mês</span>' : ''}
                    </div>
                </div>
            </div>
            
            <!-- QR Code e CTA -->
            <div class="relative z-10 flex items-end justify-between">
                <div class="bg-white rounded-xl p-4 shadow-2xl">
                    ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" class="w-32 h-32" alt="QR Code" />` : '<div class="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">QR Code</div>'}
                    <p class="text-center text-xs text-gray-800 mt-2 font-semibold">Escaneie para cadastrar</p>
                </div>
                <div class="text-right">
                    <button class="bg-white text-${color}-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition transform">
                        ${buttonText} →
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('banner-preview').innerHTML = previewHTML;
}

// Baixar banner como PNG
async function downloadBanner() {
    const title = document.getElementById('banner-title').value || 'Assine Agora!';
    const description = document.getElementById('banner-description').value || 'Plano Premium';
    const value = document.getElementById('banner-value').value || '149.90';
    const type = document.getElementById('banner-type').value;
    const color = document.getElementById('banner-color').value;
    const buttonText = document.getElementById('banner-button-text').value || 'Cadastre-se Agora';
    
    // Gerar link atualizado
    const link = generateBannerLink();
    
    // Criar canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Gradientes de cores
    const colorGradients = {
        purple: { start: '#9333ea', end: '#ec4899' },
        blue: { start: '#2563eb', end: '#06b6d4' },
        green: { start: '#16a34a', end: '#10b981' },
        orange: { start: '#ea580c', end: '#dc2626' },
        red: { start: '#dc2626', end: '#f43f5e' }
    };
    
    const selectedGradient = colorGradients[color] || colorGradients.purple;
    
    // Desenhar fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, selectedGradient.start);
    gradient.addColorStop(1, selectedGradient.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Círculos decorativos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(900, 150, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 900, 250, 0, Math.PI * 2);
    ctx.fill();
    
    // Texto tipo de cobrança
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(type === 'single' ? 'PAGAMENTO ÚNICO' : 'ASSINATURA MENSAL', 80, 120);
    
    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    const titleLines = wrapText(ctx, title, 920);
    titleLines.forEach((line, i) => {
        ctx.fillText(line, 80, 200 + (i * 85));
    });
    
    // Descrição
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '36px Arial';
    const descLines = wrapText(ctx, description, 920);
    descLines.forEach((line, i) => {
        ctx.fillText(line, 80, 350 + (i * 50));
    });
    
    // Valor
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px Arial';
    const valueText = `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    ctx.fillText(valueText, 80, 550);
    
    if (type === 'monthly') {
        ctx.font = 'bold 48px Arial';
        ctx.fillText('/mês', 80 + ctx.measureText(valueText).width + 20, 550);
    }
    
    // QR Code
    if (link && typeof QRCode !== 'undefined') {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(link, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            // Desenhar fundo branco para QR Code
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 10;
            
            const qrSize = 280;
            const qrX = 80;
            const qrY = 680;
            const padding = 30;
            
            // Fundo arredondado
            ctx.beginPath();
            ctx.roundRect(qrX - padding, qrY - padding, qrSize + padding * 2, qrSize + padding * 2 + 60, 20);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Carregar e desenhar QR Code
            const qrImage = new Image();
            qrImage.src = qrCodeDataUrl;
            await new Promise((resolve) => {
                qrImage.onload = () => {
                    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
                    resolve();
                };
            });
            
            // Texto abaixo do QR Code
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Escaneie para cadastrar', qrX + qrSize / 2, qrY + qrSize + 45);
            ctx.textAlign = 'left';
            
        } catch (err) {
            console.error('Erro ao adicionar QR Code ao banner:', err);
        }
    }
    
    // Botão CTA
    const btnWidth = 480;
    const btnHeight = 90;
    const btnX = canvas.width - btnWidth - 80;
    const btnY = canvas.height - btnHeight - 80;
    
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 50);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = selectedGradient.start;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(buttonText + ' →', btnX + btnWidth / 2, btnY + btnHeight / 2 + 15);
    ctx.textAlign = 'left';
    
    // Baixar
    const fileName = `banner-${Date.now()}.png`;
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Copiar link da cobrança
function copyBannerLink() {
    // Gerar/atualizar link
    const link = generateBannerLink();
    
    if (!link) {
        alert('❌ Erro ao gerar link');
        return;
    }
    
    // Copiar para área de transferência
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ Link copiado para a área de transferência!\n\nCompartilhe este link em suas redes sociais ou envie para clientes.\n\n' + link);
    }).catch(() => {
        // Fallback para navegadores antigos
        const input = document.createElement('input');
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Link copiado!\n\nCompartilhe este link em suas redes sociais ou envie para clientes.\n\n' + link);
    });
}

// Função auxiliar para quebrar texto em múltiplas linhas
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

// Polyfill para roundRect (alguns navegadores não têm)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        return this;
    };
}
