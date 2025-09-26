<template>
  <el-dialog
    v-model="localVisible"
    :title="`${selectedDate} 팀 일정`"
    width="800px"
    :before-close="handleClose"
  >
    <div class="daily-schedule-modal">
      <div class="time-slots-header">
        <div class="time-slot" v-for="hour in hoursOfDay" :key="hour">
          {{ hour }}:00
        </div>
      </div>
      <div class="team-schedules">
        <div class="team-member-row" v-for="member in teamMembers" :key="member.id">
          <div class="member-name">{{ member.name }}</div>
          <div class="schedule-timeline">
            <div 
              v-for="event in getMemberEvents(member.id)" 
              :key="event.id"
              class="event-block"
              :style="getEventBlockStyle(event)"
              :class="event.type"
              @click="viewEventDetail(event)"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">닫기</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'DailyScheduleModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    selectedDate: {
      type: String,
      required: true,
    },
    events: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value),
    });

    const hoursOfDay = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

    const teamMembers = ref([
      { id: 1, name: '김철수' },
      { id: 2, name: '이영희' },
      { id: 3, name: '박민준' },
      { id: 4, name: '최지우' },
    ]);

    const getMemberEvents = (memberId) => {
      return props.events.filter(event => event.participants.includes(teamMembers.value.find(m => m.id === memberId)?.name));
    };

    const getEventBlockStyle = (event) => {
      const startTime = new Date(`${props.selectedDate}T${event.time}`);
      const durationMinutes = 60; // Assuming 1 hour duration for simplicity
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();

      // Calculate position and width based on a 24-hour timeline
      // Each hour is 100% / 24 = 4.166% of the total width
      const left = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
      const width = (durationMinutes / (24 * 60)) * 100;

      return {
        left: `${left}%`,
        width: `${width}%`,
      };
    };

    const viewEventDetail = (event) => {
      alert(`이벤트 상세: ${event.title} (${event.time})`);
      // 실제로는 상세 모달을 띄우거나 페이지 이동
    };

    const handleClose = () => {
      localVisible.value = false;
    };

    return {
      localVisible,
      hoursOfDay,
      teamMembers,
      getMemberEvents,
      getEventBlockStyle,
      viewEventDetail,
      handleClose,
    };
  },
};
</script>

<style scoped>
.daily-schedule-modal {
  padding: 10px;
}

.time-slots-header {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.time-slot {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding: 5px 0;
  border-left: 1px dashed #ebeef5;
}

.time-slot:first-child {
  border-left: none;
}

.team-schedules {
  display: flex;
  flex-direction: column;
}

.team-member-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0;
}

.team-member-row:last-child {
  border-bottom: none;
}

.member-name {
  width: 80px;
  font-weight: 600;
  color: #2c3e50;
  flex-shrink: 0;
}

.schedule-timeline {
  flex: 1;
  position: relative;
  height: 30px; /* Fixed height for the timeline */
  background-color: #f8f9fa;
  border-radius: 4px;
}

.event-block {
  position: absolute;
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  padding: 0 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  box-sizing: border-box;
}

.event-block.meeting {
  background-color: #409EFF; /* Element Plus Primary */
}

.event-block.reservation {
  background-color: #67C23A; /* Element Plus Success */
}

.event-block.vacation {
  background-color: #E6A23C; /* Element Plus Warning */
}

.event-block.businessTrip {
  background-color: #F56C6C; /* Element Plus Danger */
}
</style>