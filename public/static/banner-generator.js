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
    
    // Resetar estado do modal
    document.getElementById('generate-banner-container').classList.remove('hidden');
    document.getElementById('banner-preview-container').classList.add('hidden');
    document.getElementById('banner-actions').classList.add('hidden');
    
    document.getElementById('banner-modal').classList.remove('hidden');
}

// Gerar e mostrar banner
async function generateAndShowBanner() {
    // Esconder botão "Gerar Banner"
    document.getElementById('generate-banner-container').classList.add('hidden');
    
    // Mostrar preview container
    document.getElementById('banner-preview-container').classList.remove('hidden');
    
    // Gerar preview do banner
    await updateBannerPreview();
    
    // Mostrar botões de ação
    document.getElementById('banner-actions').classList.remove('hidden');
}

// Gerar link do banner (página de oferta) que direciona para cadastro
function generateBannerLink() {
    const accountId = currentBannerAccountId || document.getElementById('banner-account-id').value;
    const title = document.getElementById('banner-title').value || 'Assine Agora!';
    const description = document.getElementById('banner-description').value || 'Plano Premium';
    const value = document.getElementById('banner-value').value || '149.90';
    const type = document.getElementById('banner-type').value;
    const color = document.getElementById('banner-color').value;
    const buttonText = document.getElementById('banner-button-text').value || 'Cadastre-se Agora';
    
    // Gerar linkId único para rastreamento
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    // Codificar dados do banner em base64 para passar na URL
    const bannerData = {
        title,
        description,
        value,
        type,
        color,
        buttonText,
        accountId,
        timestamp,
        random
    };
    
    const bannerDataEncoded = btoa(encodeURIComponent(JSON.stringify(bannerData)));
    const linkId = `${accountId}-${timestamp}-${random}`;
    const baseUrl = window.location.origin;
    
    // Link do banner (página de oferta) que tem botão para cadastro
    const bannerLink = `${baseUrl}/banner/${bannerDataEncoded}`;
    
    // Link de assinatura mensal (usado no QR Code e como link principal)
    const subscriptionLink = `${baseUrl}/subscription-signup/${linkId}`;
    
    currentBannerLink = subscriptionLink;
    document.getElementById('banner-link').value = subscriptionLink;
    
    // Retornar link de assinatura para o QR Code
    return subscriptionLink;
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
    
    console.log('🔗 Link gerado para QR Code:', link);
    console.log('📦 QRCode library disponível:', typeof QRCode !== 'undefined');
    
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
            console.log('✅ QR Code gerado com sucesso!');
        } catch (err) {
            console.error('❌ Erro ao gerar QR Code:', err);
        }
    } else {
        if (!link) {
            console.error('❌ Link não foi gerado');
        }
        if (typeof QRCode === 'undefined') {
            console.error('❌ Biblioteca QRCode não carregada. Verifique se o script está no HTML.');
        }
    }
    
    // HTML do preview - RESPONSIVO
    const previewHTML = `
        <div class="w-full h-full bg-gradient-to-br ${gradient} p-4 sm:p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <!-- Decoração de fundo -->
            <div class="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 sm:-mr-24 sm:-mt-24 md:-mr-32 md:-mt-32"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white opacity-10 rounded-full -ml-12 -mb-12 sm:-ml-18 sm:-mb-18 md:-ml-24 md:-mb-24"></div>
            
            <!-- Conteúdo -->
            <div class="relative z-10">
                <div class="mb-3 sm:mb-4 md:mb-6">
                    <div class="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 opacity-90">${typeText}</div>
                    <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">${title.length > 40 ? title.substring(0, 37) + '...' : title}</h1>
                    <p class="text-sm sm:text-base md:text-lg opacity-90 mb-3 sm:mb-4 md:mb-6 line-clamp-2">${description}</p>
                    <div class="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">
                        R$ ${parseFloat(value).toFixed(2).replace('.', ',')}
                        ${type === 'monthly' ? '<span class="text-lg sm:text-xl md:text-2xl">/mês</span>' : ''}
                    </div>
                </div>
            </div>
            
            <!-- QR Code e CTA -->
            <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-4">
                <div class="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-2xl">
                    ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" class="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32" alt="QR Code" />` : '<div class="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">Carregando...</div>'}
                    <p class="text-center text-xs text-gray-800 mt-1 sm:mt-2 font-semibold">Escaneie aqui</p>
                </div>
                <div class="text-center sm:text-right">
                    <button class="bg-white text-${color}-600 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-2xl hover:scale-105 transition transform whitespace-nowrap">
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

// Copiar link do banner para postagem
async function copyBannerLink() {
    // Gerar links (banner e cadastro)
    generateBannerLink();
    
    // Pegar link do banner (não o de cadastro)
    const bannerLink = currentBannerLink;
    
    if (!bannerLink) {
        alert('❌ Erro ao gerar link do banner');
        return;
    }
    
    // Copiar link de pagamento para área de transferência
    navigator.clipboard.writeText(bannerLink).then(() => {
        alert('✅ Link de Pagamento copiado!\n\n' + bannerLink + '\n\n📱 Compartilhe este link:\n- Cole nas redes sociais\n- Envie por WhatsApp\n- Compartilhe por email\n\n💡 Cliente preenche dados e gera PIX para pagamento automático');
    }).catch(() => {
        // Fallback para navegadores antigos
        const input = document.createElement('input');
        input.value = bannerLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Link de Pagamento copiado!\n\n' + bannerLink);
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
