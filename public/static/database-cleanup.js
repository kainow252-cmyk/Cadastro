// ============================================
// SISTEMA DE LIMPEZA E OTIMIZAÇÃO DO BANCO
// ============================================

// Carregar estatísticas do banco de dados
async function loadDatabaseStats() {
    try {
        const response = await axios.get('/api/admin/database-stats');
        
        if (response.data.ok) {
            const stats = response.data.stats;
            const container = document.getElementById('database-stats');
            
            if (!container) return;
            
            let html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">';
            
            stats.forEach(stat => {
                const icon = getTableIcon(stat.table);
                html += `
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">${icon} ${formatTableName(stat.table)}</p>
                                <p class="text-2xl font-bold text-gray-800">${stat.count || 0}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Executar limpeza do banco de dados
async function runDatabaseCleanup() {
    if (!confirm('🧹 Deseja executar a limpeza do banco de dados?\n\nIsso irá:\n- Mover links expirados para lixeira\n- Deletar webhooks antigos (>90 dias)\n- Deletar conversões antigas (>180 dias)\n- Limpar lixeira (>30 dias)\n- Otimizar banco (VACUUM)')) {
        return;
    }
    
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '🔄 Executando limpeza...';
    
    try {
        const response = await axios.post('/api/admin/cleanup');
        
        if (response.data.ok) {
            const results = response.data.results;
            const summary = response.data.summary;
            
            let message = `✅ Limpeza concluída em ${response.data.execution_time_ms}ms!\n\n`;
            message += `📊 Resultados:\n`;
            message += `• ${summary.expired_links}\n`;
            message += `• ${summary.old_webhooks}\n`;
            message += `• ${summary.old_conversions}\n`;
            message += `• ${summary.old_trash}\n`;
            message += `• ${summary.vacuum}\n`;
            
            alert(message);
            
            // Recarregar estatísticas
            loadDatabaseStats();
            loadCleanupLogs();
        } else {
            alert('❌ Erro: ' + response.data.error);
        }
    } catch (error) {
        console.error('Erro ao executar limpeza:', error);
        alert('❌ Erro ao executar limpeza: ' + (error.response?.data?.error || error.message));
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Carregar logs de limpeza
async function loadCleanupLogs() {
    try {
        const response = await axios.get('/api/admin/cleanup-logs');
        
        if (response.data.ok) {
            const logs = response.data.logs;
            const container = document.getElementById('cleanup-logs');
            
            if (!container) return;
            
            if (logs.length === 0) {
                container.innerHTML = '<p class="text-gray-600">Nenhuma limpeza executada ainda.</p>';
                return;
            }
            
            let html = '<div class="overflow-x-auto"><table class="min-w-full bg-white">';
            html += '<thead class="bg-gray-100"><tr>';
            html += '<th class="px-4 py-2 text-left">Data</th>';
            html += '<th class="px-4 py-2 text-left">Tipo</th>';
            html += '<th class="px-4 py-2 text-right">Deletados</th>';
            html += '<th class="px-4 py-2 text-right">Para Lixeira</th>';
            html += '<th class="px-4 py-2 text-right">Tempo (ms)</th>';
            html += '</tr></thead><tbody>';
            
            logs.forEach(log => {
                const date = new Date(log.executed_at).toLocaleString('pt-BR');
                html += `
                    <tr class="border-t">
                        <td class="px-4 py-2">${date}</td>
                        <td class="px-4 py-2">${formatCleanupType(log.cleanup_type)}</td>
                        <td class="px-4 py-2 text-right">${log.items_deleted}</td>
                        <td class="px-4 py-2 text-right">${log.items_moved_to_trash}</td>
                        <td class="px-4 py-2 text-right">${log.execution_time_ms}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
}

// Carregar conteúdo da lixeira
async function loadTrashBin() {
    try {
        const response = await axios.get('/api/admin/trash');
        
        if (response.data.ok) {
            const items = response.data.items;
            const stats = response.data.stats;
            const container = document.getElementById('trash-bin');
            
            if (!container) return;
            
            if (items.length === 0) {
                container.innerHTML = '<p class="text-gray-600">Lixeira vazia.</p>';
                return;
            }
            
            let html = '<div class="mb-4">';
            html += '<h3 class="text-lg font-semibold mb-2">Estatísticas da Lixeira</h3>';
            html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">';
            
            stats.forEach(stat => {
                html += `
                    <div class="bg-gray-100 p-3 rounded">
                        <p class="text-sm text-gray-600">${formatTableName(stat.original_table)}</p>
                        <p class="text-xl font-bold">${stat.count} itens</p>
                    </div>
                `;
            });
            
            html += '</div></div>';
            
            html += '<div class="overflow-x-auto"><table class="min-w-full bg-white">';
            html += '<thead class="bg-gray-100"><tr>';
            html += '<th class="px-4 py-2 text-left">Tabela Original</th>';
            html += '<th class="px-4 py-2 text-left">ID</th>';
            html += '<th class="px-4 py-2 text-left">Deletado em</th>';
            html += '<th class="px-4 py-2 text-left">Motivo</th>';
            html += '<th class="px-4 py-2 text-center">Ações</th>';
            html += '</tr></thead><tbody>';
            
            items.forEach(item => {
                const date = new Date(item.deleted_at).toLocaleString('pt-BR');
                html += `
                    <tr class="border-t">
                        <td class="px-4 py-2">${formatTableName(item.original_table)}</td>
                        <td class="px-4 py-2 font-mono text-sm">${item.original_id.substring(0, 8)}...</td>
                        <td class="px-4 py-2">${date}</td>
                        <td class="px-4 py-2">${item.deleted_reason || '-'}</td>
                        <td class="px-4 py-2 text-center">
                            <button onclick="restoreFromTrash(${item.id})" 
                                    class="text-blue-600 hover:text-blue-800">
                                🔄 Restaurar
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Erro ao carregar lixeira:', error);
    }
}

// Restaurar item da lixeira
async function restoreFromTrash(trashId) {
    if (!confirm('Deseja restaurar este item?')) {
        return;
    }
    
    try {
        const response = await axios.post(`/api/admin/trash/restore/${trashId}`);
        
        if (response.data.ok) {
            alert('✅ Item restaurado com sucesso!');
            loadTrashBin();
            loadDatabaseStats();
        } else {
            alert('❌ Erro: ' + response.data.error);
        }
    } catch (error) {
        console.error('Erro ao restaurar:', error);
        alert('❌ Erro ao restaurar: ' + (error.response?.data?.error || error.message));
    }
}

// Funções auxiliares
function getTableIcon(tableName) {
    const icons = {
        'signup_links': '🔗',
        'link_conversions': '📊',
        'subscription_signup_links': '💳',
        'subscription_conversions': '✅',
        'webhooks': '🔔',
        'users': '👤',
        'trash_bin': '🗑️',
        'cleanup_logs': '📝',
        'deltapag_subscriptions': '💰'
    };
    return icons[tableName] || '📋';
}

function formatTableName(tableName) {
    const names = {
        'signup_links': 'Links de Cadastro',
        'link_conversions': 'Conversões de Links',
        'subscription_signup_links': 'Links de Assinatura',
        'subscription_conversions': 'Conversões de Assinatura',
        'webhooks': 'Webhooks',
        'users': 'Usuários',
        'trash_bin': 'Lixeira',
        'cleanup_logs': 'Logs de Limpeza',
        'deltapag_subscriptions': 'Assinaturas DeltaPag'
    };
    return names[tableName] || tableName;
}

function formatCleanupType(type) {
    const types = {
        'manual_cleanup': '🧹 Limpeza Manual',
        'auto_cleanup': '⚙️ Limpeza Automática',
        'scheduled_cleanup': '⏰ Limpeza Agendada'
    };
    return types[type] || type;
}

console.log('✅ Sistema de limpeza carregado');
