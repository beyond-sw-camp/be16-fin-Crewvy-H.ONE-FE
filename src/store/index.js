import { createStore } from 'vuex';
import notification from './modules/notification';

export default createStore({
  modules: {
    notification,
  },
  state: {
    user: null,
    company: {
      name: 'H.ONE 테크',
      domain: 'company.com'
    },
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
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user);
    },
    logout({ commit }) {
      commit('LOGOUT');
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userName: (state) => (state.user ? state.user.userName : ''),
    memberId: (state) => (state.user ? state.user.memberId : null),
    memberPositionId: (state) => (state.user ? state.user.memberPositionId : null)
  }
});