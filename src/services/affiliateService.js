// services/affiliateService.js
import api from './api';

export const affiliateAPI = {
  // Get all affiliates with pagination
  getAffiliates: (page = 1, perPage = 15) => {
    return api.get(`/affiliates?page=${page}&per_page=${perPage}`);
  },

  // Get all affiliates for dropdown (active only)
  getAllAffiliatesList: () => {
    return api.get('/affiliates/all/list');
  },

  // Get single affiliate details
  getAffiliate: (id) => {
    return api.get(`/affiliates/${id}`);
  },

  // Create new affiliate
  createAffiliate: (data) => {
    return api.post('/affiliates', data);
  },

  // Update affiliate
  updateAffiliate: (id, data) => {
    return api.put(`/affiliates/${id}`, data);
  },

  // Delete affiliate
  deleteAffiliate: (id) => {
    return api.delete(`/affiliates/${id}`);
  },

  // Update affiliate status
  updateStatus: (id, status) => {
    return api.patch(`/affiliates/${id}/status`, { status });
  },

  // Update affiliate commission
  updateCommission: (id, aff_percent) => {
    return api.patch(`/affiliates/${id}/commission`, { aff_percent });
  }
};

export default affiliateAPI;