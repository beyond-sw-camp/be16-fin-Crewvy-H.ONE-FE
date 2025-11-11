<template>
  <div class="dashboard"> 
    <!-- 메인 컨텐츠 그리드 -->
    <div class="content-grid">
      <!-- 일정 -->
      <div class="content-card schedule-card">
        <div class="card-header schedule-header">
          <h3>일정</h3>
          <div class="schedule-controls">
            <el-radio-group v-model="scheduleView" size="small" class="schedule-view-toggle">
              <el-radio-button label="daily">일일</el-radio-button>
              <el-radio-button label="weekly">주간</el-radio-button>
              <el-radio-button label="monthly">월간</el-radio-button>
            </el-radio-group>
            <el-button type="text" @click="$router.push('/schedule')">전체보기</el-button>
          </div>
        </div>
        <div class="schedule-content">
          <template v-if="scheduleView === 'daily'">
              <div class="schedule-list">
                <div v-if="todaySchedule.length === 0" class="calendar-empty">
                  <el-icon class="calendar-empty-icon"><Calendar /></el-icon>
                  <p class="calendar-empty-title">오늘 예정된 일정이 없습니다.</p>
                </div>
                <div 
                v-else
                v-for="schedule in todaySchedule.slice(0, 4)" 
                :key="schedule.id" 
                class="schedule-item"
                :class="schedule.type"
                @click="viewEvent(schedule)"
                style="cursor: pointer;"
              >
                <div class="schedule-time">{{ schedule.time }}</div>
                <div class="schedule-content-body">
                  <div class="schedule-title-wrapper">
                    <span class="schedule-title">{{ schedule.title }}</span>
                    <el-tag 
                      v-if="schedule.typeName" 
                      :type="getTagType(schedule.typeName)"
                      size="small"
                      class="schedule-type-tag"
                    >
                      {{ schedule.typeName }}
                    </el-tag>
                  </div>
                  <div v-if="schedule.contents" class="schedule-contents">{{ schedule.contents }}</div>
                </div>
              </div>
            </div>
            <div 
              class="schedule-footer" 
              v-if="todaySchedule.length > 4"
            >
              <el-button 
                type="text" 
                @click="showTodayScheduleModal = true"
              >
                전체보기 ({{ todaySchedule.length }}개)
              </el-button>
            </div>
          </template>
          <template v-else-if="scheduleView === 'weekly'">
            <div 
              v-if="weeklySchedule.length === 0 || weeklySchedule.every(day => day.events.length === 0)"
              class="calendar-empty calendar-empty-weekly"
            >
              <el-icon class="calendar-empty-icon"><Calendar /></el-icon>
              <p class="calendar-empty-title">이번 주 예정된 일정이 없습니다.</p>
            </div>
            <div 
              v-else 
              class="weekly-schedule-list"
            >
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
                      v-for="event in day.events.slice(0, 4)" 
                      :key="event.id"
                      @click="viewEvent(event)"
                      style="cursor: pointer;"
                    >
                      <div class="event-time">{{ event.time }}</div>
                      <div class="event-title">{{ event.title }}</div>
                    </div>
                    <div v-if="day.events.length > 4" class="more-events-indicator">
                      +{{ day.events.length - 4 }}개 더
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="calendar-view">
              <template v-if="hasMonthlyEvents">
                <div class="calendar-header">
                  <div class="calendar-title">
                    <span class="calendar-month">{{ currentMonthLabel }}</span>
                    <span class="calendar-summary">총 {{ monthlyEventsCount }}개 일정</span>
                  </div>
                  <div class="calendar-nav">
                    <el-button circle size="small" @click="goToPrevMonth">
                      <el-icon><ArrowLeft /></el-icon>
                    </el-button>
                    <el-button circle size="small" @click="goToNextMonth">
                      <el-icon><ArrowRight /></el-icon>
                    </el-button>
                  </div>
                </div>

                <div class="calendar-grid">
                  <div class="calendar-weekdays">
                    <div 
                      v-for="weekday in calendarWeekdays" 
                      :key="weekday" 
                      class="calendar-weekday"
                    >
                      {{ weekday }}
                    </div>
                  </div>
                  <div class="calendar-days">
                    <div
                      v-for="day in monthlyCalendarDays"
                      :key="day.date"
                      class="calendar-day"
                      :class="{
                        'other-month': !day.currentMonth,
                        today: day.isToday,
                        'has-events': day.events.length > 0
                      }"
                    >
                      <div class="calendar-day-header">
                        <span class="day-number">{{ day.day }}</span>
                        <span v-if="day.events.length" class="day-count">{{ day.events.length }}</span>
                      </div>
                      <div class="calendar-day-events">
                        <div
                          v-for="event in day.events.slice(0, 2)"
                          :key="event.id"
                          class="calendar-event"
                          :class="event.type"
                          @click="viewEvent(event)"
                          style="cursor: pointer;"
                        >
                          <span class="event-title">{{ event.title }}</span>
                        </div>
                        <div
                          v-if="day.events.length > 2"
                          class="calendar-more"
                        >
                          +{{ day.events.length - 2 }}개 더
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="calendar-empty">
                <el-icon class="calendar-empty-icon"><Calendar /></el-icon>
                <p class="calendar-empty-title">이번 달 예정된 일정이 없습니다.</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 대기 중인 결재 -->
      <div class="content-card approval-card">
        <div class="card-header">
          <h3>대기 중인 결재</h3>
          <el-button type="text" @click="$router.push('/approval')">전체보기</el-button>
        </div>
        <div class="approval-list">
          <div v-if="pendingApprovals.length === 0" class="no-approval">
            대기 중인 결재가 없습니다.
          </div>
          <div v-else class="approval-item" v-for="approval in pendingApprovals" :key="approval.id" @click="viewApprovalDetail(approval)" style="cursor: pointer;">
            <div class="approval-content">
              <div class="approval-title">{{ approval.title }}</div>
              <div class="approval-requester">{{ approval.requester }} • {{ approval.time }}</div>
            </div>
            <el-tag :type="approval.priority === 'high' ? 'danger' : 'warning'">
              {{ approval.priority === 'high' ? '긴급' : '일반' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 근태 현황 -->
      <div class="content-card attendance-card">
        <div class="card-header">
          <h3>근태 현황</h3>
          <el-button type="text" @click="$router.push('/attendance')">전체보기</el-button>
        </div>
        <div class="attendance-content">
          <div class="attendance-summary">
            <div class="summary-item">
              <span class="label">출근 시간</span>
              <span class="value">09:15</span>
            </div>
            <div class="summary-item">
              <span class="label">퇴근 예정</span>
              <span class="value">18:15</span>
            </div>
            <div class="summary-item">
              <span class="label">근무 시간</span>
              <span class="value">8시간 30분</span>
            </div>
          </div>
          <div class="attendance-chart">
            <AttendanceChart />
          </div>
        </div>
      </div>

    <!-- 오늘의 일정 전체보기 모달 -->
    <el-dialog 
      v-model="showTodayScheduleModal" 
      title="오늘의 일정"
      width="600px"
      class="today-schedule-modal"
    >
      <div class="today-schedule-list">
        <div v-if="todaySchedule.length === 0" class="no-schedule">
          <p>오늘 예정된 일정이 없습니다.</p>
        </div>
        <div 
          v-for="schedule in todaySchedule" 
          :key="schedule.id" 
          class="schedule-item-full"
          :class="schedule.type"
          @click="viewEvent(schedule)"
          style="cursor: pointer;"
        >
          <div class="schedule-time">{{ schedule.time }}</div>
          <div class="schedule-content">
            <div class="schedule-title-wrapper">
              <span class="schedule-title">{{ schedule.title }}</span>
              <el-tag 
                v-if="schedule.typeName" 
                :type="getTagType(schedule.typeName)"
                size="small"
                class="schedule-type-tag"
              >
                {{ schedule.typeName }}
              </el-tag>
            </div>
            <div v-if="schedule.contents" class="schedule-contents">{{ schedule.contents }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTodayScheduleModal = false" size="large">닫기</el-button>
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
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import AttendanceChart from '@/components/AttendanceChart.vue'
import apiClient from '@/api/http'
import { Notebook, Document, Tickets, Clock, Delete, Edit, CircleCheck, ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'

export default {
  name: 'DashboardPage',
  components: {
    AttendanceChart,
    Notebook,
    Document,
    Tickets,
    Clock,
    Delete,
    Edit,
    CircleCheck,
    Calendar,
    ArrowLeft,
    ArrowRight
  },
  data() {
    return {
      weeklySchedule: [],
      monthlySchedule: [],
      currentMonthlyDate: new Date(),
      calendarWeekdays: ['일', '월', '화', '수', '목', '금', '토'],
      pendingApprovals: [],
      todaySchedule: [],
      scheduleView: 'daily',
      showTodayScheduleModal: false,
      showEventDetailDialog: false,
      selectedEvent: {},
      isEditingEvent: false,
      editEventForm: {
        id: null,
        title: '',
        contents: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      },
      teamStats: [
        { name: '개발팀', members: 12, attendanceRate: 95 },
        { name: '디자인팀', members: 8, attendanceRate: 88 },
        { name: '마케팅팀', members: 6, attendanceRate: 92 }
      ],
      quickActions: [
        { name: '휴가 신청', icon: 'Calendar', type: 'primary', route: '/attendance' },
        { name: '결재 요청', icon: 'Document', type: 'success', route: '/approval' },
        { name: '화상회의', icon: 'VideoCamera', type: 'info', route: '/meeting' },
        { name: '예약', icon: 'Calendar', type: 'warning', route: '/resource/reservation' }
      ]
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['userName']),
    currentMonthLabel() {
      return this.currentMonthlyDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long'
      })
    },
    monthlyEventsCount() {
      return this.monthlySchedule.reduce((sum, day) => {
        return sum + (Array.isArray(day.events) ? day.events.length : 0)
      }, 0)
    },
    hasMonthlyEvents() {
      return this.monthlyEventsCount > 0
    },
    monthlyScheduleMap() {
      return this.monthlySchedule.reduce((map, day) => {
        map[day.date] = Array.isArray(day.events) ? day.events : []
        return map
      }, {})
    },
    monthlyCalendarDays() {
      const year = this.currentMonthlyDate.getFullYear()
      const month = this.currentMonthlyDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - startDate.getDay())

      const days = []
      const today = new Date()

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const events = this.monthlyScheduleMap[dateKey] || []

        days.push({
          date: dateKey,
          day: date.getDate(),
          currentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events
        })
      }

      return days
    },
    eventDetailTitle() {
      return this.isEditingEvent ? '일정 수정' : '일정 상세';
    },
    canEditEvent() {
      // 개인일정만 수정/삭제 가능
      return this.selectedEvent.typeName === '개인일정' || this.selectedEvent.type === 'personal';
    }
  },
  watch: {
    scheduleView(newValue) {
      if (newValue === 'monthly') {
        this.fetchMonthlySchedule()
      }
    }
  },
  methods: {
    handleQuickAction(route) {
      this.$router.push(route)
    },
    async fetchTodaySchedule() {
      try {
        const response = await apiClient.get('/workspace-service/calendar/find-my-schedule', {
          params: {
            searchType: 'Day'
          }
        })
        
        // 응답 구조 처리 (캘린더와 동일한 방식)
        let scheduleData = []
        
        if (response.data) {
          // 응답 구조가 { data: [...] } 형식인 경우
          if (response.data.data && Array.isArray(response.data.data)) {
            scheduleData = response.data.data
          }
          // 응답 구조가 직접 배열인 경우
          else if (Array.isArray(response.data)) {
            scheduleData = response.data
          }
        }
        
        this.todaySchedule = scheduleData.map((item, index) => {
          // LocalDateTime 파싱
          const startDateTime = item.startDate ? new Date(item.startDate) : null
          
          if (!startDateTime) return null
          
          // 시간 형식 (HH:mm)
          const timeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`
          
          // typeName 매핑
          const calendarType = this.mapTypeNameToCalendarType(item.typeName)
          
          return {
            id: item.scheduleId || index,
            scheduleId: item.scheduleId,
            time: timeStr,
            title: item.title || '제목 없음',
            contents: item.contents || '',
            typeName: item.typeName || '',
            type: calendarType,
            startDate: item.startDate,
            endDate: item.endDate,
            timeValue: startDateTime.getTime() // 정렬을 위한 타임스탬프
          }
        }).filter(item => item !== null)
        // 시간 순서대로 정렬
        .sort((a, b) => a.timeValue - b.timeValue)
      } catch (error) {
        console.error('오늘의 일정 조회 실패:', error)
        this.todaySchedule = []
      }
    },
    async fetchPendingApprovals() {
      try {
        // 1페이지 데이터만 요청 (page=0)
        const response = await apiClient.get('/workforce-service/approval/find-pending-list', {
          params: {
            page: 0
          }
        })
        
        console.log('대기 중인 결재 API 응답:', response.data)
        
        let approvalData = []
        
        if (response.data) {
          // 페이지네이션 구조 (결재 대기함과 동일한 구조)
          if (response.data.data && response.data.data.content && Array.isArray(response.data.data.content)) {
            approvalData = response.data.data.content
          }
          // 배열인 경우
          else if (response.data.data && Array.isArray(response.data.data)) {
            approvalData = response.data.data
          }
          else if (Array.isArray(response.data)) {
            approvalData = response.data
          }
        }
        
        console.log('추출된 결재 데이터:', approvalData)
        
        // 결재 대기함 데이터 구조 참고하여 매핑 (최대 5개만 표시)
        this.pendingApprovals = approvalData.slice(0, 5).map((item, index) => {
          // requesterName과 requesterPosition 결합
          let requesterText = item.requesterName || '알 수 없음'
          if (item.requesterPosition) {
            requesterText += ` (${item.requesterPosition})`
          }
          
          return {
            id: item.approvalId || item.id || index,
            approvalId: item.approvalId || item.id,
            title: item.title || '제목 없음',
            requester: requesterText,
            time: this.formatTimeAgo(item.createAt || item.createdAt),
            priority: item.priority === 'high' || item.priority === '긴급' ? 'high' : 'normal'
          }
        })
        
        console.log('매핑된 결재 목록:', this.pendingApprovals)
      } catch (error) {
        console.error('대기 중인 결재 조회 실패:', error)
        console.error('에러 상세:', error.response || error.message)
        this.pendingApprovals = []
      }
    },
    viewApprovalDetail(approval) {
      if (approval.approvalId) {
        this.$router.push(`/approval/detail/${approval.approvalId}`)
      }
    },
    formatTimeAgo(dateString) {
      if (!dateString) return '알 수 없음'
      
      try {
        const now = new Date()
        const date = new Date(dateString)
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        if (diffMins < 1) {
          return '방금 전'
        } else if (diffMins < 60) {
          return `${diffMins}분 전`
        } else if (diffHours < 24) {
          return `${diffHours}시간 전`
        } else {
          return `${diffDays}일 전`
        }
      } catch (error) {
        return '알 수 없음'
      }
    },
    async fetchWeeklySchedule() {
      try {
        const response = await apiClient.get('/workspace-service/calendar/find-my-schedule', {
          params: {
            searchType: 'Week'
          }
        })
        
        // 응답 구조 처리 (오늘의 일정과 동일한 방식)
        let scheduleData = []
        
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            scheduleData = response.data.data
          } else if (Array.isArray(response.data)) {
            scheduleData = response.data
          }
        }
        
        // 이번 주의 월요일부터 금요일까지 날짜 구하기
        const today = new Date()
        const dayOfWeek = today.getDay() // 0(일요일) ~ 6(토요일)
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 월요일까지의 offset
        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)
        
        const weekDays = ['월', '화', '수', '목', '금']
        const weeklyData = []
        
        // 월~금 날짜 구조 생성
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
        
        // 일정을 날짜별로 그룹화 (startDate부터 endDate까지 모든 날짜에 표시)
        scheduleData.forEach((item, index) => {
          if (!item.startDate || !item.endDate) return
          
          const startDateTime = new Date(item.startDate)
          const endDateTime = new Date(item.endDate)
          
          // 시작일과 종료일의 날짜 키 생성
          const startDateKey = `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`
          const endDateKey = `${endDateTime.getFullYear()}-${String(endDateTime.getMonth() + 1).padStart(2, '0')}-${String(endDateTime.getDate()).padStart(2, '0')}`
          
          // 시작일부터 종료일까지 반복하여 각 날짜에 일정 추가
          const currentDate = new Date(startDateTime)
          currentDate.setHours(0, 0, 0, 0) // 시간 초기화
          const endDate = new Date(endDateTime)
          endDate.setHours(0, 0, 0, 0) // 시간 초기화
          
          while (currentDate <= endDate) {
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
            
            // 해당 날짜의 weeklyData 항목 찾기
            const dayData = weeklyData.find(day => day.dateKey === dateKey)
            
            if (dayData) {
              // 시간 표시 로직
              let timeStr = ''
              
              if (dateKey === startDateKey) {
                // 시작일인 경우: startDateTime의 시간 표시
                timeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`
              } else {
                // 여러 날짜에 걸쳐있고 시작일이 아닌 경우: 00:00으로 표시
                timeStr = '00:00'
              }
              
              dayData.events.push({
                id: `${item.scheduleId || index}-${dateKey}`, // 날짜별로 고유 ID 생성
                scheduleId: item.scheduleId,
                time: timeStr,
                title: item.title || '제목 없음',
                typeName: item.typeName || '',
                startDate: item.startDate,
                endDate: item.endDate,
                isMultiDay: dateKey !== startDateKey && dateKey !== endDateKey, // 중간 날짜 체크
                isStartDate: dateKey === startDateKey,
                isEndDate: dateKey === endDateKey
              })
            }
            
            // 다음 날로 이동
            currentDate.setDate(currentDate.getDate() + 1)
          }
        })
        
        // 각 날짜별로 시간 순서대로 정렬
        weeklyData.forEach(day => {
          day.events.sort((a, b) => {
            const timeA = new Date(a.startDate).getTime()
            const timeB = new Date(b.startDate).getTime()
            return timeA - timeB
          })
        })
        
        this.weeklySchedule = weeklyData
      } catch (error) {
        console.error('이번주 일정 조회 실패:', error)
        // 에러 발생 시 빈 주간 구조 반환
        const today = new Date()
        const dayOfWeek = today.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)
        
        const weekDays = ['월', '화', '수', '목', '금']
        this.weeklySchedule = []
        
        for (let i = 0; i < 5; i++) {
          const currentDay = new Date(monday)
          currentDay.setDate(monday.getDate() + i)
          const dateStr = String(currentDay.getDate()).padStart(2, '0')
          
          this.weeklySchedule.push({
            date: dateStr,
            dayName: weekDays[i],
            events: []
          })
        }
      }
    },
    async fetchMonthlySchedule() {
      try {
        const targetDate = this.currentMonthlyDate
          ? new Date(this.currentMonthlyDate)
          : new Date()

        const response = await apiClient.get('/workspace-service/calendar/find-my-schedule', {
          params: {
            searchType: 'Month',
            year: targetDate.getFullYear(),
            month: targetDate.getMonth() + 1
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
        
        const dayMap = new Map()
        
        scheduleData.forEach((item, index) => {
          if (!item.startDate || !item.endDate) return
          
          const startDateTime = new Date(item.startDate)
          const endDateTime = new Date(item.endDate)
          
          const startDateKey = `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`
          const currentDate = new Date(startDateTime)
          currentDate.setHours(0, 0, 0, 0)
          const endDate = new Date(endDateTime)
          endDate.setHours(0, 0, 0, 0)
          
          while (currentDate <= endDate) {
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
            
            if (!dayMap.has(dateKey)) {
              dayMap.set(dateKey, [])
            }
            
            const isStartDate = dateKey === startDateKey
            const timeStr = isStartDate
              ? `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`
              : '00:00'
            
            dayMap.get(dateKey).push({
              id: `${item.scheduleId || index}-${dateKey}`,
              scheduleId: item.scheduleId,
              time: timeStr,
              title: item.title || '제목 없음',
              typeName: item.typeName || '',
              type: this.mapTypeNameToCalendarType(item.typeName),
              contents: item.contents || '',
              startDate: item.startDate,
              endDate: item.endDate
            })
            
            currentDate.setDate(currentDate.getDate() + 1)
          }
        })
        
        const sortedDays = Array.from(dayMap.entries())
          .filter(([, events]) => events.length > 0)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .map(([dateKey, events]) => {
            const dateObj = new Date(dateKey)
            const displayDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`
            const sortedEvents = events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            
            return {
              date: dateKey,
              displayDate,
              dayName: this.getKoreanDayName(dateObj.getDay()),
              events: sortedEvents
            }
          })
        
        this.monthlySchedule = sortedDays
      } catch (error) {
        console.error('이번 달 일정 조회 실패:', error)
        this.monthlySchedule = []
      }
    },
    goToPrevMonth() {
      this.currentMonthlyDate = new Date(
        this.currentMonthlyDate.getFullYear(),
        this.currentMonthlyDate.getMonth() - 1,
        1
      )
      this.fetchMonthlySchedule()
    },
    goToNextMonth() {
      this.currentMonthlyDate = new Date(
        this.currentMonthlyDate.getFullYear(),
        this.currentMonthlyDate.getMonth() + 1,
        1
      )
      this.fetchMonthlySchedule()
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
      }
      return typeMapping[typeName] || 'personal'
    },
    getKoreanDayName(dayIndex) {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      return dayNames[dayIndex] || ''
    },
    getEventTypeName(typeName) {
      return typeName || '일정'
    },
    getTagType(typeName) {
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
    viewEvent(event) {
      this.selectedEvent = { ...event };
      this.isEditingEvent = false;
      // 오늘의 일정 모달이 열려있으면 닫기
      if (this.showTodayScheduleModal) {
        this.showTodayScheduleModal = false;
      }
      this.showEventDetailDialog = true;
    },
    startEditEvent() {
      // selectedEvent의 startDate, endDate는 "YYYY-MM-DDTHH:mm:ss" 형식
      const startParts = this.selectedEvent.startDate.split('T');
      const endParts = this.selectedEvent.endDate.split('T');
      
      this.editEventForm = {
        id: this.selectedEvent.scheduleId,
        title: this.selectedEvent.title,
        contents: this.selectedEvent.contents || '',
        startDate: startParts[0], // YYYY-MM-DD
        startTime: startParts[1].substring(0, 5), // HH:mm
        endDate: endParts[0], // YYYY-MM-DD
        endTime: endParts[1].substring(0, 5) // HH:mm
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
      
      // 날짜와 시간을 합쳐서 LocalDateTime 형식으로 변환
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;
      
      if (new Date(startDateTime) > new Date(endDateTime)) {
        this.$message.warning('종료 날짜는 시작 날짜보다 이후여야 합니다.');
        return;
      }
      
      try {
        // PATCH 요청으로 수정
        await apiClient.patch(`/workspace-service/calendar/update-my-schedule/${id}`, {
          title: title,
          contents: contents || '',
          startDate: startDateTime,
          endDate: endDateTime
        });
        
        this.$message.success('일정이 수정되었습니다.');
        this.showEventDetailDialog = false;
        this.isEditingEvent = false;
        
        // 일정 목록 새로고침
        await this.fetchTodaySchedule();
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
        
        // DELETE 요청으로 삭제
        await apiClient.delete(`/workspace-service/calendar/delete-my-schedule/${this.selectedEvent.scheduleId}`);
        
        this.$message.success('일정이 삭제되었습니다.');
        this.showEventDetailDialog = false;
        
        // 일정 목록 새로고침
        await this.fetchTodaySchedule();
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
    }
  },
  mounted() {
    this.fetchTodaySchedule()
    this.fetchWeeklySchedule()
    this.fetchMonthlySchedule()
    this.fetchPendingApprovals()
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 104px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.welcome-section {
  background: #ffffff;
  color: #2c3e50;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.welcome-content h2 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.welcome-actions .el-button.el-button--primary {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.welcome-actions .el-button.el-button--primary:hover {
  filter: brightness(0.95);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "schedule approval"
    "schedule attendance";
  gap: 20px;
}

.schedule-card {
  grid-area: schedule;
  display: flex;
  flex-direction: column;
}

.approval-card {
  grid-area: approval;
}

.attendance-card {
  grid-area: attendance;
}

.schedule-header {
  align-items: flex-start;
  gap: 16px;
}

.schedule-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.schedule-controls .el-button {
  padding: 0;
}

.schedule-card .schedule-content {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.schedule-card .schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.schedule-content-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.schedule-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.calendar-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-month {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.calendar-summary {
  font-size: 12px;
  color: #64748b;
}

.calendar-nav {
  display: flex;
  gap: 8px;
}

.calendar-nav .el-button {
  border-color: #e2e8f0;
  color: #4b5563;
}

.calendar-nav .el-button:hover {
  border-color: #c7d2fe;
  color: #6366f1;
  background: #eef2ff;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  background: #f9fafb;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  padding: 10px 10px 12px;
  min-height: 92px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
}

.calendar-day:nth-child(7n + 1) {
  border-left: 1px solid #e2e8f0;
}

.calendar-day:nth-child(-n + 7) {
  border-top: 1px solid #e2e8f0;
}

.calendar-weekdays .calendar-weekday {
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 0;
}

.calendar-weekdays .calendar-weekday:first-child {
  border-left: 1px solid #e2e8f0;
}

.calendar-weekdays .calendar-weekday:last-child {
  border-right: 1px solid #e2e8f0;
}

.calendar-day.today {
  outline: 2px solid #6366f1;
  outline-offset: -2px;
}

.calendar-day.other-month {
  background: #f9fafb;
  color: #a1a1aa;
}

.calendar-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-number {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.day-count {
  font-size: 11px;
  color: #6366f1;
  font-weight: 500;
}

.calendar-day-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-event {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 6px;
  background: #eef2ff;
  color: #312e81;
  transition: background 0.2s ease, transform 0.2s ease;
}

.calendar-event:hover {
  background: #e0e7ff;
}

.calendar-event.meeting {
  background: #e0f2fe;
  color: #0c4a6e;
}

.calendar-event.reservation {
  background: #dcfce7;
  color: #14532d;
}

.calendar-event.vacation {
  background: #fef3c7;
  color: #92400e;
}

.calendar-event.businessTrip {
  background: #fee2e2;
  color: #991b1b;
}

.calendar-event.personal {
  background: #ede9fe;
  color: #4c1d95;
}

.calendar-event .event-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-more {
  font-size: 11px;
  color: #6366f1;
  font-weight: 500;
  text-align: right;
  padding-right: 4px;
}

.calendar-empty {
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  flex: 1;
}

.calendar-empty-icon {
  font-size: 32px;
  color: #6366f1;
}

.calendar-empty-title {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.calendar-empty-weekly {
  min-height: 200px;
  justify-content: center;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "schedule"
      "approval"
      "attendance";
  }

  .schedule-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .schedule-controls {
    justify-content: flex-start;
  }
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

.attendance-content {
  padding: 20px 24px;
}

.attendance-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item .label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.summary-item .value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.attendance-chart {
  height: 200px;
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.chat-list, .approval-list {
  padding: 16px 24px;
}

.weekly-schedule-list {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 12px;
}

.schedule-day {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  background-color: #f8f9fa;
}

.day-header {
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.day-name {
  font-size: 14px;
  font-weight: 600;
}

.day-date {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.day-events {
  min-height: 60px;
}

.no-events {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 20px 0;
}

.event-item {
  font-size: 12px;
  padding: 6px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 6px;
}

.event-time {
  font-weight: 500;
  color: #667eea;
  margin-right: 4px;
}

.more-events-indicator {
  text-align: center;
  color: #667eea;
  font-size: 11px;
  padding: 4px 0;
  margin-top: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.more-events-indicator:hover {
  color: #5568d3;
}

.chat-item, .approval-item, .schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.schedule-item {
  align-items: flex-start;
}

.approval-item:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  margin: 0 -12px;
}

.chat-item:last-child, .approval-item:last-child, .schedule-item:last-child {
  border-bottom: none;
}

.chat-content {
  flex: 1;
}

.chat-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.chat-message {
  font-size: 14px;
  color: #606266;
}

.chat-time {
  font-size: 12px;
  color: #909399;
}

.approval-content {
  flex: 1;
}

.approval-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.approval-requester {
  font-size: 12px;
  color: #909399;
}

.schedule-time {
  font-weight: 600;
  color: #667eea;
  min-width: 60px;
  font-size: 14px;
}

.schedule-content {
  flex: 1;
}

.schedule-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.schedule-title {
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
}

.schedule-type-tag {
  flex-shrink: 0;
}

.schedule-contents {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.no-schedule {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

.no-approval {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

.team-stats {
  padding: 16px 24px;
}

.team-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.team-item:last-child {
  border-bottom: none;
}

.team-name {
  font-weight: 500;
  color: #2c3e50;
}

.team-members {
  font-size: 14px;
  color: #606266;
}

.team-attendance {
  text-align: right;
}

.attendance-rate {
  font-weight: 600;
  color: #67c23a;
  margin-right: 4px;
}

.attendance-label {
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-button {
  height: 48px !important;
  font-size: 14px;
  width: 100% !important;
  min-width: 0 !important;
  flex: 1;
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
}

.action-button.el-button {
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}

.action-button .el-icon {
  margin-right: 8px;
}

/* 오늘의 일정 모달 스타일 */
.today-schedule-modal :deep(.el-dialog__header) {
  padding: 24px 32px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.today-schedule-modal :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.today-schedule-modal :deep(.el-dialog__body) {
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
}

.today-schedule-list {
  padding: 24px 32px;
}

.today-schedule-list .schedule-item-full {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.today-schedule-list .schedule-item-full:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.today-schedule-list .schedule-time {
  font-weight: 600;
  color: #667eea;
  min-width: 60px;
  font-size: 14px;
  margin-top: 2px;
}

.today-schedule-list .schedule-content {
  flex: 1;
}

.today-schedule-list .schedule-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.today-schedule-list .schedule-title {
  font-weight: 500;
  color: #2c3e50;
  font-size: 15px;
  flex: 1;
}

.today-schedule-list .schedule-contents {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-top: 4px;
}

.today-schedule-modal :deep(.el-dialog__footer) {
  padding: 16px 32px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
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
