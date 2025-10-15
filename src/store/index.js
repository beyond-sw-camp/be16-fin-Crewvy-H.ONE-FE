import { createStore } from 'vuex'

export default createStore({
  state: {
    user: {
      // 아래 ID들을 백엔드 AutoCreate 로그에 찍힌 실제 UUID로 교체해주세요.
      memberId: 'db66c61b-34f3-4527-a21f-55598e4d8bf4',
      companyId: 'dd7c7d01-123c-4a24-9fa5-02519d7b0713',
      roleId: 'ROLE_ADMIN',
      name: '관리자',
      avatar: null
    },
    notifications: [
      { id: 1, title: '결재 요청', message: '휴가 신청서가 도착했습니다.', time: '10분 전' },
      { id: 2, title: '공지사항', message: '새로운 공지사항이 등록되었습니다.', time: '1시간 전' }
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
