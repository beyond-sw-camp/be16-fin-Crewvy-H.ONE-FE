import apiClient from '@/api/http';

const state = {
  notifications: [],
  unreadCount: 0,
};

const mutations = {
  INCREMENT_UNREAD_COUNT(state) {
    state.unreadCount++;
  },
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications;
    state.unreadCount = notifications.length;
  },
  MARK_AS_READ(state, notificationId) {
    const index = state.notifications.findIndex(n => n.notificationId === notificationId);
    if (index !== -1) {
      state.notifications.splice(index, 1);
      state.unreadCount--;
    }
  },
  MARK_ALL_AS_READ(state) {
    state.notifications = [];
    state.unreadCount = 0;
  },
};

const actions = {
  incrementUnreadCount({ commit }) {
    commit('INCREMENT_UNREAD_COUNT');
  },
  async fetchNotifications({ commit }) {
    try {
      const response = await apiClient.get('/workspace-service/notification/get-my-alarm');
      commit('SET_NOTIFICATIONS', response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  },
  async markAsRead({ commit }, notificationId) {
    try {
      await apiClient.patch(`/workspace-service/notification/read/${notificationId}`);
      commit('MARK_AS_READ', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  markAllAsRead({ commit }) {
    commit('MARK_ALL_AS_READ');
  },
};

const getters = {
  notifications: state => state.notifications,
  unreadCount: state => state.unreadCount,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
