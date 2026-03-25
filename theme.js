function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeUI(isLight);
}

function updateThemeUI(isLight) {
    const moon = document.getElementById('theme-icon-dark');
    const sun = document.getElementById('theme-icon-light');
    const text = document.getElementById('theme-text');
    
    if (isLight) {
        if (moon) moon.classList.add('hidden');
        if (sun) sun.classList.remove('hidden');
        if (text) text.innerText = 'Modo Claro';
    } else {
        if (moon) moon.classList.remove('hidden');
        if (sun) sun.classList.add('hidden');
        if (text) text.innerText = 'Modo Escuro';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme === 'light';
    if (isLight) document.body.classList.add('light-theme');
    updateThemeUI(isLight);
}

document.addEventListener('DOMContentLoaded', initTheme);
