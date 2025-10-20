<template>
  <el-dropdown trigger="click" @command="handleCommand" @visible-change="onDropdownVisibleChange">
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Bell } from '@element-plus/icons-vue';

const store = useStore();

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

const handleNotificationClick = (notification) => {
  // Here you can add logic to navigate to the notification's related page
  console.log('Notification clicked:', notification);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};
</script>

<style scoped>
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
