/**
 * 统计数据管理模块
 */
class StatisticsManager {
    constructor() {
        this.charts = {};
    }

    /**
     * 按类别统计消费金额
     */
    getExpensesByCategory(cardId = '', category = '') {
        const expenses = window.expenseManager.getFilteredExpenses(cardId, category);
        const stats = {};

        expenses.forEach(expense => {
            const cat = expense.category;
            stats[cat] = (stats[cat] || 0) + parseFloat(expense.amount);
        });

        return stats;
    }

    /**
     * 按信用卡统计消费金额
     */
    getExpensesByCard(cardId = '', category = '') {
        const expenses = window.expenseManager.getFilteredExpenses(cardId, category);
        const stats = {};

        expenses.forEach(expense => {
            const cId = expense.cardId;
            const card = window.cardManager.getCardById(cId);
            const cardName = card ? `${card.bank} ${card.last4}` : '未知卡片';
            stats[cardName] = (stats[cardName] || 0) + parseFloat(expense.amount);
        });

        return stats;
    }

    /**
     * 按月份统计消费（最近N个月）
     */
    getExpensesByMonth(monthCount = 6, cardId = '', category = '') {
        const expenses = window.expenseManager.getFilteredExpenses(cardId, category);
        const stats = {};
        const months = [];

        // 生成最近N个月的月份标签
        const now = new Date();
        for (let i = monthCount - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthKey);
            stats[monthKey] = 0;
        }

        // 聚合数据
        expenses.forEach(expense => {
            const monthKey = expense.date.substring(0, 7); // YYYY-MM
            if (stats.hasOwnProperty(monthKey)) {
                stats[monthKey] += parseFloat(expense.amount);
            }
        });

        return { months, stats };
    }

    /**
     * 渲染消费类别饼图
     */
    renderCategoryPieChart(cardId = '', category = '') {
        const canvasId = 'categoryPieChart';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // 销毁旧图表
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const data = this.getExpensesByCategory(cardId, category);
        const labels = Object.keys(data);
        const values = Object.values(data);

        if (values.length === 0) {
            // 显示空状态
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '14px Inter';
            ctx.fillStyle = '#6b6b80';
            ctx.textAlign = 'center';
            ctx.fillText('暂无消费数据', canvas.width / 2, canvas.height / 2);
            return;
        }

        // 生成颜色
        const colors = this.generateColors(labels.length);

        this.charts[canvasId] = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#a0a0b0',
                            padding: 15,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ¥${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染信用卡消费柱状图
     */
    renderCardBarChart(cardId = '', category = '') {
        const canvasId = 'cardBarChart';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const data = this.getExpensesByCard(cardId, category);
        const labels = Object.keys(data);
        const values = Object.values(data);

        if (values.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '14px Inter';
            ctx.fillStyle = '#6b6b80';
            ctx.textAlign = 'center';
            ctx.fillText('暂无消费数据', canvas.width / 2, canvas.height / 2);
            return;
        }

        this.charts[canvasId] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '消费金额',
                    data: values,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `消费金额: ¥${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0b0',
                            callback: function (value) {
                                return '¥' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0b0'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染消费趋势折线图
     */
    renderTrendLineChart(cardId = '', category = '') {
        const canvasId = 'trendLineChart';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const { months, stats } = this.getExpensesByMonth(6, cardId, category);
        const values = months.map(month => stats[month]);

        // 格式化月份标签 (YYYY-MM -> MM月)
        const labels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return `${monthNum}月`;
        });

        this.charts[canvasId] = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '月度消费',
                    data: values,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `消费金额: ¥${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0b0',
                            callback: function (value) {
                                return '¥' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0b0'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染所有图表
     */
    renderAllCharts(cardId = '', category = '') {
        this.renderCategoryPieChart(cardId, category);
        this.renderCardBarChart(cardId, category);
        this.renderTrendLineChart(cardId, category);
    }

    /**
     * 销毁所有图表
     */
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    /**
     * 生成颜色数组
     */
    generateColors(count) {
        const baseColors = [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#4facfe',
            '#43e97b',
            '#fa709a',
            '#fee140',
            '#30cfd0'
        ];

        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }
}

// 导出全局实例
window.statisticsManager = new StatisticsManager();
