// services/affiliateOfferService.js

import api from './api';

export const affiliateOfferAPI = {
    getGames: () => {
        return api.get('/affiliate/games');  // Note the /affiliate prefix
    },
    
    getGameEvents: (gameId) => {
        return api.get(`/affiliate/games/${gameId}/events`);
    },
    
    getGameEventsWithTracking: (gameId) => {
        return api.get(`/affiliate/games/${gameId}/events-with-tracking`);
    },
    
    getEventDetails: (eventId) => {
        return api.get(`/affiliate/events/${eventId}`);
    },
    
    generateTrackingLink: (data) => {
        return api.post('/affiliate/generate-tracking-link', data);
    }
};

export default affiliateOfferAPI;