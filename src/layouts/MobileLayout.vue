<template>
  <div class="mobile-layout">
    <!-- 상단 헤더 -->
    <div class="mobile-header">
      <div class="header-left">
        <img src="@/assets/H.ONE-no-text.png" alt="H.ONE" class="logo-mobile" />
        <span class="app-name">H.ONE</span>
      </div>

      <div class="header-right">
        <!-- 세션 타이머 -->
        <div class="session-timer" :class="{ 'low-time': isTimeLow }">
          <el-icon><Clock /></el-icon>
          <span>{{ sessionTimeLeft }}</span>
        </div>

        <!-- 알림 -->
        <notification-bell />

        <!-- 사용자 메뉴 -->
        <el-dropdown @command="handleUserCommand" trigger="click">
          <el-avatar :src="userAvatarUrl" :size="32" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="my-info">내 정보</el-dropdown-item>
              <el-dropdown-item command="select-position">직무 선택</el-dropdown-item>
              <el-dropdown-item command="extend">세션 연장</el-dropdown-item>
              <el-dropdown-item command="logout" divided>로그아웃</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="mobile-content">
      <router-view />
    </div>

    <!-- 하단 탭 네비게이션 -->
    <div class="mobile-nav">
      <router-link to="/attendance" class="nav-item">
        <el-icon><Clock /></el-icon>
        <span>근태</span>
      </router-link>
      <router-link to="/leave-request" class="nav-item">
        <el-icon><Calendar /></el-icon>
        <span>휴가신청</span>
      </router-link>
      <router-link to="/my-info" class="nav-item">
        <el-icon><User /></el-icon>
        <span>내정보</span>
      </router-link>
    </div>

    <!-- 직무 선택 모달 -->
    <SelectPositionModal v-if="showSelectPositionModal" @close="showSelectPositionModal = false" />
  </div>
</template>

<script>
import { mapState, useStore } from 'vuex';
import { useSnackbar } from '@/composables/useSnackbar';
import { defaultAvatarSvg } from '@/utils/defaultAvatar.js';
import { onMounted, onBeforeUnmount } from 'vue';
import { useSse } from '@/composables/useSse.js';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import NotificationBell from '@/components/NotificationBell.vue';
import SelectPositionModal from '@/components/member/SelectPositionModal.vue';
import { Clock, Calendar, User } from '@element-plus/icons-vue';

export default {
  name: 'MobileLayout',
  components: { NotificationBell, SelectPositionModal },
  setup() {
    const { success, error, warning, info } = useSnackbar();
    const { connect, disconnect } = useSse();
    const store = useStore();

    onMounted(() => {
      store.dispatch('notification/fetchNotifications');
      connect();
    });

    onBeforeUnmount(() => {
      disconnect();
    });

    return { success, error, warning, info, Clock, Calendar, User };
  },
  data() {
    return {
      showSelectPositionModal: false,
      defaultAvatarSvg,
      sessionExpiryTime: null,
      sessionTimer: null,
      currentTime: new Date(),
    };
  },
  computed: {
    ...mapState(['user']),
    userAvatarUrl() {
      return this.user?.avatar || this.defaultAvatarSvg;
    },
    sessionTimeLeft() {
      if (!this.sessionExpiryTime) return '00:00';
      const now = this.currentTime.getTime();
      const expiry = this.sessionExpiryTime.getTime();
      const diff = expiry - now;

      if (diff <= 0) return '00:00';

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    isTimeLow() {
      if (!this.sessionExpiryTime) return false;
      const diff = this.sessionExpiryTime.getTime() - this.currentTime.getTime();
      return diff > 0 && diff < 3 * 60 * 1000;
    }
  },
  methods: {
    handleUserCommand(command) {
      switch (command) {
        case 'my-info':
          this.$router.push('/my-info');
          break;
        case 'select-position':
          this.showSelectPositionModal = true;
          break;
        case 'extend':
          this.extendSession();
          break;
        case 'logout':
          localStorage.clear();
          this.$router.push('/landing');
          break;
      }
    },
    initSessionTimer() {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const decodedToken = jwtDecode(accessToken);
          const expiryTime = decodedToken.exp * 1000;
          this.sessionExpiryTime = expiryTime > Date.now() ? new Date(expiryTime) : new Date(Date.now());
        } catch (e) {
          this.sessionExpiryTime = new Date(Date.now());
        }
      }

      if (this.sessionTimer) clearInterval(this.sessionTimer);
      this.sessionTimer = setInterval(() => {
        this.currentTime = new Date();
      }, 1000);
    },
    async extendSession() {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const memberPositionId = localStorage.getItem('memberPositionId');

        if (!refreshToken) {
          this.error('세션 연장에 필요한 정보가 없습니다.');
          return;
        }

        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/generate-at`, {
          refreshToken,
          memberPositionId
        });

        if (response.data?.success) {
          localStorage.setItem("accessToken", response.data.data.accessToken);
          this.initSessionTimer();
          this.success('세션이 연장되었습니다.');
        } else {
          throw new Error('세션 연장 실패');
        }
      } catch (err) {
        this.error('세션 연장에 실패했습니다.');
        localStorage.clear();
        this.$router.push('/landing');
      }
    }
  },
  mounted() {
    if (localStorage.getItem('accessToken')) {
      this.initSessionTimer();
    }
  },
  beforeUnmount() {
    if (this.sessionTimer) clearInterval(this.sessionTimer);
  }
};
</script>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-mobile {
  width: 32px;
  height: 32px;
}

.app-name {
  font-size: 18px;
  font-weight: bold;
  color: #1e40af;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 12px;
}

.session-timer.low-time {
  color: #f56c6c;
  font-weight: 600;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 8px 0;
  height: 60px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #606266;
  text-decoration: none;
  flex: 1;
  padding: 8px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #4f46e5;
  background: #f0f9ff;
}

.nav-item .el-icon {
  font-size: 24px;
}

.nav-item span {
  font-size: 12px;
}
</style>
