import { createStore } from 'vuex'

// localStorage에서 사용자 정보 가져오기
const getUserFromLocalStorage = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      console.error("Error parsing user info from localStorage", e);
      localStorage.removeItem('userInfo'); // 손상된 데이터 삭제
      return null;
    }
  }
  return null;
};

export default createStore({
  state: {
    user: getUserFromLocalStorage(),
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
      localStorage.removeItem('userInfo');
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
    isAuthenticated: state => !!state.user,
    userName: state => state.user ? state.user.name : ''
  }
})