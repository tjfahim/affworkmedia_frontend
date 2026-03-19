// services/gameService.js
import api from './api';

export const gameAPI = {
  // Get all games
  getGames: () => {
    return api.get('/games');
  },

  // Get single game
  getGame: (id) => {
    return api.get(`/games/${id}`);
  },

  // Create new game
  createGame: (formData) => {
    return api.post('/games', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update game (using POST with _method=PUT for file upload)
  updateGame: (id, formData) => {
    return api.post(`/games/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete game
  deleteGame: (id) => {
    return api.delete(`/games/${id}`);
  },

  // Toggle status
  toggleStatus: (id) => {
    return api.patch(`/games/${id}/toggle-status`);
  },

  // Update order numbers in bulk
  updateOrder: (games) => {
    return api.post('/games/update-order', { games });
  },
};

export default gameAPI;