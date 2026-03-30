// services/landingService.js
import api from './api';

export const landingAPI = {
  // Get all landings
  getLandings: () => {
    return api.get('/landings');
  },

  // Get single landing
  getLanding: (id) => {
    return api.get(`/landings/${id}`);
  },

  // Create new landing
  createLanding: (formData) => {
    return api.post('/landings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update landing (using POST with _method=PUT for file upload)
  updateLanding: (id, formData) => {
    return api.post(`/landings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete landing
  deleteLanding: (id) => {
    return api.delete(`/landings/${id}`);
  },

  // Toggle status
  toggleStatus: (id) => {
    return api.patch(`/landings/${id}/toggle-status`);
  },
};

export default landingAPI;