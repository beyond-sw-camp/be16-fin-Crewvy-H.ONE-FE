<template>
  <el-dropdown ref="dropdownRef" trigger="click" @command="handleCommand" @visible-change="onDropdownVisibleChange">
    <span class="el-dropdown-link">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="item">
        <el-icon :size="24"><Bell /></el-icon>
      </el-badge>
    </span>
    <template #dropdown>
      <div class="notification-dropdown">
        <div class="notification-header">
          <div class="header-title">
            <el-icon><Bell /></el-icon>
            <span>알림</span>
            <el-badge v-if="unreadCount > 0" :value="unreadCount" class="header-badge" />
          </div>
          <el-button 
            :icon="Close" 
            class="header-close-btn"
            circle
            size="small"
            text
            @click="handleCloseDropdown"
          />
        </div>
        <div class="notification-list">
          <div v-if="notifications.length === 0" class="empty-state">
            <el-icon class="empty-icon"><Bell /></el-icon>
            <p class="empty-text">알림이 없습니다</p>
          </div>
          <div 
            v-for="notification in notifications" 
            :key="notification.notificationId" 
            class="notification-item"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <div class="notification-text">
                <div v-if="getNotificationTitle(notification.contents)" class="notification-title">
                  {{ getNotificationTitle(notification.contents) }}
                </div>
                <div class="notification-body">{{ getNotificationBody(notification.contents) }}</div>
              </div>
              <div class="notification-time">{{ formatDate(notification.createAt) }}</div>
            </div>
            <el-button 
              @click.stop="markAsRead(notification.notificationId)" 
              :icon="Close" 
              class="close-btn"
              circle
              size="small"
              text
            />
          </div>
        </div>
        <div v-if="notifications.length > 0" class="notification-footer">
          <el-button 
            type="text" 
            @click="handleMarkAllAsRead" 
            class="mark-all-btn"
          >
            전체 읽음 처리
          </el-button>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { Bell, Close } from '@element-plus/icons-vue';
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

const handleCommand = () => {
  // Command handling is now done through specific click handlers
};

const markAsRead = (notificationId) => {
  store.dispatch('notification/markAsRead', notificationId);
};

const handleMarkAllAsRead = () => {
  store.dispatch('notification/markAllAsRead');
};

const handleCloseDropdown = () => {
  if (dropdownRef.value) {
    dropdownRef.value.handleClose();
  }
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
      case 'NT010':
      try {
        url = `/resource/reservation`;
      } catch (error) {
        console.error('NT010 알림 처리 중 예약ID를 가져오는 데 실패했습니다:', error);
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

// 알림 메시지를 제목과 내용으로 분리
const getNotificationTitle = (contents) => {
  if (!contents || typeof contents !== 'string') return '';
  const colonIndex = contents.indexOf(' : ');
  if (colonIndex > 0) {
    return contents.substring(0, colonIndex).trim();
  }
  return null;
};

const getNotificationBody = (contents) => {
  if (!contents || typeof contents !== 'string') return contents || '';
  const colonIndex = contents.indexOf(' : ');
  if (colonIndex > 0) {
    return contents.substring(colonIndex + 3).trim();
  }
  return contents;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return '방금 전';
  } else if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  }
};
</script>

<style scoped>
/* Dropdown Link (Bell Icon) */
.el-dropdown-link {
  cursor: pointer;
  color: #606266;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}

.el-dropdown-link:hover {
  color: #409eff;
}

/* Notification Dropdown Container */
.notification-dropdown {
  width: 380px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Notification Header */
.notification-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.header-title .el-icon {
  font-size: 18px;
  color: #409eff;
}

.header-badge {
  margin-left: 4px;
}

.header-close-btn {
  flex-shrink: 0;
  color: #909399;
  transition: color 0.3s ease;
}

.header-close-btn:hover {
  color: #409eff;
  background: #ecf5ff;
}

/* Notification List */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
  font-weight: 500;
}

/* Notification Item */
.notification-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 12px;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin-bottom: 6px;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-body {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

.close-btn {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #909399;
}

.notification-item:hover .close-btn {
  opacity: 1;
}

.close-btn:hover {
  color: #409eff;
  background: #ecf5ff;
}

/* Notification Footer */
.notification-footer {
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  text-align: center;
}

.mark-all-btn {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 16px;
  transition: color 0.3s ease;
}

.mark-all-btn:hover {
  color: #66b1ff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-dropdown {
    width: 320px;
  }

  .notification-item {
    padding: 12px 16px;
  }

  .notification-text {
    font-size: 13px;
  }

  .notification-time {
    font-size: 11px;
  }
}
</style>
