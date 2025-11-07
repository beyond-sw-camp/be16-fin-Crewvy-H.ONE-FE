<template>
  <el-dialog
    title="직무 선택"
    v-model="dialogVisible"
    width="30%"
    @close="handleClose"
  >
    <div v-if="loading" class="loading-spinner">
      <el-spinner />
    </div>
    <div v-else>
      <el-form>
        <el-form-item label="직무">
          <el-select v-model="selectedPosition" placeholder="직무를 선택하세요" style="width: 100%;">
            <el-option
              v-for="position in positions"
              :key="position.id"
              :label="position.name"
              :value="position.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">취소</el-button>
        <el-button type="primary" @click="changePosition" :disabled="loading">변경</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import apiClient from '@/api';
import { useSnackbar } from '@/composables/useSnackbar';

const emit = defineEmits(['close']);
const { success, error } = useSnackbar();

const dialogVisible = ref(true);
const loading = ref(false);
const positions = ref([]);
const selectedPosition = ref(null);

const fetchPositions = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`/member-service/member/my-positions`);
    const positionData = response.data.data;

    console.log('Fetched positions:', JSON.stringify(positionData, null, 2));

    if (positionData && Array.isArray(positionData)) {
        // Filter out positions where ynDel is true
        positions.value = positionData.filter(p => !p.ynDel);
    } else {
        console.error("Invalid data structure for positions", response.data);
        error('직무 목록의 데이터 형식이 올바르지 않습니다.');
    }
    selectedPosition.value = localStorage.getItem('memberPositionId');
  } catch (err) {
    console.error("Failed to fetch positions:", err);
    error('직무 목록을 불러오는 데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

const changePosition = async () => {
  if (!selectedPosition.value) {
    error('직무를 선택해주세요.');
    return;
  }
  loading.value = true;
  try {
    const response = await apiClient.post(`/member-service/member/${selectedPosition.value}/select`);
    
    const { accessToken, memberPositionId } = response.data.data;

    if (accessToken && memberPositionId) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('memberPositionId', memberPositionId);
      
      success('직무가 성공적으로 변경되었습니다. 페이지를 새로고침합니다.');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      error('응답 데이터가 올바르지 않습니다.');
    }

  } catch (err) {
    console.error("Failed to change position:", err);
    error('직무 변경에 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('close');
};

onMounted(() => {
  fetchPositions();
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}
</style>
