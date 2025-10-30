import memberService from '@/api/memberService';

const state = {
  permissions: [],
};

const mutations = {
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions;
  },
};

const actions = {
  async fetchPermissions({ commit }) {
    try {
      const permissions = await memberService.getMyPermissions();
      commit('SET_PERMISSIONS', permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Handle error, maybe clear permissions or show a notification
      commit('SET_PERMISSIONS', []);
    }
  },
};

const getters = {
  hasPermission: (state) => (requiredPermissions) => {
    if (!state.permissions) return false;
    return requiredPermissions.some(p => state.permissions.includes(p));
  },
  hasEmployeeReadCompanyOrSystem: (state) => {
    return state.permissions.includes('member:READ:COMPANY') || state.permissions.includes('member:READ:SYSTEM');
  },
  hasEmployeeReadDepartment: (state) => {
    return state.permissions.includes('member:READ:DEPARTMENT');
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
