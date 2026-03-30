// services/settingsService.js
import api from './api';

export const settingsAPI = {
  // Get all settings
  getSettings: () => {
    return api.get('/settings');
  },

  // Update settings - send as JSON (not FormData for non-file updates)
  updateSettings: (data) => {
    return api.put('/settings', data);
  },

  // Update settings with files (logo/favicon) - Use POST with _method for Laravel
  updateSettingsWithFiles: (formData) => {
    // For file uploads, we need to use POST with _method=PUT
    // because some browsers don't support PUT with FormData
    formData.append('_method', 'PUT');
    
    return api.post('/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Remove logo
  removeLogo: () => {
    return api.delete('/settings/logo');
  },

  // Remove favicon
  removeFavicon: () => {
    return api.delete('/settings/favicon');
  },
};

export default settingsAPI;