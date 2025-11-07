<template>
  <div class="notification-settings-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1 class="title">알림 설정</h1>
        <p class="subtitle">수신할 알림 유형을 선택하고 관리하세요</p>
      </div>
    </div>

    <!-- Settings Card -->
    <el-card class="settings-card" shadow="never">
      <div class="settings-list">
        <div 
          v-for="setting in settings" 
          :key="setting.settingId" 
          class="setting-item"
        >
          <div class="setting-info">
            <div class="setting-header">
              <el-icon class="setting-icon"><Bell /></el-icon>
              <div class="setting-details">
                <div class="setting-title">{{ getNotificationTypeName(setting.type) }}</div>
                <div class="setting-description">{{ getNotificationTypeDescription(setting.type, setting.isActive) }}</div>
              </div>
            </div>
          </div>
          <el-switch
            v-model="setting.isActive"
            size="large"
            class="setting-switch"
          />
        </div>

        <div v-if="settings.length === 0" class="empty-state">
          <el-icon class="empty-icon"><Bell /></el-icon>
          <p class="empty-text">설정 가능한 알림이 없습니다.</p>
        </div>
      </div>

      <div class="actions">
        <el-button type="primary" @click="saveAllSettings" class="save-button">
          <el-icon><Check /></el-icon>
          <span>설정 저장</span>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getNotificationSettings, updateNotificationSetting } from '@/api/notificationService';
import { ElMessage } from 'element-plus';
import { Bell, Check } from '@element-plus/icons-vue';

export default {
  name: 'NotificationSettings',
  components: {
    Bell,
    Check,
  },
  setup() {
    const settings = ref([]);
    const originalSettings = ref([]); // To keep track of initial state for comparison

    // 알림 유형명 매핑
    const getNotificationTypeName = (type) => {
      const typeMap = {
        'NT004': '결재 알림',
        'NT005': '팀 목표 알림',
        'NT006': '개인 목표 알림',
        'NT007': '팀원 목표 알림',
        'NT008': '개인 목표 평가 알림',
        'NT009': '팀원 목표 평가 알림',
      };
      return typeMap[type] || type;
    };

    // 알림 유형 설명 매핑 (활성화 상태에 따라 동적 변경)
    const getNotificationTypeDescription = (type, isActive) => {
      const baseDescriptionMap = {
        'NT004': '결재 요청 및 승인 관련',
        'NT005': '팀 목표 생성 및 변경 관련',
        'NT006': '개인 목표 생성 및 변경 관련',
        'NT007': '팀원 목표 관련',
        'NT008': '개인 목표 평가 요청 및 완료',
        'NT009': '팀원 목표 평가 요청 및 완료',
      };
      
      const baseDescription = baseDescriptionMap[type] || '알림';
      return isActive 
        ? `${baseDescription} 알림을 받습니다`
        : `${baseDescription} 알림을 받지 않습니다`;
    };

    const fetchSettings = async () => {
      try {
        const response = await getNotificationSettings();
        settings.value = response.data.data.map(s => ({
          ...s,
          isActive: s.isActive === 'TRUE',
        }));
        originalSettings.value = JSON.parse(JSON.stringify(settings.value)); // Deep copy
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        ElMessage.error('알림 설정을 불러오는데 실패했습니다.');
      }
    };

    const saveAllSettings = async () => {
      try {
        const changedSettings = [];
        for (const setting of settings.value) {
          const originalSetting = originalSettings.value.find(o => o.settingId === setting.settingId);
          if (originalSetting && originalSetting.isActive !== setting.isActive) {
            changedSettings.push({
              settingId: setting.settingId,
              isActive: setting.isActive ? 'TRUE' : 'FALSE',
            });
          }
        }

        if (changedSettings.length > 0) {
          await updateNotificationSetting(changedSettings);
          originalSettings.value = JSON.parse(JSON.stringify(settings.value)); // Update original settings after saving
          ElMessage.success('알림 설정이 성공적으로 저장되었습니다.');
        } else {
          ElMessage.info('변경할 알림 설정이 없습니다.');
        }
      } catch (error) {
        console.error('Error saving notification settings:', error);
        ElMessage.error('알림 설정 저장에 실패했습니다.');
      }
    };

    onMounted(() => {
      fetchSettings();
    });

    return {
      settings,
      saveAllSettings,
      getNotificationTypeName,
      getNotificationTypeDescription,
    };
  },
};
</script>

<style scoped>
.notification-settings-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Section */
.header {
  margin-bottom: 32px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #303133;
  line-height: 1.2;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

/* Settings Card */
.settings-card {
  border-radius: 16px;
  border: none;
  background: #ffffff;
}

.settings-card :deep(.el-card__body) {
  padding: 24px;
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.setting-info {
  flex: 1;
}

.setting-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.setting-icon {
  font-size: 24px;
  color: #409eff;
  margin-top: 2px;
  flex-shrink: 0;
}

.setting-details {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  line-height: 1.4;
}

.setting-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.setting-switch {
  flex-shrink: 0;
  margin-left: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 18px;
  color: #909399;
  margin: 0;
  font-weight: 500;
}

/* Actions */
.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.save-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.save-button:active {
  transform: translateY(0);
}

.save-button :deep(.el-icon) {
  margin-right: 8px;
  font-size: 18px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-settings-container {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .setting-item {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .setting-switch {
    margin-left: 0;
    align-self: flex-end;
  }

  .settings-card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>