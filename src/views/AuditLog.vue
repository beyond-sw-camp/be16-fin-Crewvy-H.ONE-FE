<template>
  <div class="audit-log-management">
    <div class="content-card">
      <div class="card-header">
        <h3>감사 로그</h3>
      </div>
      <div class="filter-section">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="시작일"
          end-placeholder="종료일"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-input
          v-model="searchQuery"
          placeholder="사용자 또는 작업 유형 검색"
          clearable
          style="width: 240px;"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="actionTypeFilter" placeholder="작업 유형 필터" clearable>
          <el-option label="정책 변경" value="정책 변경"></el-option>
          <el-option label="근태 기록 수정" value="근태 기록 수정"></el-option>
          <el-option label="계정 잠금 해제" value="계정 잠금 해제"></el-option>
        </el-select>
      </div>
      <div class="audit-log-table">
        <el-table :data="filteredAuditLogs" style="width: 100%">
          <el-table-column prop="timestamp" label="시간" width="180" />
          <el-table-column prop="user" label="사용자" width="150" />
          <el-table-column prop="actionType" label="작업 유형" width="150" />
          <el-table-column prop="target" label="대상" width="150" />
          <el-table-column prop="details" label="상세 내용" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'AuditLog',
  setup() {
    const dateRange = ref([]);
    const searchQuery = ref('');
    const actionTypeFilter = ref('');

    const auditLogs = ref([
      { id: 1, timestamp: '2025-09-24 10:30:00', user: '김관리자', actionType: '정책 변경', target: '연차 정책', details: '연차 부여 기준 수정 (3년 이상: 16일 -> 17일)' },
      { id: 2, timestamp: '2025-09-24 11:15:00', user: '박인사', actionType: '근태 기록 수정', target: '김철수 (2025-09-23)', details: '지각 -> 출근으로 변경' },
      { id: 3, timestamp: '2025-09-24 14:00:00', user: '김관리자', actionType: '근무지 추가', target: '강남 오피스', details: '새 근무지 (강남 오피스) 추가' },
      { id: 4, timestamp: '2025-09-23 09:00:00', user: '이영희', actionType: '계정 잠금 해제', target: '이영희', details: '이메일 인증을 통한 계정 잠금 해제' },
      { id: 5, timestamp: '2025-09-23 16:45:00', user: '박인사', actionType: '정책 변경', target: '기본 근무 정책', details: '휴게 시간 변경 (12:00~13:00 -> 12:30~13:30)' },
    ]);

    const filteredAuditLogs = computed(() => {
      return auditLogs.value.filter(log => {
        const matchesDate = !dateRange.value || dateRange.value.length === 0 || 
                            (log.timestamp >= dateRange.value[0] && log.timestamp <= dateRange.value[1] + ' 23:59:59');
        const matchesSearch = !searchQuery.value || 
                              log.user.includes(searchQuery.value) ||
                              log.actionType.includes(searchQuery.value) ||
                              log.target.includes(searchQuery.value) ||
                              log.details.includes(searchQuery.value);
        const matchesActionType = !actionTypeFilter.value || log.actionType === actionTypeFilter.value;
        
        return matchesDate && matchesSearch && matchesActionType;
      });
    });

    return {
      dateRange,
      searchQuery,
      actionTypeFilter,
      filteredAuditLogs,
    };
  },
};
</script>

<style scoped>
.audit-log-management {
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

.filter-section {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: #f8f9fa;
  flex-wrap: wrap;
}

.audit-log-table {
  padding: 0 24px 24px;
}
</style>
