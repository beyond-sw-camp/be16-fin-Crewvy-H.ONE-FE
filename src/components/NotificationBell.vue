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
import { useRouter } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import apiClient from '../api/http';

const store = useStore();
const router = useRouter();
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
  // 실제 notification 객체 구조에 맞게 `notificationType`과 `relatedId`는 수정이 필요할 수 있습니다.
  const { type, targetId, notificationId } = notification;

  switch (type) {
    case 'NT004':
      // 전자결재 상세 화면으로 이동
      router.push({
        name: 'ApprovalDetailView',
        params: { id: targetId } // targetId를 결재 문서 ID로 사용
      });
      break;
    case 'NT005':
      // 팀 목표 상세 화면으로 이동 (초대된 사람에게 가는 알림)
      router.push({
        name: 'TeamGoalDetail',
        params: { id: targetId } // targetId를 팀 목표 ID로 사용
      });
      break;
    case 'NT006':
      // 내 목표 상세 화면으로 이동
      router.push({
        name: 'MyGoalDetail',
        params: { goalId: targetId } // targetId를 내 목표 ID로 사용
      });
      break;
    case 'NT007':
      // 팀 목표 관리 - 하위 목표 상세 화면으로 이동
      // targetId는 memberGoalId에 해당
      try {
        const response = await apiClient.get(`http://localhost:8080/workforce-service/performance/get-goal-detail/${targetId}`);
        const teamGoalId = response.data.data.teamGoalId; // API 응답에서 teamGoalId 추출
        
        router.push({
          name: 'TeamMemberGoalDetail',
          params: {
            goalId: teamGoalId,
            memberGoalId: targetId
          }
        });
      } catch (error) {
        console.error('NT007 알림 처리 중 팀 목표 ID를 가져오는 데 실패했습니다:', error);
        // 에러 처리: 사용자에게 알림을 표시하거나 다른 페이지로 리다이렉트
      }
      break;
    case 'NT008':
      // 완료된 개인 목표 상세 화면으로 이동
      router.push({
        name: 'MyGoalDetail',
        params: { goalId: targetId }, // targetId를 개인 목표 ID로 사용
        query: { from: 'review' } // from=review 쿼리 파라미터 추가
      });
      break;
    case 'NT009':
      // 팀 목표 평가 화면의 팀원 목표 상세 화면으로 이동
      // targetId는 memberGoalId에 해당
      try {
        const response = await apiClient.get(`http://localhost:8080/workforce-service/performance/get-goal-detail/${targetId}`);
        const teamGoalId = response.data.data.teamGoalId; // API 응답에서 teamGoalId 추출

        router.push({
          name: 'TeamMemberGoalDetail',
          params: {
            goalId: teamGoalId,
            memberGoalId: targetId
          },
          query: { mode: 'review' } // mode=review 쿼리 파라미터 추가
        });
      } catch (error) {
        console.error('NT009 알림 처리 중 팀 목표 ID를 가져오는 데 실패했습니다:', error);
        // 에러 처리: 사용자에게 알림을 표시하거나 다른 페이지로 리다이렉트
      }
      break;
    default:
      console.log(`알 수 없는 알림 타입: ${type}`);
      break;
  }

  // 페이지 이동 후 알림창 닫기
  if (dropdownRef.value) {
    dropdownRef.value.handleClose();
  }

  // 로직 처리 후 알림을 읽음으로 표시
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
