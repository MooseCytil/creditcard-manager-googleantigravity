/**
 * 消费记录管理模块
 */
class ExpenseManager {
    constructor() {
        this.storageKey = 'expenses';
        this.expenses = this.loadExpenses();
    }

    loadExpenses() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    saveExpenses() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.expenses));
    }

    getAllExpenses() {
        return this.expenses;
    }

    getExpenseById(id) {
        return this.expenses.find(e => e.id === id);
    }

    addExpense(data) {
        const expense = {
            id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            cardId: data.cardId,
            amount: parseFloat(data.amount),
            merchant: data.merchant,
            category: data.category,
            date: data.date,
            note: data.note || '',
            createdAt: new Date().toISOString()
        };
        this.expenses.push(expense);
        this.saveExpenses();
        return expense;
    }

    updateExpense(id, data) {
        const index = this.expenses.findIndex(e => e.id === id);
        if (index === -1) return null;
        const updatedData = { ...data };
        if (updatedData.amount) updatedData.amount = parseFloat(updatedData.amount);
        this.expenses[index] = { ...this.expenses[index], ...updatedData, updatedAt: new Date().toISOString() };
        this.saveExpenses();
        return this.expenses[index];
    }

    deleteExpense(id) {
        const index = this.expenses.findIndex(e => e.id === id);
        if (index === -1) return false;
        this.expenses.splice(index, 1);
        this.saveExpenses();
        return true;
    }

    getFilteredExpenses(cardId = '', category = '', startDate = '', endDate = '') {
        return this.expenses.filter(e => {
            if (cardId && e.cardId !== cardId) return false;
            if (category && e.category !== category) return false;
            if (startDate && e.date < startDate) return false;
            if (endDate && e.date > endDate) return false;
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getMonthExpenses() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        return this.expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === month;
        }).reduce((sum, e) => sum + e.amount, 0);
    }

    getTotalExpenses() {
        return this.expenses.reduce((sum, e) => sum + e.amount, 0);
    }

    getRecentExpenses(count = 5) {
        return [...this.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, count);
    }

    renderExpenses(tableBodyId, cardId = '', category = '', startDate = '', endDate = '') {
        const tbody = document.getElementById(tableBodyId);
        const emptyEl = document.getElementById('expenses-empty');
        if (!tbody) return;
        const filtered = this.getFilteredExpenses(cardId, category, startDate, endDate);

        document.getElementById('filtered-total').textContent = '¥' + new Intl.NumberFormat('zh-CN').format(filtered.reduce((s, e) => s + e.amount, 0));
        document.getElementById('filtered-count').textContent = filtered.length + '条';

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
        tbody.innerHTML = filtered.map(e => {
            const card = cardManager.getCardById(e.cardId);
            const cardName = card ? `${card.bank} (**** ${card.last4})` : '未知卡片';
            return `<tr><td>${e.date}</td><td>${esc(cardName)}</td><td>${esc(e.merchant)}</td><td><span class="category-badge">${e.category}</span></td><td class="amount">-¥${new Intl.NumberFormat('zh-CN').format(e.amount)}</td><td>${esc(e.note || '-')}</td><td><div class="action-btns"><button class="action-btn" onclick="app.editExpense('${e.id}')" title="编辑">✏️</button><button class="action-btn delete" onclick="app.confirmDeleteExpense('${e.id}')" title="删除">🗑️</button></div></td></tr>`;
        }).join('');
    }

    renderRecentExpenses(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const recent = this.getRecentExpenses();
        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无消费记录</p>';
            return;
        }
        const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
        container.innerHTML = recent.map(e => `<div class="recent-expense-item"><div class="expense-info"><span class="expense-merchant">${esc(e.merchant)}</span><span class="expense-date">${e.date}</span></div><span class="expense-amount">-¥${new Intl.NumberFormat('zh-CN').format(e.amount)}</span></div>`).join('');
    }

    exportData(type, filters = {}) {
        let dataToExport = [];

        if (type === 'all') {
            dataToExport = this.getAllExpenses();
        } else {
            const { cardId, category, startDate, endDate } = filters;
            dataToExport = this.getFilteredExpenses(cardId, category, startDate, endDate);
        }

        if (dataToExport.length === 0) {
            return false;
        }

        // Format data for Excel
        const exportSheet = dataToExport.map(e => {
            const card = window.cardManager.getCardById(e.cardId);
            return {
                '日期': e.date,
                '商户': e.merchant,
                '金额': e.amount,
                '类别': e.category,
                '信用卡': card ? `${card.bank} (${card.last4})` : '未知卡片',
                '备注': e.note || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportSheet);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "消费记录");

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `信用卡消费记录_${dateStr}.xlsx`);
        return true;
    }
}

window.expenseManager = new ExpenseManager();
