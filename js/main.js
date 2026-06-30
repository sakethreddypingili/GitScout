/**
 * js/main.js
 * Form submit listeners, validation, and spinner load views.
 */

// Register query form submit listeners
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchError = document.getElementById('search-error');
  const loader = document.getElementById('loader');

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const rawValue = searchInput.value;
      // Sanitize input field parameters validation
      const cleanValue = sanitizeQueryText(rawValue);
      
      if (!cleanValue || cleanValue.trim().length === 0) {
        searchError.textContent = 'Please enter a valid username.';
        return;
      }
      
      searchError.textContent = '';
      
      // Execute loading view toggle (activate spinner loader)
      loader.classList.add('active');
      loader.setAttribute('aria-hidden', 'false');

      // Trigger profile details request pipeline
      buildProfileDetailsPipeline(cleanValue);
    });
  }
});

/**
 * Toggles loader visibility state off.
 */
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.remove('active');
    loader.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Asynchronously query Github user profile details API pipeline.
 * Captures rate limit headers and renders output to details card.
 * @param {string} username - Sanitized username to search
 */
async function buildProfileDetailsPipeline(username) {
  const profileSection = document.getElementById('profile-section');
  const profileCard = document.getElementById('profile-card');
  const rateLimitInfo = document.getElementById('rate-limit-info');
  const searchError = document.getElementById('search-error');
  
  const encodedUser = encodeQueryParameter(username);
  const endpoint = `https://api.github.com/users/${encodedUser}`;
  
  try {
    const response = await fetch(endpoint);
    
    // Capture rate-limiting headers
    const limit = response.headers.get('X-RateLimit-Limit') || 'N/A';
    const remaining = response.headers.get('X-RateLimit-Remaining') || 'N/A';
    rateLimitInfo.textContent = `GitHub API Rate Limit: ${remaining} / ${limit} remaining`;
    
    // Handle response checks & status flags
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GitHub profile not found.');
      } else {
        throw new Error(`API Request failed with status ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Clean data object values
    const profileData = {
      login: data.login || 'Unknown',
      avatarUrl: data.avatar_url || '',
      name: data.name || 'No Name Provided',
      bio: data.bio || 'This profile has no bio.',
      publicRepos: typeof data.public_repos === 'number' ? data.public_repos : 0,
      followers: typeof data.followers === 'number' ? data.followers : 0,
      createdAt: data.created_at || ''
    };
    
    // Render results
    profileCard.innerHTML = `
      <div class="profile-header">
        <img src="${profileData.avatarUrl}" alt="${profileData.login}'s avatar" class="profile-avatar" width="80" height="80" />
        <div>
          <h2>${profileData.name} (@${profileData.login})</h2>
          <p class="joined-date">Joined: ${parseCalendarDate(profileData.createdAt)}</p>
        </div>
      </div>
      <p class="profile-bio">${profileData.bio}</p>
      <div class="profile-stats">
        <span><strong>Repositories:</strong> ${formatCompactNumber(profileData.publicRepos)}</span>
        <span><strong>Followers:</strong> ${formatCompactNumber(profileData.followers)}</span>
      </div>
    `;
    profileSection.style.display = 'block';
  } catch (error) {
    searchError.textContent = error.message;
    profileSection.style.display = 'none';
  } finally {
    hideLoader();
  }
}

