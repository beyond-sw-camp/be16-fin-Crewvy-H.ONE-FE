import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    company: {
      name: 'H.ONE 테크',
      domain: 'company.com'
    },
    notifications: [
      { id: 1, title: '결재 요청', message: '휴가 신청서가 도착했습니다.', time: '10분 전' },
      { id: 2, title: '공지사항', message: '새로운 공지사항이 등록되었습니다.', time: '1시간 전' }
    ]
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    LOGOUT(state) {
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('memberId');
      localStorage.removeItem('memberPositionId');
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift(notification);
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user);
    },
    logout({ commit }) {
      commit('LOGOUT');
    },
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
    },
    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userName: (state) => (state.user ? state.user.userName : ''),
    memberId: (state) => (state.user ? state.user.memberId : null),
    memberPositionId: (state) => (state.user ? state.user.memberPositionId : null)
  }
})