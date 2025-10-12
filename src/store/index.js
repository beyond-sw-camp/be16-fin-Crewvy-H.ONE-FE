import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    company: {
      name: 'H.ONE 테크',
      domain: 'company.com'
    },
    notifications: [
      {
        id: 1,
        title: '휴가 신청 승인',
        message: '김영희님의 휴가 신청이 승인되었습니다.',
        time: '2시간 전',
        type: 'success'
      },
      {
        id: 2,
        title: '새로운 결재 요청',
        message: '월간 보고서 결재가 요청되었습니다.',
        time: '4시간 전',
        type: 'info'
      }
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