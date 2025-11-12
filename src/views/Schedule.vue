<template>
  <div class="schedule-page">
    <div class="content-card">
      <div class="card-header">
        <h2>{{ viewType === 'week' ? '이번 주 일정' : '월간 일정' }}</h2>
        <div style="display: flex; gap: 12px; align-items: center;">
          <el-select v-model="viewType" @change="handleViewChange" style="width: 120px;">
            <el-option label="주간" value="week"></el-option>
            <el-option label="월간" value="month"></el-option>
          </el-select>
          <el-button type="primary" @click="addEvent">
            <el-icon style="margin-right: 6px;"><CirclePlus /></el-icon>
            일정 추가
          </el-button>
        </div>
      </div>

      <!-- 주간 뷰 -->
      <div v-if="viewType === 'week'" class="weekly-schedule-list">
        <div class="schedule-day" v-for="day in weeklySchedule" :key="day.date">
          <div class="day-header">
            <span class="day-name">{{ day.dayName }}</span>
            <span class="day-date">{{ day.date }}</span>
          </div>
          <div class="day-events">
            <div v-if="day.events.length === 0" class="no-events">일정 없음</div>
            <template v-else>
              <div 
                class="event-item" 
                v-for="event in day.events" 
                :key="event.id"
                @click="viewEvent(event)"
                style="cursor: pointer;"
              >
                <div class="event-time">{{ event.time }}</div>
                <div class="event-title">{{ event.title }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 월간 뷰 -->
      <div v-else class="calendar-view">
        <div class="calendar-header-controls">
          <div class="calendar-controls">
            <el-button @click="prevMonth" circle>
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <h3>{{ currentMonthYear }}</h3>
            <el-button @click="nextMonth" circle>
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="calendar-grid">
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
              @dblclick="addEvent(day.date)"
            >
              <div class="day-number">{{ day.day }}</div>
              <div class="day-events">
                <div 
                  v-for="event in day.events.slice(0, 3)" 
                  :key="event.id" 
                  class="event-item" 
                  :class="event.type"
                  @click="viewEvent(event)"
                >
                  {{ event.title }}
                </div>
                <div v-if="day.events.length > 3" class="more-events" @click="showAllEvents(day)">
                  +{{ day.events.length - 3 }}개 더
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-color meeting"></div>
            <span>화상회의</span>
          </div>
          <div class="legend-item">
            <div class="legend-color reservation"></div>
            <span>예약</span>
          </div>
          <div class="legend-item">
            <div class="legend-color vacation"></div>
            <span>휴가</span>
          </div>
          <div class="legend-item">
            <div class="legend-color businessTrip"></div>
            <span>출장</span>
          </div>
          <div class="legend-item">
            <div class="legend-color personal"></div>
            <span>개인일정</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 전체 보기 다이얼로그 (월간 뷰용) -->
    <el-dialog 
      v-model="showAllEventsDialog" 
      width="680px"
      class="all-events-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="custom-dialog-header">
          <h3 class="header-title">{{ selectedDayTitle }}</h3>
        </div>
      </template>
      <div class="all-events-list">
        <div v-if="selectedDayEvents.length === 0" class="no-events">
          <div class="empty-state">
            <el-icon class="empty-icon"><Calendar /></el-icon>
            <h3 class="empty-title">일정이 없습니다</h3>
            <p class="empty-description">이 날짜에는 등록된 일정이 없습니다.</p>
          </div>
        </div>
        <div v-else class="events-container">
          <div v-for="event in selectedDayEvents" :key="event.id" class="full-event-item" :class="event.type" @click="viewEvent(event)">
            <div class="event-indicator"></div>
            <div class="event-content">
              <div class="event-top">
                <span class="event-type-badge" :class="event.type">
                  <span class="badge-dot"></span>
                  {{ getEventTypeName(event.typeName) }}
                </span>
                <div class="event-time-wrapper" v-if="event.time">
                  <el-icon class="time-icon"><Clock /></el-icon>
                  <span class="event-time">{{ event.time }}</span>
                </div>
              </div>
              <h4 class="event-title">{{ event.title }}</h4>
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-custom">
          <el-button @click="showAllEventsDialog = false" size="large" class="close-btn">
            닫기
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 일정 상세 보기 다이얼로그 -->
    <el-dialog 
      v-model="showEventDetailDialog" 
      :title="eventDetailTitle" 
      width="520px"
      class="event-dialog"
      :append-to-body="true"
    >
      <div v-if="!isEditingEvent" class="event-detail-view">
        <div class="detail-section" v-if="selectedEvent.typeName">
          <label class="detail-label">
            <el-icon><Notebook /></el-icon>
            유형
          </label>
          <div class="detail-content">
            <el-tag :type="getEventTagType(selectedEvent.typeName)" size="large">
              {{ selectedEvent.typeName }}
            </el-tag>
          </div>
        </div>
        <div class="detail-section">
          <label class="detail-label">
            <el-icon><Document /></el-icon>
            제목
          </label>
          <div class="detail-content">{{ selectedEvent.title }}</div>
        </div>
        <div class="detail-section" v-if="selectedEvent.contents">
          <label class="detail-label">
            <el-icon><Tickets /></el-icon>
            상세내용
          </label>
          <div class="detail-content">{{ selectedEvent.contents }}</div>
        </div>
        <div class="detail-section">
          <label class="detail-label">
            <el-icon><Clock /></el-icon>
            일정 기간
          </label>
          <div class="detail-content datetime-content">
            {{ formatDateTime(selectedEvent.startDate) }} <span class="datetime-separator">~</span> {{ formatDateTime(selectedEvent.endDate) }}
          </div>
        </div>
      </div>
      <el-form v-else label-width="100px" class="event-form">
        <el-form-item label="제목" required>
          <el-input 
            v-model="editEventForm.title" 
            placeholder="일정 제목을 입력하세요"
            clearable
          />
        </el-form-item>
        <el-form-item label="상세내용">
          <el-input 
            v-model="editEventForm.contents" 
            type="textarea" 
            :rows="4"
            placeholder="일정에 대한 상세 내용을 입력하세요"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="시작 날짜" required>
          <div style="display: flex; gap: 24px;">
            <el-date-picker 
              v-model="editEventForm.startDate" 
              type="date" 
              placeholder="시작 날짜 선택" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="flex: 1;"
              :teleported="false"
            />
            <el-time-picker 
              v-model="editEventForm.startTime" 
              placeholder="시간" 
              format="HH:mm"
              value-format="HH:mm"
              style="width: 140px;"
              :teleported="false"
            />
          </div>
        </el-form-item>
        <el-form-item label="종료 날짜" required>
          <div style="display: flex; gap: 24px;">
            <el-date-picker 
              v-model="editEventForm.endDate" 
              type="date" 
              placeholder="종료 날짜 선택" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="flex: 1;"
              :teleported="false"
            />
            <el-time-picker 
              v-model="editEventForm.endTime" 
              placeholder="시간" 
              format="HH:mm"
              value-format="HH:mm"
              style="width: 140px;"
              :teleported="false"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div v-if="!isEditingEvent" class="detail-footer">
          <div v-if="canEditEvent">
            <el-button type="danger" @click="deleteEvent" size="large">
              <el-icon style="margin-right: 6px;"><Delete /></el-icon>
              삭제
            </el-button>
          </div>
          <div v-else></div>
          <div>
            <el-button @click="showEventDetailDialog = false" size="large">닫기</el-button>
            <el-button v-if="canEditEvent" type="primary" @click="startEditEvent" size="large">
              <el-icon style="margin-right: 6px;"><Edit /></el-icon>
              수정
            </el-button>
          </div>
        </div>
        <div v-else>
          <el-button @click="cancelEditEvent" size="large">취소</el-button>
          <el-button type="primary" @click="updateEvent" size="large">
            <el-icon style="margin-right: 6px;"><CircleCheck /></el-icon>
            저장
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 일정 추가 다이얼로그 -->
    <el-dialog
      v-model="showEventDialog"
      title="일정 추가"
      width="520px"
      class="event-dialog"
      :append-to-body="true"
      :before-close="handleEventDialogClose"
    >
      <el-form label-width="100px" class="event-form">
        <el-form-item label="제목" required>
          <el-input 
            v-model="eventForm.title" 
            placeholder="일정 제목을 입력하세요"
            clearable
          />
        </el-form-item>
        <el-form-item label="상세내용">
          <el-input 
            v-model="eventForm.contents" 
            type="textarea" 
            :rows="4"
            placeholder="일정에 대한 상세 내용을 입력하세요"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="시작 날짜" required>
          <div style="display: flex; gap: 24px;">
            <el-date-picker 
              v-model="eventForm.startDate" 
              type="date" 
              placeholder="시작 날짜 선택" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="flex: 1;"
              :teleported="false"
            />
            <el-time-picker 
              v-model="eventForm.startTime" 
              placeholder="시간" 
              format="HH:mm"
              value-format="HH:mm"
              style="width: 140px;"
              :teleported="false"
            />
          </div>
        </el-form-item>
        <el-form-item label="종료 날짜" required>
          <div style="display: flex; gap: 24px;">
            <el-date-picker 
              v-model="eventForm.endDate" 
              type="date" 
              placeholder="종료 날짜 선택" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="flex: 1;"
              :teleported="false"
            />
            <el-time-picker 
              v-model="eventForm.endTime" 
              placeholder="시간" 
              format="HH:mm"
              value-format="HH:mm"
              style="width: 140px;"
              :teleported="false"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleEventDialogClose" size="large">취소</el-button>
        <el-button type="primary" @click="saveEvent" size="large">
          <el-icon style="margin-right: 6px;"><CircleCheck /></el-icon>
          저장
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import apiClient from '@/api/http'
import { Notebook, Document, Tickets, Clock, Delete, Edit, CircleCheck, ArrowLeft, ArrowRight, Calendar, CirclePlus } from '@element-plus/icons-vue'

export default {
  name: 'SchedulePage',
  components: {
    Notebook,
    Document,
    Tickets,
    Clock,
    Delete,
    Edit,
    CircleCheck,
    ArrowLeft,
    ArrowRight,
    Calendar,
    CirclePlus
  },
  data() {
    return {
      viewType: 'week', // 'week' or 'month'
      weeklySchedule: [],
      events: [],
      currentDate: new Date(),
      weekdays: ['일', '월', '화', '수', '목', '금', '토'],
      showEventDetailDialog: false,
      showAllEventsDialog: false,
      showEventDialog: false,
      selectedEvent: {},
      selectedDayEvents: [],
      selectedDayTitle: '',
      isEditingEvent: false,
      eventForm: {
        title: '',
        contents: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      },
      editEventForm: {
        id: null,
        title: '',
        contents: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      }
    }
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long'
      })
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const today = new Date()

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dateStr = this.formatLocalDate(date)
        const dayEvents = this.events.filter(event => event.date === dateStr)
        
        // 시간 순서대로 정렬
        const sortedEvents = dayEvents.sort((a, b) => {
          // 시간 문자열이 있는 경우 시간으로 비교
          if (a.time && b.time) {
            const timeA = a.time.split(':').map(Number)
            const timeB = b.time.split(':').map(Number)
            const timeValueA = timeA[0] * 60 + timeA[1]
            const timeValueB = timeB[0] * 60 + timeB[1]
            return timeValueA - timeValueB
          }
          // 시간이 없으면 startDate로 비교
          const dateA = new Date(a.startDate).getTime()
          const dateB = new Date(b.startDate).getTime()
          return dateA - dateB
        })

        days.push({
          date: dateStr,
          day: date.getDate(),
          currentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events: sortedEvents
        })
      }

      return days
    },
    eventDetailTitle() {
      return this.isEditingEvent ? '일정 수정' : '일정 상세';
    },
    canEditEvent() {
      return this.selectedEvent.typeName === '개인일정' || this.selectedEvent.type === 'personal';
    }
  },
  methods: {
    handleViewChange() {
      if (this.viewType === 'week') {
        this.fetchWeeklySchedule()
      } else if (this.viewType === 'month') {
        this.fetchMonthlySchedule()
      }
    },
    async fetchWeeklySchedule() {
      try {
        const response = await apiClient.get('/workspace-service/calendar/find-my-schedule', {
          params: {
            searchType: 'Week'
          }
        })
        
        let scheduleData = []
        
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            scheduleData = response.data.data
          } else if (Array.isArray(response.data)) {
            scheduleData = response.data
          }
        }
        
        const today = new Date()
        const dayOfWeek = today.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)
        
        const weekDays = ['월', '화', '수', '목', '금']
        const weeklyData = []
        
        for (let i = 0; i < 5; i++) {
          const currentDay = new Date(monday)
          currentDay.setDate(monday.getDate() + i)
          
          const dateStr = String(currentDay.getDate()).padStart(2, '0')
          const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`
          
          weeklyData.push({
            date: dateStr,
            dayName: weekDays[i],
            dateKey: dateKey,
            events: []
          })
        }
        
        scheduleData.forEach((item, index) => {
          if (!item.startDate) return
          
          const startDateTime = new Date(item.startDate)
          const endDateTime = item.endDate ? new Date(item.endDate) : startDateTime
          
          const startDateKey = `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`
          const endDateKey = `${endDateTime.getFullYear()}-${String(endDateTime.getMonth() + 1).padStart(2, '0')}-${String(endDateTime.getDate()).padStart(2, '0')}`
          
          const currentDate = new Date(startDateTime)
          currentDate.setHours(0, 0, 0, 0)
          const endDate = new Date(endDateTime)
          endDate.setHours(0, 0, 0, 0)
          
          while (currentDate <= endDate) {
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
            
            const dayData = weeklyData.find(day => day.dateKey === dateKey)
            
            if (dayData) {
              let timeStr = ''
              
              if (dateKey === startDateKey) {
                timeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`
              } else {
                timeStr = '00:00'
              }
              
              dayData.events.push({
                id: `${item.scheduleId || index}-${dateKey}`,
                scheduleId: item.scheduleId,
                time: timeStr,
                title: item.title || '제목 없음',
                contents: item.contents || '',
                typeName: item.typeName || '',
                startDate: item.startDate,
                endDate: item.endDate,
                isMultiDay: dateKey !== startDateKey && dateKey !== endDateKey,
                isStartDate: dateKey === startDateKey,
                isEndDate: dateKey === endDateKey,
                type: this.mapTypeNameToCalendarType(item.typeName)
              })
            }
            
            currentDate.setDate(currentDate.getDate() + 1)
          }
        })
        
        weeklyData.forEach(day => {
          day.events.sort((a, b) => {
            // 시간 문자열이 있는 경우 시간으로 비교
            if (a.time && b.time) {
              const timeA = a.time.split(':').map(Number)
              const timeB = b.time.split(':').map(Number)
              const timeValueA = timeA[0] * 60 + timeA[1]
              const timeValueB = timeB[0] * 60 + timeB[1]
              return timeValueA - timeValueB
            }
            // 시간이 없으면 startDate로 비교
            const dateA = new Date(a.startDate).getTime()
            const dateB = new Date(b.startDate).getTime()
            return dateA - dateB
          })
        })
        
        this.weeklySchedule = weeklyData
      } catch (error) {
        console.error('이번주 일정 조회 실패:', error)
        this.weeklySchedule = []
      }
    },
    async fetchMonthlySchedule() {
      try {
        const year = this.currentDate.getFullYear()
        const month = this.currentDate.getMonth() + 1 // getMonth()는 0부터 시작하므로 +1
        
        const response = await apiClient.get('/workspace-service/calendar/find-my-schedule', {
          params: {
            searchType: 'Month',
            year: year,
            month: month
          }
        })
        
        let scheduleData = []
        
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            scheduleData = response.data.data
          } else if (Array.isArray(response.data)) {
            scheduleData = response.data
          }
        }
        
        const mapTypeNameToCalendarType = (typeName) => {
          const typeMapping = {
            '화상회의': 'meeting',
            '회의': 'meeting',
            '예약': 'reservation',
            '휴가': 'vacation',
            '출장': 'businessTrip',
            '개인일정': 'personal',
            '개인': 'personal'
          };
          return typeMapping[typeName] || 'personal';
        };
        
        const allEvents = []
        
        scheduleData.forEach((item, index) => {
          const startDateTime = item.startDate ? new Date(item.startDate) : null;
          const endDateTime = item.endDate ? new Date(item.endDate) : startDateTime;
          
          if (!startDateTime) return;
          
          const currentDate = new Date(startDateTime);
          currentDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(endDateTime);
          endDate.setHours(0, 0, 0, 0);
          
          const timeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`;
          const calendarType = mapTypeNameToCalendarType(item.typeName);
          
          while (currentDate <= endDate) {
            const dateStr = this.formatLocalDate(currentDate);
            
            allEvents.push({
              id: `${item.scheduleId || index}-${dateStr}`,
              scheduleId: item.scheduleId,
              title: item.title || '',
              contents: item.contents || '',
              date: dateStr,
              type: calendarType,
              typeName: item.typeName || '',
              time: timeStr,
              startDate: item.startDate,
              endDate: item.endDate
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
        
        this.events = allEvents;
      } catch (error) {
        console.error('월간 일정 조회 실패:', error);
        this.events = [];
      }
    },
    formatLocalDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      if (this.viewType === 'month') {
        this.fetchMonthlySchedule()
      }
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      if (this.viewType === 'month') {
        this.fetchMonthlySchedule()
      }
    },
    showAllEvents(day) {
      // 시간 순서대로 정렬
      const sortedEvents = [...day.events].sort((a, b) => {
        // 시간 문자열이 있는 경우 시간으로 비교
        if (a.time && b.time) {
          const timeA = a.time.split(':').map(Number)
          const timeB = b.time.split(':').map(Number)
          const timeValueA = timeA[0] * 60 + timeA[1]
          const timeValueB = timeB[0] * 60 + timeB[1]
          return timeValueA - timeValueB
        }
        // 시간이 없으면 startDate로 비교
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateA - dateB
      })
      this.selectedDayEvents = sortedEvents;
      this.selectedDayTitle = `${day.date} 일정`;
      this.showAllEventsDialog = true;
    },
    mapTypeNameToCalendarType(typeName) {
      const typeMapping = {
        '화상회의': 'meeting',
        '회의': 'meeting',
        '예약': 'reservation',
        '휴가': 'vacation',
        '출장': 'businessTrip',
        '개인일정': 'personal',
        '개인': 'personal'
      };
      return typeMapping[typeName] || 'personal';
    },
    viewEvent(event) {
      this.selectedEvent = { ...event };
      this.isEditingEvent = false;
      this.showEventDetailDialog = true;
    },
    startEditEvent() {
      const startParts = this.selectedEvent.startDate.split('T');
      const endParts = this.selectedEvent.endDate.split('T');
      
      this.editEventForm = {
        id: this.selectedEvent.scheduleId,
        title: this.selectedEvent.title,
        contents: this.selectedEvent.contents || '',
        startDate: startParts[0],
        startTime: startParts[1].substring(0, 5),
        endDate: endParts[0],
        endTime: endParts[1].substring(0, 5)
      };
      this.isEditingEvent = true;
    },
    cancelEditEvent() {
      this.isEditingEvent = false;
    },
    async updateEvent() {
      const { id, title, contents, startDate, startTime, endDate, endTime } = this.editEventForm;
      if (!title || !startDate || !startTime || !endDate || !endTime) {
        this.$message.warning('필수 항목을 입력해주세요.');
        return;
      }
      
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;
      
      if (new Date(startDateTime) > new Date(endDateTime)) {
        this.$message.warning('종료 날짜는 시작 날짜보다 이후여야 합니다.');
        return;
      }
      
      try {
        await apiClient.patch(`/workspace-service/calendar/update-my-schedule/${id}`, {
          title: title,
          contents: contents || '',
          startDate: startDateTime,
          endDate: endDateTime
        });
        
        this.$message.success('일정이 수정되었습니다.');
        this.showEventDetailDialog = false;
        this.isEditingEvent = false;
        
        if (this.viewType === 'week') {
          await this.fetchWeeklySchedule();
        } else {
          await this.fetchMonthlySchedule();
        }
      } catch (error) {
        console.error('일정 수정 실패:', error);
        this.$message.error('일정 수정에 실패했습니다.');
      }
    },
    async deleteEvent() {
      try {
        await this.$confirm('정말로 이 일정을 삭제하시겠습니까?', '일정 삭제', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning'
        });
        
        await apiClient.delete(`/workspace-service/calendar/delete-my-schedule/${this.selectedEvent.scheduleId}`);
        
        this.$message.success('일정이 삭제되었습니다.');
        this.showEventDetailDialog = false;
        
        if (this.viewType === 'week') {
          await this.fetchWeeklySchedule();
        } else {
          await this.fetchMonthlySchedule();
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('일정 삭제 실패:', error);
          this.$message.error('일정 삭제에 실패했습니다.');
        }
      }
    },
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    getEventTagType(typeName) {
      const tagTypes = {
        '화상회의': 'primary',
        '회의': 'primary',
        '예약': 'success',
        '휴가': 'warning',
        '출장': 'danger',
        '개인일정': ''
      };
      return tagTypes[typeName] || '';
    },
    getEventTypeName(typeName) {
      return typeName || '일정';
    },
    addEvent(defaultDate) {
      // 폼 초기화
      this.eventForm.title = ''
      this.eventForm.contents = ''
      
      // 기본 날짜가 넘어오면 시작일로 세팅 (달력 날짜 더블클릭 진입)
      if (defaultDate) {
        this.eventForm.startDate = defaultDate
        this.eventForm.startTime = '09:00'
        this.eventForm.endDate = defaultDate
        this.eventForm.endTime = '10:00'
      } else {
        // 버튼 클릭 진입 시 현재 날짜 및 시간 기본값
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const hh = String(now.getHours()).padStart(2, '0')
        const min = String(now.getMinutes()).padStart(2, '0')
        
        this.eventForm.startDate = `${yyyy}-${mm}-${dd}`
        this.eventForm.startTime = `${hh}:${min}`
        
        // 종료 시간은 시작 시간 + 1시간
        const endTime = new Date(now.getTime() + 60 * 60 * 1000)
        const endHH = String(endTime.getHours()).padStart(2, '0')
        const endMin = String(endTime.getMinutes()).padStart(2, '0')
        this.eventForm.endDate = `${yyyy}-${mm}-${dd}`
        this.eventForm.endTime = `${endHH}:${endMin}`
      }
      this.showEventDialog = true
    },
    handleEventDialogClose(done) {
      this.showEventDialog = false
      this.eventForm = {
        title: '',
        contents: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      }
      if (done && typeof done === 'function') {
        done()
      }
    },
    async saveEvent() {
      const { title, contents, startDate, startTime, endDate, endTime } = this.eventForm
      if (!title || !startDate || !startTime || !endDate || !endTime) {
        this.$message.warning('필수 항목을 입력해주세요.')
        return
      }
      
      // 날짜와 시간을 합쳐서 LocalDateTime 형식으로 변환
      const startDateTime = `${startDate}T${startTime}:00`
      const endDateTime = `${endDate}T${endTime}:00`
      
      // 시작일이 종료일보다 나중이면 경고
      if (new Date(startDateTime) > new Date(endDateTime)) {
        this.$message.warning('종료 날짜는 시작 날짜보다 이후여야 합니다.')
        return
      }
      
      try {
        // PersonalScheduleReqDto 형식으로 전송
        await apiClient.post('/workspace-service/calendar/post-my-schedule', {
          title: title,
          contents: contents || '',
          startDate: startDateTime,
          endDate: endDateTime
        })
        
        this.$message.success('일정이 추가되었습니다.')
        this.showEventDialog = false
        
        // 일정 목록 새로고침
        if (this.viewType === 'week') {
          await this.fetchWeeklySchedule()
        } else {
          await this.fetchMonthlySchedule()
        }
      } catch (error) {
        console.error('일정 추가 실패:', error)
        this.$message.error('일정 추가에 실패했습니다.')
      }
    }
  },
  watch: {
    viewType(newVal) {
      if (newVal === 'week') {
        this.fetchWeeklySchedule()
      } else if (newVal === 'month') {
        this.fetchMonthlySchedule()
      }
    }
  },
  mounted() {
    if (this.viewType === 'week') {
      this.fetchWeeklySchedule()
    } else {
      this.fetchMonthlySchedule()
    }
  }
}
</script>

<style scoped>
.schedule-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* 주간 뷰 스타일 */
.weekly-schedule-list {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.schedule-day {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8f9fa;
  min-height: 400px;
}

.day-header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.day-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.day-date {
  font-size: 14px;
  color: #909399;
  margin-left: 6px;
}

.day-events {
  min-height: 60px;
}

.no-events {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 20px 0;
}

.event-item {
  font-size: 13px;
  padding: 8px;
  background-color: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.event-item:hover {
  background-color: #f0f4ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-time {
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
  font-size: 12px;
}

.event-title {
  color: #2c3e50;
  line-height: 1.5;
  word-break: break-word;
}

/* 월간 뷰 스타일 */
.calendar-view {
  margin-top: 24px;
}

.calendar-header-controls {
  margin-bottom: 20px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.calendar-controls h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  min-width: 150px;
  text-align: center;
}

.calendar-grid {
  margin-bottom: 20px;
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

.calendar-day:hover {
  background: #f8f9fa;
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

.calendar-day .day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-day .event-item {
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-day .event-item.meeting {
  background: #dbeafe;
  color: #1e40af;
}

.calendar-day .event-item.reservation {
  background: #dcfce7;
  color: #166534;
}

.calendar-day .event-item.vacation {
  background: #fef3c7;
  color: #92400e;
}

.calendar-day .event-item.businessTrip {
  background: #fee2e2;
  color: #dc2626;
}

.calendar-day .event-item.personal {
  background: #f3e8ff;
  color: #7c3aed;
}

.more-events {
  font-size: 10px;
  color: #667eea;
  cursor: pointer;
  padding: 2px 4px;
  text-align: center;
  margin-top: 2px;
}

.more-events:hover {
  background: #f0f4ff;
  border-radius: 3px;
}

.calendar-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.meeting {
  background: #dbeafe;
}

.legend-color.reservation {
  background: #dcfce7;
}

.legend-color.vacation {
  background: #fef3c7;
}

.legend-color.businessTrip {
  background: #fee2e2;
}

.legend-color.personal {
  background: #f3e8ff;
}

/* 일정 전체 보기 다이얼로그 스타일 */
.all-events-dialog :deep(.el-dialog__header) {
  padding: 0;
}

.custom-dialog-header {
  padding: 24px 32px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.all-events-list {
  padding: 20px 32px;
  max-height: 360px;
  overflow-y: auto;
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.full-event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.full-event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left-width: 6px;
}

.full-event-item.meeting {
  border-left-color: #3b82f6;
}

.full-event-item.reservation {
  border-left-color: #10b981;
}

.full-event-item.vacation {
  border-left-color: #f59e0b;
}

.full-event-item.businessTrip {
  border-left-color: #ef4444;
}

.full-event-item.personal {
  border-left-color: #8b5cf6;
}

.event-indicator {
  width: 4px;
  height: 100%;
  border-radius: 2px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.event-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
}

.event-type-badge.meeting {
  background: #dbeafe;
  color: #1e40af;
}

.event-type-badge.reservation {
  background: #dcfce7;
  color: #166534;
}

.event-type-badge.vacation {
  background: #fef3c7;
  color: #92400e;
}

.event-type-badge.businessTrip {
  background: #fee2e2;
  color: #dc2626;
}

.event-type-badge.personal {
  background: #f3e8ff;
  color: #7c3aed;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.event-time-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 6px;
}

.time-icon {
  font-size: 12px;
  color: #64748b;
}

.event-time {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.event-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.arrow-icon {
  font-size: 20px;
  color: #94a3b8;
  transition: all 0.2s;
}

.full-event-item:hover .arrow-icon {
  color: #64748b;
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.dialog-footer-custom {
  padding: 8px 32px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.close-btn {
  min-width: 100px;
  padding: 8px 20px;
}

/* 일정 상세보기 모달 스타일 */
.event-dialog :deep(.el-dialog) {
  overflow: visible;
}

.event-dialog :deep(.el-dialog__body) {
  padding: 24px 40px 24px 24px;
  max-height: 600px;
  overflow-y: auto;
}

.event-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}

.event-detail-view {
  padding: 4px 0;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-label .el-icon {
  font-size: 16px;
  color: #4f46e5;
}

.detail-content {
  font-size: 15px;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: 24px;
}

.detail-content.datetime-content {
  font-weight: 500;
}

.datetime-separator {
  margin: 0 8px;
  color: #909399;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.event-form {
  padding: 4px 0;
  overflow: visible !important;
}

.event-form :deep(.el-form-item) {
  margin-bottom: 22px;
  overflow: visible !important;
}

.event-form :deep(.el-dialog__body) {
  overflow: visible !important;
}
</style>
