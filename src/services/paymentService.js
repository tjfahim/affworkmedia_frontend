// services/paymentService.js
import api from './api';

const paymentService = {
    // Get all payments with filters
    getAllPayments: async (params = {}) => {
        try {
            const response = await api.get('/affiliate-payments', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    },

    // Get single payment
    getPayment: async (id) => {
        try {
            const response = await api.get(`/affiliate-payments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching payment:', error);
            throw error;
        }
    },

    // Create payment from affiliate balance
    createPayment: async (paymentData) => {
        try {
            const response = await api.post('/affiliate-payments/create-payment', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    // Update payment
    updatePayment: async (id, paymentData) => {
        try {
            const response = await api.put(`/affiliate-payments/${id}`, paymentData);
            return response.data;
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    },

    // Update payment status
    updatePaymentStatus: async (id, statusData) => {
        try {
            const response = await api.patch(`/affiliate-payments/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // Delete payment
    deletePayment: async (id) => {
        try {
            const response = await api.delete(`/affiliate-payments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    },

    // Get affiliates with balance
    getAffiliatesWithBalance: async (params = {}) => {
        try {
            const response = await api.get('/affiliate-payments/affiliates-with-balance', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching affiliates:', error);
            throw error;
        }
    },

    // Get balance summary
    getBalanceSummary: async () => {
        try {
            const response = await api.get('/affiliate-payments/balance-summary');
            return response.data;
        } catch (error) {
            console.error('Error fetching balance summary:', error);
            throw error;
        }
    },

    // Get affiliate payments
    getAffiliatePayments: async (userId, params = {}) => {
        try {
            const response = await api.get(`/affiliate-payments/affiliate/${userId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching affiliate payments:', error);
            throw error;
        }
    },

    // Generate invoice PDF
    generateInvoice: async (paymentId) => {
        try {
            const response = await api.get(`/affiliate-payments/${paymentId}/invoice`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    },

    // Get my single payment details
    getMyPayments: async (params = {}) => {
        try {
            const response = await api.get('/affiliate-payments/my-payments', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching my payments:', error);
            throw error;
        }
    },

    getMyPaymentView: async (id) => {
        try {
            const response = await api.get(`/affiliate-payments/my-payments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching my payment details:', error);
            throw error;
        }
    },
};

export default paymentService;