/**
 * Main Entry Point - Hyper Premium Version
 */
import { fetchUser, fetchRepos } from './api.js';
import { sortRepositories, calculateLanguageStats } from './utils.js';
import { renderProfile, renderRepos, renderLegend, showLoading, showError } from './ui.js';
import { renderDonutChart } from './chart.js';
import { initGitGraph, implodeNodes, initCardTilt, initDashboardTilt, initAppGitGraph, resetLandingAnimations } from './animations.js';

// --- State Management ---
const state = {
    isLoading: false,
    user: null,
    repos: [],
    currentSort: 'stars',
    langStats: []
};

// --- Selectors ---
const landingView = document.getElementById('landing-view');
const appView = document.getElementById('app-view');
const landingSearchForm = document.getElementById('landing-search-form');
const landingSearchInput = document.getElementById('landing-search-input');
const appSearchForm = document.getElementById('app-search-form');
const appSearchInput = document.getElementById('app-search-input');
const sortSelect = document.getElementById('sort-select');
const backToLanding = document.getElementById('back-to-landing');
const parallaxBg = document.getElementById('parallax-bg');

// --- Caching Logic ---
const CACHE_PREFIX = 'github_explorer_';
const CACHE_EXPIRY = 5 * 60 * 1000;

function getCachedData(username) {
    const cached = sessionStorage.getItem(CACHE_PREFIX + username.toLowerCase());
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) return data;
    }
    return null;
}

function setCachedData(username, data) {
    const cacheObj = { data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_PREFIX + username.toLowerCase(), JSON.stringify(cacheObj));
}

// --- Hyper Effects ---

/**
 * Parallax Background Effect
 */
function handleParallax(e) {
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 40;
    const yPos = (clientY / window.innerHeight - 0.5) * 40;
    
    parallaxBg.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

/**
 * View Transitions with flair
 */
function switchToAppView() {
    landingView.classList.add('hidden');
    appView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initAppGitGraph();
}

function switchToLandingView() {
    appView.classList.add('hidden');
    landingView.classList.remove('hidden');
    state.user = null;
    state.repos = [];
    landingSearchInput.value = '';
    landingSearchInput.focus();
    // Restart node graph and card flip reveal when returning to landing
    resetLandingAnimations();
}

// --- Event Handlers ---

async function handleSearch(e, input) {
    e.preventDefault();
    const username = input.value.trim();
    if (!username) return;

    const performSearch = async () => {
        showLoading();
        switchToAppView();
        input.blur();

        const cached = getCachedData(username);
        if (cached) {
            updateState(cached.user, cached.repos);
            renderApp();
            return;
        }

        try {
            const [user, repos] = await Promise.all([
                fetchUser(username),
                fetchRepos(username)
            ]);

            updateState(user, repos);
            setCachedData(username, { user, repos });
            renderApp();
        } catch (error) {
            showError(error.message);
        }
    };

    // If we're on the landing view, trigger node implosion transition first
    if (!landingView.classList.contains('hidden') && input === landingSearchInput) {
        input.blur();
        implodeNodes(landingSearchForm, performSearch);
    } else {
        await performSearch();
    }
}

function handleSort(e) {
    state.currentSort = e.target.value;
    state.repos = sortRepositories(state.repos, state.currentSort);
    renderRepos(state.repos);
}

// --- Orchestration ---

function updateState(user, repos) {
    state.user = user;
    state.repos = sortRepositories(repos, state.currentSort);
    state.langStats = calculateLanguageStats(repos);
}

function renderApp() {
    renderProfile(state.user);
    renderRepos(state.repos);
    renderDonutChart(state.langStats, 'languages-chart');
    renderLegend(state.langStats);
    initDashboardTilt();
}

// --- Initialization ---

function init() {
    landingSearchForm.addEventListener('submit', (e) => handleSearch(e, landingSearchInput));
    appSearchForm.addEventListener('submit', (e) => handleSearch(e, appSearchInput));
    sortSelect.addEventListener('change', handleSort);
    backToLanding.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLandingView();
    });

    window.addEventListener('mousemove', handleParallax);

    // Initialize premium animations
    initGitGraph();
    initCardTilt();

    // Initial icon setup
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', init);
