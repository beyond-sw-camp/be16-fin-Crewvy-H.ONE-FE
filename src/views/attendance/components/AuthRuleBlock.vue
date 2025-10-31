<template>
  <div class="rule-block">
    <el-form-item label="허용 근무지">
      <div class="select-actions">
        <el-button size="small" @click="selectAll" :disabled="workLocations.length === 0">전체 선택</el-button>
        <el-button size="small" @click="clearAll">전체 해제</el-button>
      </div>
      <el-select
        v-model="localSelectedIds"
        multiple
        collapse-tags
        collapse-tags-tooltip
        clearable
        placeholder="근무지를 선택하세요"
        style="width: 100%;"
        :loading="loading"
        @change="handleSelectionChange"
      >
        <el-option
          v-for="location in workLocations"
          :key="location.workLocationId"
          :label="location.name"
          :value="location.workLocationId"
        >
          <div class="location-option">
            <span class="location-name">{{ location.name }}</span>
            <span class="location-address">{{ location.address }}</span>
          </div>
        </el-option>
      </el-select>
      <div class="form-help-text">
        출장지, 지점 등 출퇴근을 허용할 근무지를 선택하세요.
        근무지는 <router-link to="/work-locations" style="color: #409eff;">근무지 관리</router-link>에서 추가할 수 있습니다.
      </div>
    </el-form-item>

    <el-form-item label="필수 인증 방식">
      <el-checkbox-group v-model="rule.requiredAuthTypes">
        <el-checkbox label="GPS">GPS 위치 인증</el-checkbox>
        <el-checkbox label="IP">IP 주소 인증</el-checkbox>
        <el-checkbox label="WIFI">WiFi 네트워크 인증</el-checkbox>
      </el-checkbox-group>
      <div class="form-help-text">
        선택한 모든 인증 방식을 만족해야 출퇴근이 가능합니다. (AND 조건)
      </div>
    </el-form-item>

    <!-- 선택된 근무지 미리보기 -->
    <div v-if="selectedLocations.length > 0" class="selected-locations-preview">
      <h4>선택된 근무지 ({{ selectedLocations.length }}곳)</h4>
      <div class="location-cards">
        <el-card
          v-for="location in selectedLocations"
          :key="location.workLocationId"
          class="location-card"
          shadow="hover"
        >
          <div class="location-card-header">
            <strong>{{ location.name }}</strong>
            <el-button
              type="danger"
              size="small"
              text
              @click="removeLocation(location.workLocationId)"
            >
              <el-icon><CloseBold /></el-icon>
            </el-button>
          </div>
          <div class="location-detail" v-if="location.address">
            <el-icon><LocationFilled /></el-icon>
            <span>{{ location.address }}</span>
          </div>
          <div class="location-detail" v-if="location.latitude && location.longitude">
            <el-icon><Position /></el-icon>
            <span>GPS: {{ location.latitude }}, {{ location.longitude }} (반경 {{ location.gpsRadius }}m)</span>
          </div>
          <div class="location-detail" v-if="location.ipAddress">
            <el-icon><Connection /></el-icon>
            <span>IP: {{ location.ipAddress }}</span>
          </div>
          <div class="location-detail" v-if="location.wifiSsid">
            <el-icon><Connection /></el-icon>
            <span>WiFi: {{ location.wifiSsid }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <el-alert
      v-if="!rule.allowedWorkLocationIds || rule.allowedWorkLocationIds.length === 0"
      title="근무지를 선택해주세요"
      type="warning"
      :closable="false"
      style="margin-top: 10px;"
    >
      허용 근무지를 선택하지 않으면 모든 위치에서 출퇴근이 제한됩니다.
    </el-alert>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch} from 'vue';
import { getActiveWorkLocations } from '@/api/attendance';
import { ElMessage } from 'element-plus';
import { CloseBold, LocationFilled, Position, Connection } from '@element-plus/icons-vue';

export default {
  name: 'AuthRuleBlock',
  components: {
    CloseBold,
    LocationFilled,
    Position,
    Connection
  },
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const loading = ref(false);
    const workLocations = ref([]);
    const localSelectedIds = ref([]);

    const rule = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    // 선택된 근무지 정보
    const selectedLocations = computed(() => {
      if (!Array.isArray(rule.value.allowedWorkLocationIds) || rule.value.allowedWorkLocationIds.length === 0) {
        return [];
      }
      return workLocations.value.filter(loc =>
        rule.value.allowedWorkLocationIds.includes(loc.workLocationId)
      );
    });

    // 근무지 목록 조회
    const fetchWorkLocations = async () => {
      loading.value = true;
      try {
        const data = await getActiveWorkLocations();
        workLocations.value = data;
      } catch (err) {
        ElMessage.error(err.message || '근무지 목록을 불러오는 데 실패했습니다.');
      } finally {
        loading.value = false;
      }
    };

    // 전체 선택
    const selectAll = () => {
      const updatedIds = workLocations.value.map(loc => loc.workLocationId);
      emit('update:modelValue', { ...rule.value, allowedWorkLocationIds: updatedIds });
      ElMessage.success(`모든 근무지(${workLocations.value.length}곳)가 선택되었습니다.`);
    };

    // 전체 해제
    const clearAll = () => {
      emit('update:modelValue', { ...rule.value, allowedWorkLocationIds: [] });
      ElMessage.info('모든 근무지 선택이 해제되었습니다.');
    };

    // 근무지 제거
    const removeLocation = (locationId) => {
      const updatedIds = rule.value.allowedWorkLocationIds.filter(id => id !== locationId);
      emit('update:modelValue', { ...rule.value, allowedWorkLocationIds: updatedIds });
    };
    // el-select 변경 핸들러
    const handleSelectionChange = (selectedIds) => {
      emit('update:modelValue', { ...rule.value, allowedWorkLocationIds: selectedIds });
    };

    // 초기화: 기본값 설정
    onMounted(async () => {
      // 기본값 설정
      const updates = {};
      if (!rule.value.allowedWorkLocationIds) {
        updates.allowedWorkLocationIds = [];
      }
      if (!rule.value.requiredAuthTypes) {
        updates.requiredAuthTypes = ['GPS']; // 기본값: GPS
      }
      if (Object.keys(updates).length > 0) {
        emit('update:modelValue', { ...rule.value, ...updates });
      }

      await fetchWorkLocations();
    });
    // props.modelValue 변경 감지하여 localSelectedIds 동기화
    watch(() => props.modelValue?.allowedWorkLocationIds, (newIds) => {
      if (Array.isArray(newIds)) {
        localSelectedIds.value = [...newIds];
      } else {
        localSelectedIds.value = [];
      }
    }, { immediate: true, deep: true });

    return {
      loading,
      workLocations,
      rule,
      selectedLocations,
      selectAll,
      clearAll,
      removeLocation,
      localSelectedIds,
      handleSelectionChange,
    };
  }
};
</script>

<style scoped>
.rule-block {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 10px;
}

.select-actions {
  margin-bottom: 10px;
  display: flex;
  gap: 8px;
}

.form-help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.location-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.location-name {
  font-weight: 500;
}

.location-address {
  font-size: 12px;
  color: #909399;
}

.selected-locations-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.selected-locations-preview h4 {
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.location-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.location-card {
  font-size: 13px;
}

.location-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.location-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #606266;
}

.location-detail .el-icon {
  color: #909399;
}
</style>
