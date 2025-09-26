<template>
  <div class="shared-calendar-page">
    <div class="content-card">
      <div class="card-header">
        <h3>공유 캘린더</h3>
        <el-button type="primary" @click="openEventDialog()">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">일정 추가</span>
        </el-button>
      </div>
      <div class="calendar-controls-top">
        <el-radio-group v-model="calendarView" size="small">
          <el-radio-button label="month">월</el-radio-button>
          <el-radio-button label="week">주</el-radio-button>
        </el-radio-group>
        <div class="date-navigator">
          <el-button-group>
            <el-button :icon="ArrowLeft" @click="navigateCalendar(-1)"></el-button>
            <el-button @click="goToToday">오늘</el-button>
            <el-button :icon="ArrowRight" @click="navigateCalendar(1)"></el-button>
          </el-button-group>
          <span class="current-date-display">{{ currentCalendarDisplay }}</span>
        </div>
        <el-select v-model="filterType" placeholder="유형 필터" clearable style="width: 120px;">
          <el-option label="모든 일정" value="all"></el-option>
          <el-option label="회의" value="meeting"></el-option>
          <el-option label="예약" value="reservation"></el-option>
          <el-option label="휴가" value="vacation"></el-option>
          <el-option label="출장" value="businessTrip"></el-option>
        </el-select>
      </div>

      <div class="calendar-grid-container">
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="calendar-days">
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            class="calendar-day"
            :class="{ 
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'has-events': day.events.length > 0
            }"
            @dblclick="openEventDialog(day.date)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-events">
              <div 
                v-for="event in day.events.slice(0, 2)" 
                :key="event.id"
                class="event-item"
                :class="event.type"
                @click="viewEvent(event)"
              >
                {{ event.title }}
              </div>
              <div v-if="day.events.length > 2" class="more-events">
                +{{ day.events.length - 2 }}개 더
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 추가/수정 다이얼로그 -->
    <el-dialog
      v-model="eventDialogVisible"
      :title="isEditingEvent ? '일정 수정' : '새 일정 추가'"
      width="500px"
      :before-close="handleEventDialogClose"
    >
      <el-form :model="eventForm" label-width="80px">
        <el-form-item label="제목">
          <el-input v-model="eventForm.title" placeholder="일정 제목을 입력" />
        </el-form-item>
        <el-form-item label="날짜">
          <el-date-picker
            v-model="eventForm.date"
            type="date"
            placeholder="날짜 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="시간">
          <el-time-picker
            v-model="eventForm.time"
            placeholder="시간 선택"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="유형">
          <el-select v-model="eventForm.type" placeholder="유형 선택" style="width: 100%;">
            <el-option 
              v-for="type in eventTypes" 
              :key="type.value" 
              :label="type.label" 
              :value="type.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="참여자">
          <el-select v-model="eventForm.participants" multiple placeholder="참여자 선택" style="width: 100%;">
            <el-option label="김철수" value="김철수"></el-option>
            <el-option label="이영희" value="이영희"></el-option>
            <el-option label="박민준" value="박민준"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEventDialogClose">취소</el-button>
          <el-button v-if="isEditingEvent" type="danger" @click="deleteEvent">삭제</el-button>
          <el-button type="primary" @click="saveEvent">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { ArrowLeft, ArrowRight, Plus } from '@element-plus/icons-vue';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'SharedCalendar',
  components: { Plus },
  setup() {
    const { success, warning, error } = useSnackbar();

    const calendarView = ref('month'); // 'month' or 'week'
    const currentCalendarDate = ref(new Date());
    const filterType = ref('all');

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const eventTypes = [
      { label: '회의', value: 'meeting' },
      { label: '예약', value: 'reservation' },
      { label: '휴가', value: 'vacation' },
      { label: '출장', value: 'businessTrip' },
    ];

    const events = ref([
      { id: 1, title: '주간 팀 미팅', date: '2025-09-20', time: '14:00', type: 'meeting', participants: ['김철수', '이영희'] },
      { id: 2, title: '회의실 예약', date: '2025-09-22', time: '10:00', type: 'reservation', participants: ['박민준'] },
      { id: 3, title: '김철수 휴가', date: '2025-09-25', time: '09:00', type: 'vacation', participants: ['김철수'] },
      { id: 4, title: '프로젝트 마감', date: '2025-09-30', time: '18:00', type: 'meeting', participants: [] },
      { id: 5, title: '박민준 출장', date: '2025-09-26', time: '09:00', type: 'businessTrip', participants: ['박민준'] },
    ]);

    const eventDialogVisible = ref(false);
    const isEditingEvent = ref(false);
    const eventForm = ref({
      id: null,
      title: '',
      date: '',
      time: '09:00',
      type: 'meeting',
      participants: [],
    });

    const currentCalendarDisplay = computed(() => {
      const year = currentCalendarDate.value.getFullYear();
      const month = currentCalendarDate.value.getMonth();
      if (calendarView.value === 'month') {
        return `${year}년 ${month + 1}월`;
      } else {
        // For week view, show start and end date of the week
        const startOfWeek = new Date(currentCalendarDate.value);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Go to Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.getMonth() + 1}월 ${startOfWeek.getDate()}일 - ${endOfWeek.getMonth() + 1}월 ${endOfWeek.getDate()}일`;
      }
    });

    const filteredEvents = computed(() => {
      if (filterType.value === 'all') return events.value;
      return events.value.filter(event => event.type === filterType.value);
    });

    const calendarDays = computed(() => {
      const year = currentCalendarDate.value.getFullYear();
      const month = currentCalendarDate.value.getMonth();
      const today = new Date();

      let startDate;
      if (calendarView.value === 'month') {
        const firstDayOfMonth = new Date(year, month, 1);
        startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Go to Sunday of the first week
      } else { // week view
        startDate = new Date(currentCalendarDate.value);
        startDate.setDate(startDate.getDate() - currentCalendarDate.value.getDay()); // Go to Sunday of the current week
      }

      const days = [];
      const numDays = calendarView.value === 'month' ? 42 : 7; // 6 weeks for month, 1 week for week

      for (let i = 0; i < numDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateStr = formatLocalDate(date);
        const dayEvents = filteredEvents.value.filter(event => event.date === dateStr);
        
        days.push({
          date: dateStr,
          day: date.getDate(),
          currentMonth: calendarView.value === 'month' ? date.getMonth() === month : true, // Always true for week view
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        });
      }
      return days;
    });

    const formatLocalDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const navigateCalendar = (direction) => {
      if (calendarView.value === 'month') {
        currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth() + direction, 1);
      } else { // week view
        currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth(), currentCalendarDate.value.getDate() + (direction * 7));
      }
    };

    const goToToday = () => {
      currentCalendarDate.value = new Date();
    };

    const openEventDialog = (date = null, event = null) => {
      if (event) {
        isEditingEvent.value = true;
        eventForm.value = { ...event };
      } else {
        isEditingEvent.value = false;
        eventForm.value = {
          id: null,
          title: '',
          date: date ? formatLocalDate(new Date(date)) : formatLocalDate(new Date()),
          time: '09:00',
          type: 'meeting',
          participants: [],
        };
      }
      eventDialogVisible.value = true;
    };

    const handleEventDialogClose = () => {
      eventDialogVisible.value = false;
      eventForm.value = {
        id: null,
        title: '',
        date: '',
        time: '09:00',
        type: 'meeting',
        participants: [],
      };
    };

    const saveEvent = () => {
      if (!eventForm.value.title || !eventForm.value.date || !eventForm.value.type) {
        warning('필수 항목을 입력해주세요.');
        return;
      }

      if (isEditingEvent.value) {
        const index = events.value.findIndex(e => e.id === eventForm.value.id);
        if (index !== -1) {
          events.value[index] = { ...eventForm.value };
          success('일정이 성공적으로 수정되었습니다.');
        } else {
          error('일정 수정에 실패했습니다.');
        }
      } else {
        const newId = Math.max(...events.value.map(e => e.id), 0) + 1;
        events.value.push({ ...eventForm.value, id: newId });
        success('새 일정이 성공적으로 추가되었습니다.');
      }
      handleEventDialogClose();
    };

    const deleteEvent = () => {
      if (confirm('정말로 이 일정을 삭제하시겠습니까?')) {
        events.value = events.value.filter(e => e.id !== eventForm.value.id);
        warning('일정이 삭제되었습니다.');
        handleEventDialogClose();
      }
    };

    const viewEvent = (event) => {
      openEventDialog(null, event);
    };

    return {
      calendarView,
      currentCalendarDisplay,
      filterType,
      weekdays,
      eventTypes,
      calendarDays,
      eventDialogVisible,
      isEditingEvent,
      eventForm,
      ArrowLeft,
      ArrowRight,
      Plus,
      navigateCalendar,
      goToToday,
      openEventDialog,
      handleEventDialogClose,
      saveEvent,
      deleteEvent,
      viewEvent,
    };
  },
};
</script>

<style scoped>
.shared-calendar-page {
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

.calendar-controls-top {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.date-navigator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-date-display {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  text-align: center;
}

.calendar-grid-container {
  padding: 24px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 8px;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  background: white;
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:nth-last-child(-n + 7) {
  border-bottom: none;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #909399;
}

.calendar-day.today {
  background: #f0f9ff;
  border: 2px solid #4f46e5;
}

.calendar-day.has-events {
  background: white;
}

.day-number {
  font-weight: 600;
  margin-bottom: 4px;
  color: #2c3e50;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item.meeting {
  background: #dbeafe;
  color: #1e40af;
}

.event-item.reservation {
  background: #dcfce7;
  color: #166534;
}

.event-item.vacation {
  background: #fef3c7;
  color: #92400e;
}

.event-item.businessTrip {
  background: #ffe4e6;
  color: #be123c;
}

.more-events {
  font-size: 10px;
  color: #606266;
  font-style: italic;
}

.dialog-footer {
  text-align: right;
}
</style>
