// services/domainRedirectService.js
import api from './api';

export const domainRedirectAPI = {
  // Get all domain redirects
  getDomainRedirects: () => {
    return api.get('/domain-redirects');
  },

  // Get single domain redirect
  getDomainRedirect: (id) => {
    return api.get(`/domain-redirects/${id}`);
  },

  // Create new domain redirect
  createDomainRedirect: (data) => {
    return api.post('/domain-redirects', data);
  },

  // Update domain redirect
  updateDomainRedirect: (id, data) => {
    return api.put(`/domain-redirects/${id}`, data);
  },

  // Delete domain redirect
  deleteDomainRedirect: (id) => {
    return api.delete(`/domain-redirects/${id}`);
  },

  // Toggle status
  toggleStatus: (id) => {
    return api.patch(`/domain-redirects/${id}/toggle-status`);
  },
};

export default domainRedirectAPI;