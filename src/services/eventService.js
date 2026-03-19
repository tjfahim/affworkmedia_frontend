// services/eventService.js
import api from './api';

export const eventAPI = {
  // Get all events
  getEvents: () => {
    return api.get('/events');
  },

  // Get single event
  getEvent: (id) => {
    return api.get(`/events/${id}`);
  },

  // Create new event
  createEvent: (data) => {
    return api.post('/events', data);
  },

  // Update event
  updateEvent: (id, data) => {
    return api.put(`/events/${id}`, data);
  },

  // Delete event
  deleteEvent: (id) => {
    return api.delete(`/events/${id}`);
  },
};

export default eventAPI;