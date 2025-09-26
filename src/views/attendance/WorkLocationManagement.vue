<template>
  <div class="work-location-management">
    <div class="content-card">
      <div class="card-header">
        <h3>근무지 관리</h3>
        <el-button type="primary" @click="openLocationDialog()">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">새 근무지 추가</span>
        </el-button>
      </div>
      <div class="location-table">
        <el-table :data="locations" style="width: 100%">
          <el-table-column prop="name" label="장소명" width="200" />
          <el-table-column prop="address" label="주소" />
          <el-table-column prop="radius" label="반경 (미터)" width="150" />
          <el-table-column label="작업" width="150">
            <template #default="scope">
              <el-button size="small" @click="openLocationDialog(scope.row)">수정</el-button>
              <el-button size="small" type="danger" @click="deleteLocation(scope.row.id)">삭제</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 근무지 추가/수정 다이얼로그 -->
    <el-dialog v-model="locationDialogVisible" :title="isEditing ? '근무지 수정' : '새 근무지 추가'" width="600px">
      <el-form :model="locationForm" label-position="top">
        <el-form-item label="장소명">
          <el-input v-model="locationForm.name" placeholder="예: 본사, 강남지점"></el-input>
        </el-form-item>
        <el-form-item label="주소">
          <el-input v-model="locationForm.address" placeholder="정확한 주소를 입력하세요"></el-input>
        </el-form-item>
        <el-form-item label="반경 (미터)">
          <el-input-number v-model="locationForm.radius" :min="10" :max="1000" controls-position="right" style="width: 100%;" />
          <p class="form-help-text">해당 주소를 중심으로 출퇴근을 인정할 거리를 미터 단위로 입력하세요. (최소 10m, 최대 1000m)</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="locationDialogVisible = false">취소</el-button>
        <el-button type="primary" @click="saveLocation">저장</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'WorkLocationManagement',
  setup() {
    const { success, error, warning, info } = useSnackbar();

    const locations = ref([
      { id: 1, name: '본사', address: '서울특별시 강남구 테헤란로 123', radius: 100 },
      { id: 2, name: '판교 R&D 센터', address: '경기도 성남시 분당구 판교역로 235', radius: 200 },
      { id: 3, name: '부산 지점', address: '부산광역시 해운대구 우동 1234', radius: 150 },
    ]);

    const locationDialogVisible = ref(false);
    const isEditing = ref(false);
    const locationForm = ref({ id: null, name: '', address: '', radius: 50 });

    const openLocationDialog = (location = null) => {
      if (location) {
        isEditing.value = true;
        locationForm.value = { ...location };
      } else {
        isEditing.value = false;
        locationForm.value = { id: null, name: '', address: '', radius: 50 };
      }
      locationDialogVisible.value = true;
    };

    const saveLocation = () => {
      if (isEditing.value) {
        const index = locations.value.findIndex(loc => loc.id === locationForm.value.id);
        if (index !== -1) {
          locations.value[index] = { ...locationForm.value };
          success('근무지가 성공적으로 수정되었습니다.');
        } else {
          error('근무지 수정에 실패했습니다.');
        }
      } else {
        const newId = Math.max(...locations.value.map(loc => loc.id), 0) + 1;
        locations.value.push({ id: newId, ...locationForm.value });
        success('새 근무지가 성공적으로 추가되었습니다.');
      }
      locationDialogVisible.value = false;
    };

    const deleteLocation = (id) => {
      locations.value = locations.value.filter(loc => loc.id !== id);
      warning('근무지가 삭제되었습니다.');
      // In a real app, you'd show a confirmation dialog first.
    };

    return {
      locations,
      locationDialogVisible,
      isEditing,
      locationForm,
      openLocationDialog,
      saveLocation,
      deleteLocation,
      success, error, warning, info, // Return snackbar functions
    };
  },
};
</script>

<style scoped>
.work-location-management {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.location-table {
  padding: 24px;
}

.form-help-text {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}
</style>
