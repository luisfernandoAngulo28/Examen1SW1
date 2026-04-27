// Dev (ng serve :4200): talks directly to Spring Boot on :8080
// Production (Docker/nginx): nginx proxies /api → backend container
export const API_BASE =
  window.location.port === '4200'
    ? 'http://localhost:8080/api'
    : `${window.location.protocol}//${window.location.host}/api`;
