<template>
  <div class="device-approval-management">
    <div class="content-card">
      <div class="card-header">
        <h3>디바이스 등록 승인 관리</h3>
        <div class="header-stats">
          <el-tag type="warning">승인 대기: {{ pendingCount }}건</el-tag>
        </div>
      </div>

      <div class="filter-section">
        <el-select v-model="statusFilter" placeholder="상태 필터" style="width: 200px;" @change="fetchPendingDevices">
          <el-option label="승인 대기" value="PENDING"></el-option>
          <el-option label="승인됨" value="APPROVED"></el-option>
          <el-option label="반려됨" value="REJECTED"></el-option>
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="디바이스 이름 또는 ID로 검색"
          clearable
          style="width: 300px;"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="fetchPendingDevices">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 4px;">새로고침</span>
        </el-button>
      </div>

      <div class="device-table">
        <el-table :data="filteredDevices" style="width: 100%" v-loading="loading">
          <el-table-column prop="requestId" label="신청 ID" width="100">
            <template #default="scope">
              {{ scope.row.requestId ? scope.row.requestId.substring(0, 8) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="디바이스 이름" width="200"></el-table-column>
          <el-table-column prop="deviceId" label="디바이스 ID" width="250"></el-table-column>
          <el-table-column prop="deviceType" label="타입" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.deviceType === 'MOBILE' ? 'success' : 'primary'" size="small">
                {{ scope.row.deviceType === 'MOBILE' ? '모바일' : '노트북' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="상태" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="신청일시" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="등록 사유" min-width="200">
            <template #default="scope">
              {{ scope.row.reason || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="작업" width="200" align="center" fixed="right">
            <template #default="scope">
              <div v-if="scope.row.status === 'PENDING'" style="display: flex; gap: 8px; justify-content: center;">
                <el-button
                  type="success"
                  size="small"
                  @click="approveDevice(scope.row)">
                  승인
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="rejectDevice(scope.row)">
                  반려
                </el-button>
              </div>
              <span v-else style="color: #909399; font-size: 12px;">
                {{ scope.row.status === 'APPROVED' ? '승인 완료' : '반려됨' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalElements"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { getPendingDevices, approveDevice as approveDeviceAPI, rejectDevice as rejectDeviceAPI } from '@/api/attendance';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'DeviceApprovalManagement',
  components: {
    Search,
    Refresh
  },
  setup() {
    const devices = ref([]);
    const loading = ref(false);
    const statusFilter = ref('PENDING');
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(20);
    const totalElements = ref(0);

    // 디바이스 목록 조회
    const fetchPendingDevices = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        };
        const response = await getPendingDevices(params);
        devices.value = response.content || [];
        totalElements.value = response.totalElements || 0;
      } catch (err) {
        ElMessage.error(err.message || '디바이스 목록 조회에 실패했습니다.');
      } finally {
        loading.value = false;
      }
    };

    // 필터링된 디바이스 목록
    const filteredDevices = computed(() => {
      let filtered = devices.value;

      // 검색어 필터
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(device =>
          device.deviceName?.toLowerCase().includes(query) ||
          device.deviceId?.toLowerCase().includes(query)
        );
      }

      return filtered;
    });

    // 승인 대기 건수
    const pendingCount = computed(() => {
      return devices.value.filter(d => d.status === 'PENDING').length;
    });

    // 디바이스 승인
    const approveDevice = async (device) => {
      try {
        await ElMessageBox.confirm(
          `디바이스 "${device.deviceName}" (${device.deviceId})를 승인하시겠습니까?`,
          '디바이스 승인',
          {
            confirmButtonText: '승인',
            cancelButtonText: '취소',
            type: 'warning'
          }
        );

        await approveDeviceAPI(device.requestId);
        ElMessage.success('디바이스가 승인되었습니다.');
        await fetchPendingDevices();
      } catch (err) {
        if (err !== 'cancel') {
          ElMessage.error(err.message || '디바이스 승인에 실패했습니다.');
        }
      }
    };

    // 디바이스 반려
    const rejectDevice = async (device) => {
      try {
        await ElMessageBox.confirm(
          `디바이스 "${device.deviceName}" (${device.deviceId})를 반려하시겠습니까?`,
          '디바이스 반려',
          {
            confirmButtonText: '반려',
            cancelButtonText: '취소',
            type: 'error'
          }
        );

        await rejectDeviceAPI(device.requestId);
        ElMessage.success('디바이스가 반려되었습니다.');
        await fetchPendingDevices();
      } catch (err) {
        if (err !== 'cancel') {
          ElMessage.error(err.message || '디바이스 반려에 실패했습니다.');
        }
      }
    };

    // 상태 태그 타입
    const getStatusType = (status) => {
      const statusMap = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger'
      };
      return statusMap[status] || 'info';
    };

    // 상태 텍스트
    const getStatusText = (status) => {
      const statusMap = {
        'PENDING': '승인 대기',
        'APPROVED': '승인됨',
        'REJECTED': '반려됨'
      };
      return statusMap[status] || status;
    };

    // 날짜 시간 포맷
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return '-';
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchPendingDevices();
    };

    // 페이지 크기 변경 핸들러
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchPendingDevices();
    };

    onMounted(() => {
      fetchPendingDevices();
    });

    return {
      devices,
      loading,
      statusFilter,
      searchQuery,
      currentPage,
      pageSize,
      totalElements,
      filteredDevices,
      pendingCount,
      fetchPendingDevices,
      approveDevice,
      rejectDevice,
      getStatusType,
      getStatusText,
      formatDateTime,
      handlePageChange,
      handleSizeChange
    };
  }
};
</script>

<style scoped>
.device-approval-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
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

.header-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-section {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: #f8f9fa;
}

.device-table {
  padding: 0 24px 24px;
}

.pagination-section {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
