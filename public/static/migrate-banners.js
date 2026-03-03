// Script para migrar banners antigos do localStorage para o servidor

async function migrateOldBanners() {
    console.log('🔄 Iniciando migração de banners antigos...');
    
    let totalMigrated = 0;
    let totalFailed = 0;
    
    // Buscar todas as chaves de banners no localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('banners_')) {
            const accountId = key.replace('banners_', '');
            console.log(`\n📁 Processando conta: ${accountId}`);
            
            try {
                const data = localStorage.getItem(key);
                const banners = JSON.parse(data);
                
                console.log(`   Encontrados ${banners.length} banner(s)`);
                
                for (const banner of banners) {
                    try {
                        console.log(`   ⏳ Migrando banner ${banner.id}...`);
                        
                        const response = await axios.post('/api/banners', {
                            accountId: accountId,
                            linkUrl: banner.linkUrl,
                            qrCodeBase64: banner.qrCodeBase64,
                            bannerImageBase64: banner.bannerImageBase64 ||banner.bannerImage || banner.imageUrl,
                            title: banner.title,
                            description: banner.description,
                            value: banner.value,
                            promo: banner.promo,
                            buttonText: banner.buttonText,
                            color: banner.color,
                            chargeType: banner.chargeType,
                            isCustomBanner: banner.isCustomBanner || false
                        });
                        
                        if (response.data.ok) {
                            console.log(`   ✅ Banner migrado! Novo ID: ${response.data.bannerId}`);
                            // Atualizar ID do banner
                            banner.id = response.data.bannerId;
                            totalMigrated++;
                        } else {
                            console.error(`   ❌ Falha ao migrar banner:`, response.data);
                            totalFailed++;
                        }
                    } catch (error) {
                        console.error(`   ❌ Erro ao migrar banner ${banner.id}:`, error.message);
                        totalFailed++;
                    }
                }
                
                // Salvar banners atualizados
                localStorage.setItem(key, JSON.stringify(banners));
                
            } catch (error) {
                console.error(`❌ Erro ao processar conta ${accountId}:`, error.message);
            }
        }
    }
    
    console.log(`\n✅ Migração concluída!`);
    console.log(`   📊 Total migrados: ${totalMigrated}`);
    console.log(`   ❌ Total com falha: ${totalFailed}`);
    
    if (totalMigrated > 0) {
        alert(`✅ Migração concluída!\n\n${totalMigrated} banner(s) migrado(s) com sucesso!\n\nAgora os links públicos devem funcionar.`);
    } else {
        alert(`⚠️ Nenhum banner foi migrado.\n\nVerifique o console para mais detalhes.`);
    }
}

// Executar migração
console.log('🔧 Script de migração carregado.');
console.log('📝 Para iniciar a migração, execute: migrateOldBanners()');
