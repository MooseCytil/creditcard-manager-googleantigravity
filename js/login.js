/**
 * login.js - 信用卡管家登录页面交互逻辑
 */

// ========================
// DOM 引用
// ========================
const loginForm     = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const clearUsername = document.getElementById('clear-username');
const togglePass    = document.getElementById('toggle-password');
const eyeIcon       = document.getElementById('eye-icon');
const btnLogin      = document.getElementById('btn-login');
const btnGuest      = document.getElementById('btn-guest');
const toastContainer = document.getElementById('toast-container');

// ========================
// 表单验证
// ========================
const rules = {
    username: {
        validate: (v) => v.trim().length >= 2,
        message: '⚠ 请输入至少 2 个字符的账号',
    },
    password: {
        validate: (v) => v.length >= 6,
        message: '⚠ 密码至少需要 6 位字符',
    },
};

function setFieldState(fieldId, state, message = '') {
    const field   = document.getElementById('field-' + fieldId);
    const errorEl = document.getElementById('error-' + fieldId);

    field.classList.remove('has-error', 'is-valid');
    errorEl.classList.remove('visible');
    errorEl.textContent = '';

    if (state === 'error') {
        field.classList.add('has-error');
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    } else if (state === 'valid') {
        field.classList.add('is-valid');
    }
}

function validateField(id, value) {
    const rule = rules[id];
    if (!value.trim()) {
        setFieldState(id, 'error', `⚠ 请输入${id === 'username' ? '账号' : '密码'}`);
        return false;
    }
    if (!rule.validate(value)) {
        setFieldState(id, 'error', rule.message);
        return false;
    }
    setFieldState(id, 'valid');
    return true;
}

// 实时验证（失焦时）
usernameInput.addEventListener('blur', () => {
    if (usernameInput.value) validateField('username', usernameInput.value);
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value) validateField('password', passwordInput.value);
});

// 输入时重置错误状态
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
        const id = input.id;
        const field = document.getElementById('field-' + id);
        if (field.classList.contains('has-error')) {
            setFieldState(id, '');
        }
    });
});

// ========================
// 清除按钮
// ========================
usernameInput.addEventListener('input', () => {
    clearUsername.classList.toggle('visible', usernameInput.value.length > 0);
});

clearUsername.addEventListener('click', () => {
    usernameInput.value = '';
    clearUsername.classList.remove('visible');
    setFieldState('username', '');
    usernameInput.focus();
});

// ========================
// 密码显示/隐藏
// ========================
let passwordVisible = false;

togglePass.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    eyeIcon.textContent = passwordVisible ? '🙈' : '👁️';
    togglePass.title = passwordVisible ? '隐藏密码' : '显示密码';
});

// ========================
// 模拟登录逻辑
// ========================
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function setLoading(loading) {
    if (loading) {
        btnLogin.classList.add('loading');
        btnLogin.disabled = true;
    } else {
        btnLogin.classList.remove('loading');
        btnLogin.disabled = false;
    }
}

// 模拟登录请求
async function doLogin(username, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟：账号 admin / 密码 123456 登录成功
            if (username === 'admin' && password === '123456') {
                resolve({ success: true });
            } else {
                resolve({ success: false, message: '账号或密码错误，请重试' });
            }
        }, 1600);
    });
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    const validUser = validateField('username', username);
    const validPass = validateField('password', password);

    if (!validUser || !validPass) return;

    setLoading(true);

    try {
        const result = await doLogin(username.trim(), password);
        if (result.success) {
            showToast('success', '登录成功！正在跳转...');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 1200);
        } else {
            setLoading(false);
            showToast('error', result.message);
            setFieldState('password', 'error', '⚠ ' + result.message);
            passwordInput.focus();
        }
    } catch (err) {
        setLoading(false);
        showToast('error', '网络异常，请稍后重试');
    }
});

// ========================
// 访客模式
// ========================
btnGuest.addEventListener('click', () => {
    showToast('success', '正在以访客身份进入...');
    setTimeout(() => {
        window.location.href = './index.html';
    }, 1000);
});

// ========================
// 忘记密码 & 注册（占位交互）
// ========================
document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('error', '请联系管理员重置密码');
});

document.getElementById('register-link').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('error', '注册功能暂未开放，敬请期待');
});

// ========================
// 键盘快捷键：Enter 提交
// ========================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btnLogin.disabled) {
        loginForm.requestSubmit();
    }
});

// ========================
// 滚动视差与 3D 旋转动画
// ========================
const heroTrack = document.getElementById('hero-scroll-track');
const scrollRotator = document.getElementById('scroll-rotator');

if (heroTrack && scrollRotator) {
    window.addEventListener('scroll', () => {
        // 计算 hero-section 在视口内的滚动进度
        const rect = heroTrack.getBoundingClientRect();
        // rect.top 是 hero-section 顶部距离视口顶部的距离
        // 我们想知道从它刚固定（或页面开始），到它滚动到底部的进度
        // 总可滚动距离 = heroTrack高度 - 视口高度（考虑 nav 或者直接用 window.innerHeight）
        const maxScroll = heroTrack.offsetHeight - window.innerHeight;
        
        let progress = 0;
        
        // 当向上滚动，rect.top 变负
        if (rect.top <= 0) {
            progress = Math.abs(rect.top) / maxScroll;
            if (progress > 1) progress = 1;
        }

        // 起始状态：斜侧面
        const startRotateX = 25;
        const startRotateY = -35;
        const startScale = 0.9;

        // 终点状态：正视面
        const endRotateX = 0;
        const endRotateY = 0;
        const endScale = 1;

        // 计算当前值
        const currentRotateX = startRotateX + (endRotateX - startRotateX) * progress;
        const currentRotateY = startRotateY + (endRotateY - startRotateY) * progress;
        const currentScale   = startScale + (endScale - startScale) * progress;

        // 应用
        scrollRotator.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${currentScale})`;
    });
}

