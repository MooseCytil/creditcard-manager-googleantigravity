/**
 * 消费类别管理模块
 */
class CategoryManager {
    constructor() {
        this.storageKey = 'expenseCategories';
        this.defaultCategories = [
            { id: 'cat_food', name: '餐饮', icon: '🍔' },
            { id: 'cat_shopping', name: '购物', icon: '🛍️' },
            { id: 'cat_transport', name: '交通', icon: '🚗' },
            { id: 'cat_entertainment', name: '娱乐', icon: '🎮' },
            { id: 'cat_medical', name: '医疗', icon: '🏥' },
            { id: 'cat_education', name: '教育', icon: '📚' },
            { id: 'cat_other', name: '其他', icon: '📦' }
        ];
        this.categories = this.loadCategories();
    }

    loadCategories() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [...this.defaultCategories];
    }

    saveCategories() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
    }

    getAllCategories() {
        return this.categories;
    }

    addCategory(name, icon = '🏷️') {
        const category = {
            id: 'cat_' + Date.now(),
            name: name,
            icon: icon
        };
        this.categories.push(category);
        this.saveCategories();
        return category;
    }

    deleteCategory(id) {
        // Prevent deleting last remaining category if needed, but for now just allow
        const index = this.categories.findIndex(c => c.id === id);
        if (index === -1) return false;

        this.categories.splice(index, 1);
        this.saveCategories();
        return true;
    }

    resetDefaults() {
        this.categories = [...this.defaultCategories];
        this.saveCategories();
        return this.categories;
    }
}

window.categoryManager = new CategoryManager();
