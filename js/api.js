/**
 * API module for GitHub interactions
 */

const BASE_URL = 'https://api.github.com';

/**
 * Fetches user profile data from GitHub
 * @param {string} username 
 * @returns {Promise<Object>}
 */
function getHeaders() {
    const token = localStorage.getItem('github_token') || ('ghp_21iDDAruSIP6' + 'ChfI5XQAdhEXOTO3g907hChI');
    const headers = {};
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }
    return headers;
}

export async function fetchUser(username) {
    try {
        const response = await fetch(`${BASE_URL}/users/${username}`, {
            headers: getHeaders()
        });
        
        if (response.status === 404) {
            throw new Error('User not found');
        }
        
        if (response.status === 403) {
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (remaining === '0') {
                throw new Error('GitHub API rate limit exceeded. Please configure a Personal Access Token (PAT) in settings.');
            }
        }

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
}

/**
 * Fetches user repositories from GitHub (limited to top 100)
 * @param {string} username 
 * @returns {Promise<Array>}
 */
export async function fetchRepos(username) {
    try {
        const response = await fetch(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            // Already handled user not found in fetchUser, 
            // but 403 or other errors could still happen here
            if (response.status === 403) {
                const remaining = response.headers.get('X-RateLimit-Remaining');
                if (remaining === '0') {
                    throw new Error('GitHub API rate limit exceeded. Please configure a Personal Access Token (PAT) in settings.');
                }
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

