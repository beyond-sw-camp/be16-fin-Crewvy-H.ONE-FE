<template>
  <div class="work-schedule-management">
    <div class="page-header">
      <div class="header-content">
        <h1>근무 스케줄 관리</h1>
        <p>직원별 근무 스케줄을 설정하고 관리합니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openScheduleModal">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">스케줄 추가</span>
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="schedule-filters">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="selectedDepartment" placeholder="부서 선택" clearable style="width: 100%;">
            <el-option label="전체 부서" value="" />
            <el-option label="영업부" value="sales" />
            <el-option label="마케팅부" value="marketing" />
            <el-option label="개발부" value="development" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedEmployee" placeholder="직원 선택" clearable style="width: 100%;">
            <el-option label="전체 직원" value="" />
            <el-option label="김철수" value="kim" />
            <el-option label="박민수" value="park" />
            <el-option label="이지은" value="lee" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" :icon="Search">검색</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="schedule-calendar">
      <el-calendar v-model="calendarDate">
        <template #date-cell="{ data }">
          <div class="date-cell-content">
            <span :class="{ 'is-selected': data.isSelected }">{{ data.day.split('-').slice(2).join('-') }}</span>
            <div class="schedules">
              <div 
                v-for="schedule in getSchedulesForDate(data.day)" 
                :key="schedule.id" 
                class="schedule-item"
                :class="schedule.type"
                @click="viewScheduleDetail(schedule)"
              >
                {{ schedule.employee }} ({{ schedule.time }})
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>

    <!-- 스케줄 추가/편집 모달 -->
    <el-dialog
      v-model="showScheduleEditModal"
      :title="editScheduleId ? '스케줄 편집' : '스케줄 추가'"
      width="500px"
    >
      <el-form :model="scheduleForm" label-width="100px">
        <el-form-item label="직원">
          <el-select v-model="scheduleForm.employeeId" placeholder="직원 선택" style="width: 100%;">
            <el-option label="김철수" value="kim" />
            <el-option label="박민수" value="park" />
            <el-option label="이지은" value="lee" />
          </el-select>
        </el-form-item>
        <el-form-item label="날짜">
          <el-date-picker v-model="scheduleForm.date" type="date" placeholder="날짜 선택" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="근무 유형">
          <el-select v-model="scheduleForm.type" placeholder="근무 유형 선택" style="width: 100%;">
            <el-option label="정상 근무" value="normal" />
            <el-option label="오전 근무" value="morning" />
            <el-option label="오후 근무" value="afternoon" />
            <el-option label="재택 근무" value="remote" />
            <el-option label="휴가" value="vacation" />
          </el-select>
        </el-form-item>
        <el-form-item label="시간">
          <el-time-picker
            v-model="scheduleForm.timeRange"
            is-range
            range-separator="~"
            start-placeholder="시작 시간"
            end-placeholder="종료 시간"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="비고">
          <el-input v-model="scheduleForm.notes" type="textarea" :rows="2" placeholder="특이사항 입력" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScheduleEditModal = false">취소</el-button>
        <el-button type="primary" @click="saveSchedule">저장</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';

const calendarDate = ref(new Date());
const selectedDepartment = ref('');
const selectedEmployee = ref('');

const showScheduleEditModal = ref(false);
const editScheduleId = ref(null);
const scheduleForm = ref({
  employeeId: '',
  date: '',
  type: 'normal',
  timeRange: ['09:00', '18:00'],
  notes: '',
});

const schedules = ref([
  { id: 1, employee: '김철수', employeeId: 'kim', date: '2024-01-15', type: 'normal', time: '09:00 ~ 18:00' },
  { id: 2, employee: '박민수', employeeId: 'park', date: '2024-01-15', type: 'remote', time: '09:00 ~ 18:00' },
  { id: 3, employee: '김철수', employeeId: 'kim', date: '2024-01-16', type: 'morning', time: '09:00 ~ 13:00' },
]);

const getSchedulesForDate = (date) => {
  const formattedDate = new Date(date).toISOString().slice(0, 10);
  return schedules.value.filter(s => s.date === formattedDate);
};

const openScheduleModal = (schedule = null) => {
  if (schedule) {
    editScheduleId.value = schedule.id;
    scheduleForm.value = { ...schedule, date: new Date(schedule.date) }; // Convert date string to Date object for el-date-picker
  } else {
    editScheduleId.value = null;
    scheduleForm.value = {
      employeeId: '',
      date: '',
      type: 'normal',
      timeRange: ['09:00', '18:00'],
      notes: '',
    };
  }
  showScheduleEditModal.value = true;
};

const viewScheduleDetail = (schedule) => {
  // For now, just open the edit modal. In a real app, might have a view-only modal.
  openScheduleModal(schedule);
};

const saveSchedule = () => {
  if (editScheduleId.value) {
    // Update existing schedule
    const index = schedules.value.findIndex(s => s.id === editScheduleId.value);
    if (index !== -1) {
      schedules.value[index] = { 
        ...scheduleForm.value, 
        id: editScheduleId.value, 
        date: scheduleForm.value.date.toISOString().slice(0, 10), // Convert Date object back to string
        time: `${scheduleForm.value.timeRange[0]} ~ ${scheduleForm.value.timeRange[1]}`, // Format time
        employee: schedules.value[index].employee // Keep employee name
      };
    }
  } else {
    // Add new schedule
    const newId = schedules.value.length > 0 ? Math.max(...schedules.value.map(s => s.id)) + 1 : 1;
    const employeeName = schedules.value.find(e => e.employeeId === scheduleForm.value.employeeId)?.employee || 'Unknown';
    schedules.value.push({
      id: newId,
      employee: employeeName,
      employeeId: scheduleForm.value.employeeId,
      date: scheduleForm.value.date.toISOString().slice(0, 10),
      type: scheduleForm.value.type,
      time: `${scheduleForm.value.timeRange[0]} ~ ${scheduleForm.value.timeRange[1]}`, // Format time
      notes: scheduleForm.value.notes,
    });
  }
  showScheduleEditModal.value = false;
};

</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
}

.schedule-filters {
  margin-bottom: 20px;
  padding: 20px;
}

.schedule-calendar {
  padding: 20px;
}

.date-cell-content {
  height: 100%;
  padding: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  font-size: 12px;
}

.date-cell-content span.is-selected {
  color: var(--el-color-primary);
}

.schedules {
  width: 100%;
  margin-top: 5px;
  overflow-y: auto;
  max-height: 60px; /* Limit height for schedules in a cell */
}

.schedule-item {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 3px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.schedule-item.normal {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.schedule-item.morning {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}
.schedule-item.afternoon {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}
.schedule-item.remote {
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
}
.schedule-item.vacation {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
</style>
