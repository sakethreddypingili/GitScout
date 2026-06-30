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
