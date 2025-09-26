import { createStore } from 'vuex'

export default createStore({
  state: {
    user: {
      name: '김철수',
      email: 'kim@company.com',
      department: '개발팀',
      position: '팀장',
      avatar: 'https://via.placeholder.com/40'
    },
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
      state.user = user
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift(notification)
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id)
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user)
    },
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    },
    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id)
    }
  }
})
