document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects");
  if (!container) return;

  let allProjects = [];

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
      allProjects = projects;
      renderProjects(projects);
      initFilters();
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      container.textContent = '';
      const errorMessage = createMessage(
        'Unable to Load Projects',
        `Sorry, there was an error loading the projects: ${error.message}`
      );
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'retry-btn';
      retryButton.textContent = 'Try Again';
      retryButton.addEventListener('click', () => location.reload());
      errorMessage.appendChild(retryButton);
      container.appendChild(errorMessage);
    });

  function renderProjects(projects) {
    container.textContent = '';

    if (!Array.isArray(projects) || projects.length === 0) {
      container.appendChild(createMessage('No Projects Found', 'No projects match the selected filter.'));
      return;
    }

    projects.forEach((project, index) => {
      const card = document.createElement("div");
      card.className = "project-card-wrapper fade-in";
      card.style.animationDelay = `${index * 0.1}s`;
      card.dataset.category = project.category || '';

      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';

      const projectImage = document.createElement('div');
      projectImage.className = 'project-image';

      const placeholder = document.createElement('div');
      placeholder.className = 'project-image-placeholder';

      const emoji = document.createElement('span');
      emoji.className = 'project-emoji-large';
      emoji.textContent = project.emoji || '';
      placeholder.appendChild(emoji);
      projectImage.appendChild(placeholder);

      const content = document.createElement('div');
      content.className = 'project-content';

      const safeLink = getSafeExternalUrl(project.link);
      const statusBadge = document.createElement('div');
      statusBadge.className = `project-status ${safeLink ? 'live' : 'private'}`;
      statusBadge.textContent = safeLink ? 'Live' : 'Private';

      const title = document.createElement('h3');
      title.textContent = project.title || 'Untitled Project';

      const description = document.createElement('p');
      description.textContent = project.description || '';

      const techTags = document.createElement('div');
      techTags.className = 'tech-tags';
      if (Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => {
          const tag = document.createElement('span');
          tag.className = 'tech-tag';
          tag.textContent = tech;
          techTags.appendChild(tag);
        });
      }

      const actions = document.createElement('div');
      actions.className = 'project-actions';

      if (safeLink) {
        const link = document.createElement('a');
        link.href = safeLink;
        link.target = '_blank';
        link.className = 'project-link';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `View ${project.title || 'project'} project`);
        link.textContent = 'View Project';
        actions.appendChild(link);
      } else {
        const privateLabel = document.createElement('span');
        privateLabel.className = 'project-link disabled';
        privateLabel.setAttribute('aria-label', 'Private project - not publicly available');
        privateLabel.textContent = 'Private Project';
        actions.appendChild(privateLabel);
      }

      content.append(statusBadge, title, description, techTags, actions);
      projectCard.append(projectImage, content);
      card.appendChild(projectCard);
      container.appendChild(card);
    });
  }

  function createMessage(title, message) {
    const wrapper = document.createElement('div');
    wrapper.className = 'error-message';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const text = document.createElement('p');
    text.textContent = message;

    wrapper.append(heading, text);
    return wrapper;
  }

  function getSafeExternalUrl(url) {
    if (!url) return '';

    try {
      const parsedUrl = new URL(url, window.location.href);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        return parsedUrl.href;
      }
    } catch (error) {
      console.warn('Ignoring invalid project URL:', url);
    }

    return '';
  }

  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        if (filter === 'all') {
          renderProjects(allProjects);
        } else {
          const filtered = allProjects.filter(p => p.category === filter);
          renderProjects(filtered);
        }
      });
    });
  }
});
