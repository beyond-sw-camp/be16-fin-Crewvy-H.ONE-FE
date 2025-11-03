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
    // 최신순으로 정렬 (createAt 기준 내림차순)
    state.notifications = notifications.sort((a, b) => {
      const dateA = new Date(a.createAt);
      const dateB = new Date(b.createAt);
      return dateB - dateA; // 최신순 (내림차순)
    });
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
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift(notification);
    state.unreadCount++;
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
  async markAllAsRead({ commit }) {
    try {
      await apiClient.patch('/workspace-service/notification/read-all');
      commit('MARK_ALL_AS_READ');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // 에러가 발생해도 사용자에게는 조용히 처리
      // 필요시 에러 메시지를 표시할 수도 있음
    }
  },
  addNotification({ commit }, notification) {
    commit('ADD_NOTIFICATION', notification);
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
