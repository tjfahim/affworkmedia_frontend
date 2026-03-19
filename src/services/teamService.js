// services/teamService.js
import api from './api';

export const teamAPI = {
  // Get all teams
  getTeams: () => {
    return api.get('/teams');
  },

  // Get single team
  getTeam: (id) => {
    return api.get(`/teams/${id}`);
  },

  // Create new team
  createTeam: (formData) => {
    return api.post('/teams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update team (using POST with _method=PUT for file upload)
  updateTeam: (id, formData) => {
    return api.post(`/teams/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete team
  deleteTeam: (id) => {
    return api.delete(`/teams/${id}`);
  },

  // Toggle status
  toggleStatus: (id) => {
    return api.patch(`/teams/${id}/toggle-status`);
  },
};

export default teamAPI;