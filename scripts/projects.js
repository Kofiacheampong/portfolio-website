document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects");
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading projects...</p>
    </div>
  `;

  fetch(CONFIG.getAssetPath("projects.json"))
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(projects => {
      // Clear loading state
      container.innerHTML = '';

      if (!Array.isArray(projects) || projects.length === 0) {
        throw new Error('No projects found');
      }

      projects.forEach((project, index) => {
        const card = document.createElement("div");
        card.className = "fade-in";
        card.style.animationDelay = `${index * 0.1}s`;

        const statusBadge = project.link ? 
          '<div class="project-status live">Live</div>' : 
          '<div class="project-status private">Private</div>';

        const placeholderImage = `
          <div class="project-image">
            <div class="project-image-placeholder">
              <span class="project-emoji-large">${project.emoji}</span>
            </div>
          </div>
        `;

        card.innerHTML = `
          <div class="project-card">
            ${placeholderImage}
            <div class="project-content">
              ${statusBadge}
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <div class="tech-tags">
                ${project.technologies ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('') : ''}
              </div>
              <div class="project-actions">
                ${project.link ? `<a href="${project.link}" target="_blank" class="project-link" aria-label="View ${project.title} project" rel="noopener noreferrer">View Project</a>` : '<span class="project-link disabled" aria-label="Private project - not publicly available">Private Project</span>'}
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      container.innerHTML = `
        <div class="error-message">
          <h3>Unable to Load Projects</h3>
          <p>Sorry, there was an error loading the projects: ${error.message}</p>
          <button onclick="location.reload()" class="retry-btn">Try Again</button>
        </div>
      `;
    });
});
