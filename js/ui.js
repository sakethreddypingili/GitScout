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
