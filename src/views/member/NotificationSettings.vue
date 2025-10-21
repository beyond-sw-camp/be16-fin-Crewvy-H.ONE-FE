<template>
  <el-container class="notification-settings-container">
    <el-card class="notification-settings-card">
      <template #header>
        <div class="card-header">
          <span>알림 설정</span>
        </div>
      </template>
      <el-card-body>
        <el-table :data="settings" style="width: 100%">
          <el-table-column prop="type" label="알림 유형"></el-table-column>
          <el-table-column label="활성화">
            <template #default="scope">
              <el-switch
                v-model="scope.row.isActive"
              ></el-switch>
            </template>
          </el-table-column>
        </el-table>
        <div class="save-button-container">
          <el-button type="primary" @click="saveAllSettings">설정 저장</el-button>
        </div>
      </el-card-body>
    </el-card>
  </el-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getNotificationSettings, updateNotificationSetting } from '@/api/notificationService';
import { ElMessage } from 'element-plus'; // Import ElMessage for notifications

export default {
  name: 'NotificationSettings',
  setup() {
    const settings = ref([]);
    const originalSettings = ref([]); // To keep track of initial state for comparison

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
    };
  },
};
</script>

<style scoped>
.notification-settings-container {
  padding: 30px;
}

.notification-settings-card {
  width: 100%; /* Make it take full available width */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.save-button-container {
  margin-top: 20px;
  text-align: right;
}
</style>