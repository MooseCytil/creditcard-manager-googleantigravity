/**
 * 主应用逻辑
 */
class App {
    constructor() {
        this.currentView = 'dashboard';
        this.deleteCallback = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDashboard();
        this.updateFilters(); // 初始化筛选器和表单选项
        this.setDefaultDate();

        // Bind dashboard total expense click
        this.bindDashboardClicks();
    }

    bindEvents() {
        // 导航点击
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(item.dataset.view);
            });
        });

        // 添加信用卡按钮
        document.getElementById('add-card-btn')?.addEventListener('click', () => this.openCardModal());

        // 添加消费记录按钮
        document.getElementById('add-expense-btn')?.addEventListener('click', () => this.openExpenseModal());
        document.getElementById('add-expense-empty-btn')?.addEventListener('click', () => this.openExpenseModal());

        // 信用卡表单
        document.getElementById('card-form')?.addEventListener('submit', (e) => this.handleCardSubmit(e));
        document.getElementById('card-modal-close')?.addEventListener('click', () => this.closeCardModal());
        document.getElementById('card-cancel-btn')?.addEventListener('click', () => this.closeCardModal());
        document.querySelector('#card-modal .modal-overlay')?.addEventListener('click', () => this.closeCardModal());

        // 消费记录表单
        document.getElementById('expense-form')?.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        document.getElementById('expense-modal-close')?.addEventListener('click', () => this.closeExpenseModal());
        document.getElementById('expense-cancel-btn')?.addEventListener('click', () => this.closeExpenseModal());
        document.querySelector('#expense-modal .modal-overlay')?.addEventListener('click', () => this.closeExpenseModal());

        // 删除确认框
        document.getElementById('delete-modal-close')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('delete-cancel-btn')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('delete-confirm-btn')?.addEventListener('click', () => this.handleDeleteConfirm());
        document.querySelector('#delete-modal .modal-overlay')?.addEventListener('click', () => this.closeDeleteModal());

        // 筛选器
        document.getElementById('filter-card')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-category')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-date-start')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-date-end')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('reset-filters-btn')?.addEventListener('click', () => this.resetFilters());

        // 导出功能事件
        document.getElementById('export-expenses-btn')?.addEventListener('click', () => this.openExportModal());
        document.getElementById('export-modal-close')?.addEventListener('click', () => this.closeExportModal());
        document.querySelector('#export-modal .modal-overlay')?.addEventListener('click', () => this.closeExportModal());
        document.getElementById('export-all-btn')?.addEventListener('click', () => this.handleExport('all'));
        document.getElementById('export-filtered-btn')?.addEventListener('click', () => this.handleExport('filtered'));

        // 类别管理
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => this.openCategoryModal());
        document.getElementById('category-modal-close')?.addEventListener('click', () => this.closeCategoryModal());
        document.querySelector('#category-modal .modal-overlay')?.addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('add-category-btn')?.addEventListener('click', () => this.handleAddCategory());

        // 统计页面筛选器
        document.getElementById('stat-filter-card')?.addEventListener('change', () => this.updateStatisticsView());
        document.getElementById('stat-filter-category')?.addEventListener('change', () => this.updateStatisticsView());
    }

    bindDashboardClicks() {
        // Click total expense card to view statistics
        const totalExpenseCard = document.querySelectorAll('.stat-card')[3]; // 4th stat card
        if (totalExpenseCard) {
            totalExpenseCard.style.cursor = 'pointer';
            totalExpenseCard.addEventListener('click', () => {
                this.switchView('statistics');
            });
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === viewName + '-view');
        });

        if (viewName === 'dashboard') this.updateDashboard();
        else if (viewName === 'cards') this.updateCardsView();
        else if (viewName === 'expenses') this.updateExpensesView();
        else if (viewName === 'statistics') this.updateStatisticsView();
    }

    updateDashboard() {
        document.getElementById('total-cards').textContent = window.cardManager.getAllCards().length;
        document.getElementById('total-limit').textContent = '¥' + new Intl.NumberFormat('zh-CN').format(window.cardManager.getTotalLimit());
        document.getElementById('month-expense').textContent = '¥' + new Intl.NumberFormat('zh-CN').format(window.expenseManager.getMonthExpenses());
        document.getElementById('total-expense').textContent = '¥' + new Intl.NumberFormat('zh-CN').format(window.expenseManager.getTotalExpenses());
        window.cardManager.renderDashboardCards('dashboard-cards-list');
        window.expenseManager.renderRecentExpenses('recent-expenses-list');
    }

    updateCardsView() {
        window.cardManager.renderCards('cards-list');
    }

    updateExpensesView() {
        this.updateFilters();
        this.applyFilters();
    }

    updateFilters() {
        // 更新信用卡选项
        const select = document.getElementById('filter-card');
        const statSelect = document.getElementById('stat-filter-card');
        const expenseSelect = document.getElementById('expense-card');
        const options = window.cardManager.getCardOptions();
        const optionsHtml = '<option value="">全部</option>' + options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        const expenseOptionsHtml = '<option value="">请选择信用卡</option>' + options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        if (select) select.innerHTML = optionsHtml;
        if (statSelect) statSelect.innerHTML = optionsHtml;
        if (expenseSelect) expenseSelect.innerHTML = expenseOptionsHtml;

        // 更新类别选项
        const catSelect = document.getElementById('filter-category');
        const statCatSelect = document.getElementById('stat-filter-category');
        const expCatSelect = document.getElementById('expense-category');
        const categories = window.categoryManager.getAllCategories();
        const catOptions = ['<option value="">全部</option>', ...categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`)].join('');
        const expCatOptions = ['<option value="">请选择类别</option>', ...categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`)].join('');

        if (catSelect) catSelect.innerHTML = catOptions;
        if (statCatSelect) statCatSelect.innerHTML = catOptions;
        if (expCatSelect) expCatSelect.innerHTML = expCatOptions;
    }

    applyFilters() {
        const cardId = document.getElementById('filter-card')?.value || '';
        const category = document.getElementById('filter-category')?.value || '';
        const startDate = document.getElementById('filter-date-start')?.value || '';
        const endDate = document.getElementById('filter-date-end')?.value || '';
        window.expenseManager.renderExpenses('expenses-table-body', cardId, category, startDate, endDate);
    }

    openExportModal() {
        document.getElementById('export-modal')?.classList.add('active');
    }

    closeExportModal() {
        document.getElementById('export-modal')?.classList.remove('active');
    }

    handleExport(type) {
        const filters = {
            cardId: document.getElementById('filter-card')?.value || '',
            category: document.getElementById('filter-category')?.value || '',
            startDate: document.getElementById('filter-date-start')?.value || '',
            endDate: document.getElementById('filter-date-end')?.value || ''
        };

        const success = window.expenseManager.exportData(type, filters);

        if (success) {
            this.showToast('导出成功！正在下载文件...', 'success');
            this.closeExportModal();
        } else {
            this.showToast('导出失败：没有可导出的数据', 'error');
        }
    }

    resetFilters() {
        document.getElementById('filter-card').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-date-start').value = '';
        document.getElementById('filter-date-end').value = '';
        this.applyFilters();
        this.showToast('筛选条件已重置', 'success');
    }

    setDefaultDate() {
        const dateInput = document.getElementById('expense-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    }

    // 信用卡相关
    openCardModal(card = null) {
        const modal = document.getElementById('card-modal');
        const title = document.getElementById('card-modal-title');
        const form = document.getElementById('card-form');
        form.reset();

        if (card) {
            title.textContent = '编辑信用卡';
            document.getElementById('card-id').value = card.id;
            document.getElementById('card-bank').value = card.bank;
            document.getElementById('card-name').value = card.name || '';
            document.getElementById('card-last4').value = card.last4;
            document.getElementById('card-bill-day').value = card.billDay;
            document.getElementById('card-due-day').value = card.dueDay;
            document.getElementById('card-limit').value = card.limit;
            document.querySelector(`input[name="card-color"][value="${card.color}"]`).checked = true;
        } else {
            title.textContent = '添加信用卡';
            document.getElementById('card-id').value = '';
        }
        modal.classList.add('active');
    }

    closeCardModal() {
        document.getElementById('card-modal').classList.remove('active');
    }

    handleCardSubmit(e) {
        e.preventDefault();
        try {
            const id = document.getElementById('card-id').value;
            const data = {
                bank: document.getElementById('card-bank').value,
                name: document.getElementById('card-name').value,
                last4: document.getElementById('card-last4').value,
                billDay: document.getElementById('card-bill-day').value,
                dueDay: document.getElementById('card-due-day').value,
                limit: document.getElementById('card-limit').value,
                color: document.querySelector('input[name="card-color"]:checked').value
            };

            if (id) {
                window.cardManager.updateCard(id, data);
                this.showToast('信用卡更新成功', 'success');
            } else {
                window.cardManager.addCard(data);
                this.showToast('信用卡添加成功', 'success');
            }
            this.closeCardModal();
            this.updateCardsView();
            this.updateDashboard();
        } catch (error) {
            console.error('Save card error:', error);
            this.showToast('保存失败: ' + error.message, 'error');
        }
    }

    editCard(id) {
        const card = window.cardManager.getCardById(id);
        if (card) this.openCardModal(card);
    }

    confirmDeleteCard(id) {
        this.deleteCallback = () => {
            try {
                window.cardManager.deleteCard(id);
                this.showToast('信用卡已删除', 'success');
                this.updateCardsView();
                this.updateDashboard();
            } catch (error) {
                console.error('Delete card error:', error);
                this.showToast('删除失败', 'error');
            }
        };
        document.getElementById('delete-message').textContent = '确定要删除这张信用卡吗？相关消费记录不会被删除。';
        document.getElementById('delete-modal').classList.add('active');
    }

    // 消费记录相关
    openExpenseModal(expense = null) {
        this.updateFilters();
        const modal = document.getElementById('expense-modal');
        const title = document.getElementById('expense-modal-title');
        const form = document.getElementById('expense-form');
        form.reset();
        this.setDefaultDate();

        if (expense) {
            title.textContent = '编辑消费记录';
            document.getElementById('expense-id').value = expense.id;
            document.getElementById('expense-card').value = expense.cardId;
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-merchant').value = expense.merchant;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-date').value = expense.date;
            document.getElementById('expense-note').value = expense.note || '';
        } else {
            title.textContent = '添加消费记录';
            document.getElementById('expense-id').value = '';
        }
        modal.classList.add('active');
    }

    closeExpenseModal() {
        document.getElementById('expense-modal').classList.remove('active');
    }

    handleExpenseSubmit(e) {
        e.preventDefault();
        try {
            const id = document.getElementById('expense-id').value;
            const data = {
                cardId: document.getElementById('expense-card').value,
                amount: document.getElementById('expense-amount').value,
                merchant: document.getElementById('expense-merchant').value,
                category: document.getElementById('expense-category').value,
                date: document.getElementById('expense-date').value,
                note: document.getElementById('expense-note').value
            };

            if (id) {
                window.expenseManager.updateExpense(id, data);
                this.showToast('消费记录更新成功', 'success');
            } else {
                window.expenseManager.addExpense(data);
                this.showToast('消费记录添加成功', 'success');
            }
            this.closeExpenseModal();
            this.applyFilters();
            this.updateDashboard();
        } catch (error) {
            console.error('Save expense error:', error);
            this.showToast('保存失败: ' + error.message, 'error');
        }
    }

    editExpense(id) {
        const expense = window.expenseManager.getExpenseById(id);
        if (expense) this.openExpenseModal(expense);
    }

    confirmDeleteExpense(id) {
        this.deleteCallback = () => {
            try {
                window.expenseManager.deleteExpense(id);
                this.showToast('消费记录已删除', 'success');
                this.applyFilters();
                this.updateDashboard();
            } catch (error) {
                console.error('Delete expense error:', error);
                this.showToast('删除失败', 'error');
            }
        };
        document.getElementById('delete-message').textContent = '确定要删除这条消费记录吗？此操作不可恢复。';
        document.getElementById('delete-modal').classList.add('active');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.remove('active');
        this.deleteCallback = null;
    }

    handleDeleteConfirm() {
        if (this.deleteCallback) {
            this.deleteCallback();
            this.closeDeleteModal();
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const icons = { success: '✅', error: '❌', warning: '⚠️' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // 类别管理相关
    openCategoryModal() {
        const modal = document.getElementById('category-modal');
        this.renderCategoryList();
        modal.classList.add('active');
    }

    closeCategoryModal() {
        document.getElementById('category-modal').classList.remove('active');
    }

    renderCategoryList() {
        const list = document.getElementById('category-list');
        const categories = window.categoryManager.getAllCategories();

        list.innerHTML = categories.map(cat => `
            <div class="category-item">
                <div class="category-info">
                    <span class="category-icon">${cat.icon}</span>
                    <span class="category-name">${cat.name}</span>
                </div>
                <button class="action-btn delete" onclick="app.deleteCategory('${cat.id}')" title="删除">🗑️</button>
            </div>
        `).join('');
    }

    handleAddCategory() {
        const input = document.getElementById('new-category-name');
        const name = input.value.trim();

        if (!name) {
            this.showToast('请输入类别名称', 'warning');
            return;
        }

        categoryManager.addCategory(name);
        input.value = '';
        this.renderCategoryList();
        this.updateFilters(); // 更新全局下拉框
        this.showToast('类别添加成功');
    }

    deleteCategory(id) {
        if (cardManager.getAllCards().length === 0 && false) { } // dummy check

        if (confirm('确定要删除这个类别吗？')) {
            if (categoryManager.deleteCategory(id)) {
                this.renderCategoryList();
                this.updateFilters();
                this.showToast('类别已删除');
            } else {
                this.showToast('删除失败', 'error');
            }
        }
    }

    // Statistics view
    updateStatisticsView() {
        if (window.statisticsManager) {
            // 保存当前筛选值
            const cardId = document.getElementById('stat-filter-card')?.value || '';
            const category = document.getElementById('stat-filter-category')?.value || '';

            // 更新筛选器选项
            this.updateFilters();

            // 恢复筛选值
            const statCardSelect = document.getElementById('stat-filter-card');
            const statCatSelect = document.getElementById('stat-filter-category');
            if (statCardSelect) statCardSelect.value = cardId;
            if (statCatSelect) statCatSelect.value = category;

            // 渲染图表
            window.statisticsManager.renderAllCharts(cardId, category);
        }
    }
}

// 初始化应用
// 初始化应用
window.app = new App();
