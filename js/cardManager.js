/**
 * 信用卡管理模块
 */
class CardManager {
    constructor() {
        this.storageKey = 'creditCards';
        this.cards = this.loadCards();
    }

    loadCards() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    saveCards() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cards));
    }

    getAllCards() {
        return this.cards;
    }

    getCardById(id) {
        return this.cards.find(card => card.id === id);
    }

    addCard(cardData) {
        const card = {
            id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            bank: cardData.bank,
            name: cardData.name || '',
            last4: cardData.last4,
            billDay: parseInt(cardData.billDay),
            dueDay: parseInt(cardData.dueDay),
            limit: parseFloat(cardData.limit),
            color: cardData.color || 'blue-purple',
            createdAt: new Date().toISOString()
        };
        this.cards.push(card);
        this.saveCards();
        return card;
    }

    updateCard(id, cardData) {
        const index = this.cards.findIndex(card => card.id === id);
        if (index === -1) return null;
        const updatedData = { ...cardData };
        if (updatedData.limit) updatedData.limit = parseFloat(updatedData.limit);
        if (updatedData.billDay) updatedData.billDay = parseInt(updatedData.billDay);
        if (updatedData.dueDay) updatedData.dueDay = parseInt(updatedData.dueDay);
        this.cards[index] = { ...this.cards[index], ...updatedData, updatedAt: new Date().toISOString() };
        this.saveCards();
        return this.cards[index];
    }

    deleteCard(id) {
        const index = this.cards.findIndex(card => card.id === id);
        if (index === -1) return false;
        this.cards.splice(index, 1);
        this.saveCards();
        return true;
    }

    renderCards(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (this.cards.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">💳</div><p>您还没有添加任何信用卡</p><button class="btn btn-secondary" onclick="app.openCardModal()">添加第一张卡</button></div>`;
            return;
        }
        container.innerHTML = this.cards.map(card => this.renderCardHTML(card)).join('');
    }

    renderCardHTML(card) {
        const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
        return `<div class="credit-card ${card.color}" data-id="${card.id}"><div class="card-actions"><button class="card-action-btn" onclick="app.editCard('${card.id}')" title="编辑">✏️</button><button class="card-action-btn" onclick="app.confirmDeleteCard('${card.id}')" title="删除">🗑️</button></div><div class="card-header"><div><div class="card-bank">${esc(card.bank)}</div>${card.name ? `<div class="card-name">${esc(card.name)}</div>` : ''}</div><div class="card-chip"></div></div><div class="card-number">**** **** **** ${card.last4}</div><div class="card-footer"><div class="card-dates"><div class="card-date-item"><span class="card-date-label">账单日</span><span class="card-date-value">每月${card.billDay}日</span></div><div class="card-date-item"><span class="card-date-label">还款日</span><span class="card-date-value">每月${card.dueDay}日</span></div></div><div class="card-limit"><span class="card-limit-label">信用额度</span><span class="card-limit-value">¥${new Intl.NumberFormat('zh-CN').format(card.limit)}</span></div></div></div>`;
    }

    renderDashboardCards(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (this.cards.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无信用卡，请先添加</p>';
            return;
        }
        const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
        container.innerHTML = this.cards.slice(0, 3).map(card => `<div class="credit-card ${card.color}" style="aspect-ratio: 2.5; padding: 1rem;"><div class="card-header"><div><div class="card-bank" style="font-size: 1rem;">${esc(card.bank)}</div></div><div class="card-chip" style="width: 30px; height: 22px;"></div></div><div class="card-number" style="font-size: 1rem;">**** ${card.last4}</div></div>`).join('');
    }

    getCardOptions() {
        return this.cards.map(card => ({ value: card.id, label: `${card.bank} (**** ${card.last4})` }));
    }

    getTotalLimit() {
        return this.cards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
    }
}

window.cardManager = new CardManager();
