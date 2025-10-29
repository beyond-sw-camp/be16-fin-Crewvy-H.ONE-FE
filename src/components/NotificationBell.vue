<template>
  <el-dropdown ref="dropdownRef" trigger="click" @command="handleCommand" @visible-change="onDropdownVisibleChange">
    <span class="el-dropdown-link">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="item">
        <el-icon :size="24"><bell /></el-icon>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-if="notifications.length === 0">No notifications</el-dropdown-item>
        <el-dropdown-item v-for="notification in notifications" :key="notification.notificationId" :command="notification" class="notification-item">
          <div @click.stop="handleNotificationClick(notification)" class="notification-content">
            <div>{{ notification.contents }}</div>
            <div class="notification-time">{{ formatDate(notification.createAt) }}</div>
          </div>
          <el-button @click.stop="markAsRead(notification.notificationId)" type="text" class="close-btn">X</el-button>
        </el-dropdown-item>
        <el-dropdown-item v-if="notifications.length > 0" divided command="mark-all-as-read">Mark all as read</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { Bell } from '@element-plus/icons-vue';
import apiClient from '../api/http';

const store = useStore();
const dropdownRef = ref(null);

const notifications = computed(() => store.getters['notification/notifications']);
const unreadCount = computed(() => store.getters['notification/unreadCount']);

const onDropdownVisibleChange = (visible) => {
  if (visible) {
    store.dispatch('notification/fetchNotifications');
  }
};

const handleCommand = (command) => {
  if (command === 'mark-all-as-read') {
    store.dispatch('notification/markAllAsRead');
  }
  // Individual notification clicks are handled by handleNotificationClick
};

const markAsRead = (notificationId) => {
  store.dispatch('notification/markAsRead', notificationId);
};

const handleNotificationClick = async (notification) => {
  const { type, targetId, notificationId } = notification;

  let url = '';

  switch (type) {
    case 'NT004':
      url = `/approval/detail/${targetId}`;
      break;
    case 'NT005':
      url = `/performance/team-goal/${targetId}`;
      break;
    case 'NT006':
      url = `/performance/my-goal/${targetId}`;
      break;
    case 'NT007':
      try {
        const response = await apiClient.get(`http://localhost:8080/workforce-service/performance/get-goal-detail/${targetId}`);
        const teamGoalId = response.data.data.teamGoalId;
        url = `/performance/team-member-goal/${teamGoalId}/${targetId}`;
      } catch (error) {
        console.error('NT007 알림 처리 중 팀 목표 ID를 가져오는 데 실패했습니다:', error);
      }
      break;
    case 'NT008':
      url = `/performance/my-goal/${targetId}?from=review`;
      break;
    case 'NT009':
      try {
        const response = await apiClient.get(`http://localhost:8080/workforce-service/performance/get-goal-detail/${targetId}`);
        const teamGoalId = response.data.data.teamGoalId;
        url = `/performance/team-goal/${teamGoalId}/member-goal/${targetId}?mode=review`;
      } catch (error) {
        console.error('NT009 알림 처리 중 팀 목표 ID를 가져오는 데 실패했습니다:', error);
      }
      break;
    default:
      console.log(`알 수 없는 알림 타입: ${type}`);
      break;
  }

  if (url) {
    window.location.href = url;
  }

  if (dropdownRef.value) {
    dropdownRef.value.handleClose();
  }

  store.dispatch('notification/markAsRead', notificationId);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};
</script>

<style scoped>
.el-dropdown-menu {
  max-height: 300px; /* 알림창의 최대 높이 설정 */
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤바 생성 */
}
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notification-content {
  flex-grow: 1;
}
.notification-time {
  font-size: 0.8em;
  color: #999;
}
.close-btn {
  padding-left: 10px;
  padding-right: 0;
}
</style>
