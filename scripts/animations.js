document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.about-section, .skill-item, .tech-category-item, .project-card');
  animateElements.forEach((el, index) => {
    el.classList.add('scroll-animate');
    el.style.transitionDelay = `${index * 0.05}s`;
    observer.observe(el);
  });
});
