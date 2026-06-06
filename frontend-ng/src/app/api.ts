// Dev (ng serve on localhost): talks directly to Spring Boot on :8080
// Production (nginx on any IP): uses relative /api so nginx proxies to backend
export const API_BASE =
  (window.location.hostname === 'localhost')
    ? 'http://localhost:8080/api'
    : '/api';
