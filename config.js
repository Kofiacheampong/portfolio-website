// Environment-based configuration
const CONFIG = {
  // Automatically detect if we're running locally or on server
  isLocal: window.location.protocol === 'file:' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.port !== '' && (window.location.port === '8080' || window.location.port === '8000') ||
           !window.location.hostname.includes('kofiarcher.com'),
  
  // Base paths for different environments
  paths: {
    local: {
      base: '',
      styles: 'styles/',
      scripts: 'scripts/',
      assets: ''
    },
    production: {
      base: '/portfolio/',
      styles: '/portfolio/styles/',
      scripts: '/portfolio/scripts/',
      assets: '/portfolio/'
    }
  },
  
  // Get the current environment's paths
  getCurrentPaths() {
    return this.isLocal ? this.paths.local : this.paths.production;
  },
  
  // Helper functions to build URLs
  getStylePath(filename) {
    return this.getCurrentPaths().styles + filename;
  },
  
  getScriptPath(filename) {
    return this.getCurrentPaths().scripts + filename;
  },
  
  getAssetPath(filename) {
    return this.getCurrentPaths().assets + filename;
  },
  
  getPagePath(filename) {
    const paths = this.getCurrentPaths();
    if (filename === 'index.html' || filename === '') {
      return this.isLocal ? 'index.html' : paths.base;
    }
    return paths.base + filename;
  }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;