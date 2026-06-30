/**
 * UI module for DOM mutations and rendering - Hyper Premium Version
 */
import { formatDate, escapeHTML, getLanguageColor } from './utils.js';

const statusContainer = document.getElementById('status-container');
const contentContainer = document.getElementById('content');
const profileContainer = document.getElementById('profile-container');
const reposContainer = document.getElementById('repos-container');
const reposCountBadge = document.getElementById('repos-count');
const paginationNotice = document.getElementById('pagination-notice');

/**
 * Re-initializes Lucide icons for dynamic content
 */
function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Shows a loading spinner with hyper-styling
 */
export function showLoading() {
    contentContainer.classList.add('hidden');
    statusContainer.innerHTML = `
        <div class="status-msg reveal-text">
            <div class="spinner"></div>
            <p style="font-weight: 700; font-size: 1.25rem; color: var(--primary);">Synchronizing with GitHub...</p>
        </div>
    `;
}

/**
 * Shows a hyper error message
 * @param {string} message 
 */
export function showError(message) {
    contentContainer.classList.add('hidden');
    statusContainer.innerHTML = `
        <div class="status-msg reveal-text" style="background: rgba(244, 63, 94, 0.05); border: 2px solid rgba(244, 63, 94, 0.1); border-radius: 32px; padding: 4rem;">
            <i data-lucide="alert-octagon" style="color: var(--rose); width: 48px; height: 48px; margin-bottom: 1rem;"></i>
            <h2 style="font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">System Error</h2>
            <p style="color: var(--rose); font-weight: 600;">${escapeHTML(message)}</p>
        </div>
    `;
    refreshIcons();
}

/**
 * Renders the user profile with hyper layout
 * @param {Object} user 
 */
export function renderProfile(user) {
    profileContainer.innerHTML = `
        <div class="profile-header">
            <div style="position: relative; display: inline-block;">
                <img src="${user.avatar_url}" alt="${escapeHTML(user.name || user.login)}" class="avatar-hyper">
                <div class="mini-3d-scene profile-cube" style="position: absolute; bottom: 8px; right: -8px; z-index: 10;">
                    <div class="mini-cube">
                        <div class="m-face m-front"></div>
                        <div class="m-face m-back"></div>
                        <div class="m-face m-right"></div>
                        <div class="m-face m-left"></div>
                        <div class="m-face m-top"></div>
                        <div class="m-face m-bottom"></div>
                    </div>
                </div>
            </div>
            <h1 class="profile-name">${escapeHTML(user.name || user.login)}</h1>
            <a href="${user.html_url}" target="_blank" class="profile-username">@${escapeHTML(user.login)}</a>
            ${user.bio ? `<p class="profile-bio" style="margin-top: 1.5rem; color: var(--text-muted); font-size: 1.1rem; font-weight: 400;">${escapeHTML(user.bio)}</p>` : ''}
        </div>
        <div class="profile-stats">
            <div class="stat-item">
                <span class="stat-value text-gradient">${user.followers}</span>
                <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
                <span class="stat-value text-gradient">${user.following}</span>
                <span class="stat-label">Following</span>
            </div>
            <div class="stat-item">
                <span class="stat-value text-gradient">${user.public_repos}</span>
                <span class="stat-label">Repos</span>
            </div>
        </div>
        <div class="profile-info" style="display: flex; flex-direction: column; gap: 12px; color: var(--text-muted); font-weight: 600;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i data-lucide="calendar" size="18"></i> <span>Joined ${formatDate(user.created_at)}</span>
            </div>
            ${user.location ? `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="map-pin" size="18"></i> <span>${escapeHTML(user.location)}</span>
                </div>
            ` : ''}
        </div>
    `;
    refreshIcons();
}

/**
 * Renders the repository list with hyper cards
 * @param {Array} repos 
 */
export function renderRepos(repos) {
    statusContainer.innerHTML = '';
    contentContainer.classList.remove('hidden');
    
    reposCountBadge.textContent = repos.length;
    reposContainer.innerHTML = '';
    
    if (repos.length >= 100) {
        paginationNotice.classList.remove('hidden');
    } else {
        paginationNotice.classList.add('hidden');
    }

    const fragment = document.createDocumentFragment();

    repos.forEach((repo, index) => {
        const card = document.createElement('div');
        card.className = 'card-hyper repo-card-hyper';
        card.style.setProperty('--stagger-idx', index);
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <i data-lucide="book-marked" style="color: var(--primary);"></i>
                <div style="display: flex; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">
                        <i data-lucide="star" size="14"></i> ${repo.stargazers_count}
                    </div>
                </div>
            </div>
            <a href="${repo.html_url}" target="_blank" class="repo-name">${escapeHTML(repo.name)}</a>
            <p class="repo-desc">${escapeHTML(repo.description) || 'An elite repository awaiting its description.'}</p>
            <div class="repo-footer">
                ${repo.language ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: ${getLanguageColor(repo.language)}; border: 2px solid white; box-shadow: 0 0 0 1px var(--border);"></span>
                        <span>${escapeHTML(repo.language)}</span>
                    </div>
                ` : ''}
                <div style="margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-dim);">
                    <i data-lucide="git-fork" size="14"></i> ${repo.forks_count}
                </div>
            </div>
        `;
        
        fragment.appendChild(card);
    });

    reposContainer.appendChild(fragment);
    refreshIcons();
}

/**
 * Renders the chart legend with hyper styling
 * @param {Array} stats 
 */
export function renderLegend(stats) {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    
    stats.forEach(stat => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '12px';
        item.style.fontSize = '1rem';
        item.style.fontWeight = '700';
        item.style.color = 'var(--text-main)';
        item.style.padding = '8px 0';
        
        item.innerHTML = `
            <span style="width: 14px; height: 14px; border-radius: 6px; background: ${getLanguageColor(stat.label)}; box-shadow: 0 4px 10px -2px ${getLanguageColor(stat.label)};"></span>
            <span style="flex: 1;">${escapeHTML(stat.label)}</span>
            <span style="color: var(--primary); font-weight: 800;">${Math.round(stat.value)}%</span>
        `;
        legendContainer.appendChild(item);
    });
}
