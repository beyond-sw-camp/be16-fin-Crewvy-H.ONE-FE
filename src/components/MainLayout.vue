<template>
  <div class="main-layout">
    <!-- 사이드바 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo" @click="sidebarCollapsed ? toggleSidebar() : null" :class="{ 'clickable': sidebarCollapsed }">
          <div class="logo-icon">
            <img src="@/assets/H.ONE-no-text.png" alt="H.ONE Logo" class="logo-image" />
          </div>
          <div v-if="!sidebarCollapsed" class="logo-text-container">
            <div class="logo-text">H.ONE</div>
            <div class="logo-subtitle">HR MANAGEMENT</div>
          </div>
        </div>
        <el-button 
          v-if="!sidebarCollapsed"
          type="text" 
          @click="toggleSidebar"
          class="collapse-btn"
        >
          <el-icon><Fold /></el-icon>
        </el-button>
      </div>
      
      <el-menu
        :default-active="activeMenuIndex"
        :default-openeds="openedMenus"
        :collapse="sidebarCollapsed"
        router
        class="sidebar-menu"
        :unique-opened="false"
        :active-text-color="'#4f46e5'"
        :background-color="'transparent'"
        :text-color="'#606266'"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>대시보드</span>
        </el-menu-item>
        
        <el-menu-item index="/employee">
          <el-icon><User /></el-icon>
          <span>직원 관리</span>
        </el-menu-item>
        
        <el-menu-item index="/attendance">
          <el-icon><Clock /></el-icon>
          <span>근태 관리</span>
        </el-menu-item>
        
        <el-sub-menu index="payroll">
          <template #title>
            <el-icon><Money /></el-icon>
            <span>급여</span>
          </template>
          <el-sub-menu index="payroll-management">
            <template #title>
              <span>급여 관리</span>
            </template>
            <el-menu-item index="/payroll/item-management">
              <span>급여 기초 정보</span>
            </el-menu-item>
            <el-menu-item index="/payroll/basic-info">
              <span>급여 기본 정보</span>
            </el-menu-item>
            <el-menu-item index="/payroll/calculation">
              <span>급여 계산</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="payroll-inquiry">
            <template #title>
              <span>급여 조회</span>
            </template>
            <el-menu-item index="/payroll/transfer-output">
              <span>급여 이체 출력</span>
            </el-menu-item>
            <el-menu-item index="/payroll/statement-output">
              <span>명세서 출력</span>
            </el-menu-item>
            <el-menu-item index="/payroll/item-inquiry">
              <span>급여 항목별 조회</span>
            </el-menu-item>
            <el-menu-item index="/payroll/insurance-deduction">
              <span>월별 보험료 공제 현황</span>
            </el-menu-item>
            <el-menu-item index="/payroll/status-output">
              <span>급여 현황 출력</span>
            </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        
        <el-menu-item index="/meeting">
          <el-icon><VideoCamera /></el-icon>
          <span>화상회의</span>
        </el-menu-item>
        
        <el-menu-item index="/approval">
          <el-icon><Document /></el-icon>
          <span>전자결재</span>
        </el-menu-item>
        
        <el-menu-item index="/board">
          <el-icon><List /></el-icon>
          <span>게시판</span>
        </el-menu-item>
        
        <el-sub-menu index="resource">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>예약</span>
          </template>
          <el-menu-item index="/resource/reservation">
            <span>예약하기</span>
          </el-menu-item>
          <el-menu-item index="/resource/management">
            <span>자원 관리</span>
          </el-menu-item>
        </el-sub-menu>
        
      </el-menu>
      
      <!-- 조직도 고정 버튼 -->
      <div class="sidebar-footer">
        <el-button 
          type="text" 
          class="organization-btn"
          @click="showOrganizationModal"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span v-if="!sidebarCollapsed">조직도</span>
        </el-button>
      </div>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div class="main-content">
      <!-- 상단 헤더 -->
      <div class="header">
        <div class="header-left">
          <h1 class="page-title">{{ getPageTitle() }}</h1>
        </div>
        
        <div class="header-right">
          <!-- 세션 타이머 -->
          <div class="session-timer" @click="extendSession">
            <el-icon><Clock /></el-icon>
            <span class="timer-text">{{ sessionTimeLeft }}</span>
          </div>
          
          <!-- 캘린더 -->
          <el-button type="text" class="calendar-btn" @click="openCalendarModal">
            <el-icon><Calendar /></el-icon>
          </el-button>
          
          <!-- 알림 -->
          <el-popover
            placement="bottom-end"
            :width="320"
            trigger="click"
          >
            <template #reference>
              <el-badge :value="notifications.length" class="notification-badge">
                <el-button type="text" class="notification-btn">
                  <el-icon><Bell /></el-icon>
                </el-button>
              </el-badge>
            </template>
            
            <div class="notification-panel">
              <div class="notification-header">
                <h3>알림</h3>
                <el-button type="text" size="small">모두 읽음</el-button>
              </div>
              <div class="notification-list">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  class="notification-item"
                >
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                  </div>
                  <el-button 
                    type="text" 
                    size="small"
                    @click="removeNotification(notification.id)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-popover>
          
          <!-- 사용자 메뉴 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-profile">
              <el-avatar :src="user.avatar" :size="32" />
              <span class="user-name">{{ user.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">프로필</el-dropdown-item>
                <el-dropdown-item command="settings">설정</el-dropdown-item>
                <el-dropdown-item command="logout" divided>로그아웃</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 페이지 컨텐츠 -->
      <div class="content">
        <router-view />
      </div>
    </div>

    <!-- 조직도 모달 -->
    <el-dialog
      v-model="showOrgModal"
      title="조직도"
      width="600px"
      :before-close="handleClose"
      class="organization-dialog"
    >
      <div class="organization-modal">
        <div class="org-tree">
          <!-- 회사명 -->
          <div class="company-header">
            <h2>메카 주식회사</h2>
          </div>
          
          <!-- 트리 구조 -->
          <div class="tree-container">
            <!-- 최상위 관리자 -->
            <div class="tree-node root">
              <div class="node-content">
                <div class="node-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="node-info">
                  <div class="node-name">오** 과장</div>
                </div>
              </div>
            </div>
            
            <!-- 부서들 -->
            <div class="tree-branches">
              <!-- 관리부서 -->
              <div class="tree-branch">
                <div class="branch-header" @click="toggleDepartment('management')">
                  <div class="branch-icon">
                    <el-icon><Plus v-if="!expandedDepartments.management" /><Minus v-else /></el-icon>
                  </div>
                  <span class="branch-title">관리부서</span>
                </div>
                <div v-if="expandedDepartments.management" class="branch-content">
                  <!-- 관리부서 하위 항목들 -->
                </div>
              </div>
              
              <!-- 영업부서 -->
              <div class="tree-branch">
                <div class="branch-header" @click="toggleDepartment('sales')">
                  <div class="branch-icon">
                    <el-icon><Plus v-if="!expandedDepartments.sales" /><Minus v-else /></el-icon>
                  </div>
                  <span class="branch-title">영업부서</span>
                </div>
                <div v-if="expandedDepartments.sales" class="branch-content">
                  <!-- 영업부서 팀장 -->
                  <div class="tree-node employee">
                    <div class="node-content">
                      <div class="node-icon">
                        <el-icon><User /></el-icon>
                      </div>
                      <div class="node-info">
                        <div class="node-name">박관리</div>
                        <div class="node-position">차장/팀장 (부서장)</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 영업부서 직원들 -->
                  <div class="employee-list">
                    <div class="tree-node employee">
                      <div class="node-content">
                        <div class="node-icon">
                          <el-icon><User /></el-icon>
                        </div>
                        <div class="node-info">
                          <div class="node-name">원**</div>
                          <div class="node-position">과장</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="tree-node employee">
                      <div class="node-content">
                        <div class="node-icon">
                          <el-icon><User /></el-icon>
                        </div>
                        <div class="node-info">
                          <div class="node-name">이**</div>
                          <div class="node-position">과장</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="tree-node employee">
                      <div class="node-content">
                        <div class="node-icon">
                          <el-icon><User /></el-icon>
                        </div>
                        <div class="node-info">
                          <div class="node-name">이**</div>
                          <div class="node-position">대리</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="tree-node employee">
                      <div class="node-content">
                        <div class="node-icon">
                          <el-icon><User /></el-icon>
                        </div>
                        <div class="node-info">
                          <div class="node-name">전**</div>
                          <div class="node-position">대리</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="tree-node employee highlighted">
                      <div class="node-content">
                        <div class="node-icon">
                          <el-icon><User /></el-icon>
                        </div>
                        <div class="node-info">
                          <div class="node-name">박**</div>
                          <div class="node-position">사원</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 기타 팀들 -->
              <div class="tree-branch">
                <div class="branch-header">
                  <div class="branch-icon">
                    <el-icon><Plus /></el-icon>
                  </div>
                  <span class="branch-title">영업팀</span>
                </div>
              </div>
              
              <div class="tree-branch">
                <div class="branch-header">
                  <div class="branch-icon">
                    <el-icon><Plus /></el-icon>
                  </div>
                  <span class="branch-title">고객관리팀</span>
                </div>
              </div>
              
              <div class="tree-branch">
                <div class="branch-header">
                  <div class="branch-icon">
                    <el-icon><Plus /></el-icon>
                  </div>
                  <span class="branch-title">인사팀</span>
                </div>
              </div>
              
              <div class="tree-branch">
                <div class="branch-header">
                  <div class="branch-icon">
                    <el-icon><Plus /></el-icon>
                  </div>
                  <span class="branch-title">회계팀</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showOrgModal = false">닫기</el-button>
      </template>
    </el-dialog>

    <!-- 캘린더 모달 -->
    <el-dialog
      v-model="showCalendarModal"
      title="일정 관리"
      width="900px"
      :before-close="handleCalendarClose"
    >
      <div class="calendar-modal">
        <div class="calendar-header">
          <div class="calendar-controls">
            <el-button @click="prevMonth" circle>
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <h3>{{ currentMonthYear }}</h3>
            <el-button @click="nextMonth" circle>
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="calendar-actions">
            <el-button type="primary" @click="addEvent">
              <el-icon><Plus /></el-icon>
              일정 추가
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
        
        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-color meeting"></div>
            <span>회의</span>
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
            <div class="legend-color deadline"></div>
            <span>마감일</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCalendarModal = false">닫기</el-button>
      </template>
    </el-dialog>

    <!-- 일정 추가 다이얼로그 -->
    <el-dialog
      v-model="showEventDialog"
      title="일정 추가"
      width="480px"
      :before-close="handleEventDialogClose"
    >
      <el-form label-width="80px">
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
      </el-form>
      <template #footer>
        <el-button @click="handleEventDialogClose">취소</el-button>
        <el-button type="primary" @click="saveEvent">저장</el-button>
      </template>
    </el-dialog>

    <!-- 스낵바 컨테이너 -->
    <SnackbarContainer />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

import { useSnackbar } from '@/composables/useSnackbar'
import SnackbarContainer from './SnackbarContainer.vue'

export default {
  name: 'MainLayout',
  components: {
    SnackbarContainer
  },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      sidebarCollapsed: false,
      showOrgModal: false,
      showCalendarModal: false,
      currentDate: new Date(2024, 8, 1), // 2024년 9월
      weekdays: ['일', '월', '화', '수', '목', '금', '토'],
      sessionExpiryTime: null,
      sessionTimer: null,
      currentTime: new Date(),
      sessionWarningShown: false, // 세션 경고 표시 여부 추적
      expandedDepartments: {
        management: false,
        sales: true
      },
      events: [
        {
          id: 1,
          title: '주간 팀 미팅',
          date: this.formatDateForEvent(new Date()),
          type: 'meeting',
          time: '14:00'
        },
        {
          id: 2,
          title: '회의실 예약',
          date: this.formatDateForEvent(new Date(Date.now() + 24 * 60 * 60 * 1000)),
          type: 'reservation',
          time: '10:00'
        },
        {
          id: 3,
          title: '연차 휴가',
          date: this.formatDateForEvent(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
          type: 'vacation',
          time: '09:00'
        },
        {
          id: 4,
          title: '프로젝트 마감',
          date: this.formatDateForEvent(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
          type: 'deadline',
          time: '18:00'
        },
        {
          id: 5,
          title: '월간 보고서 회의',
          date: this.formatDateForEvent(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
          type: 'meeting',
          time: '15:00'
        },
        {
          id: 6,
          title: '고객사 미팅',
          date: this.formatDateForEvent(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
          type: 'meeting',
          time: '11:00'
        },
        {
          id: 7,
          title: '법인 차량 예약',
          date: this.formatDateForEvent(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),
          type: 'reservation',
          time: '09:00'
        },
        {
          id: 8,
          title: '반차 휴가',
          date: this.formatDateForEvent(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          type: 'vacation',
          time: '14:00'
        },
        {
          id: 9,
          title: '신규 프로젝트 킥오프',
          date: this.formatDateForEvent(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)),
          type: 'meeting',
          time: '10:00'
        },
        {
          id: 10,
          title: '대회의실 예약',
          date: '2024-09-26',
          type: 'reservation',
          time: '16:00'
        },
        {
          id: 11,
          title: '개인 휴가',
          date: '2024-09-27',
          type: 'vacation',
          time: '09:00'
        },
        {
          id: 12,
          title: '부서 회의',
          date: '2024-09-28',
          type: 'meeting',
          time: '14:30'
        },
        {
          id: 13,
          title: '프레젠테이션 준비',
          date: '2024-09-29',
          type: 'deadline',
          time: '17:00'
        },
        {
          id: 14,
          title: '팀 빌딩',
          date: '2024-09-30',
          type: 'meeting',
          time: '13:00'
        },
        {
          id: 15,
          title: '고객 상담',
          date: '2024-09-16',
          type: 'meeting',
          time: '10:30'
        },
        {
          id: 16,
          title: '회의실 A 예약',
          date: '2024-09-17',
          type: 'reservation',
          time: '14:00'
        },
        {
          id: 17,
          title: '개인 휴가',
          date: '2024-09-21',
          type: 'vacation',
          time: '09:00'
        },
        {
          id: 18,
          title: '프로젝트 발표',
          date: '2024-09-19',
          type: 'deadline',
          time: '16:00'
        },
        {
          id: 19,
          title: '부서 교육',
          date: '2024-09-24',
          type: 'meeting',
          time: '09:30'
        },
        {
          id: 20,
          title: '차량 예약',
          date: '2024-09-25',
          type: 'reservation',
          time: '08:00'
        }
      ],
      showEventDialog: false,
      eventForm: {
        title: '',
        date: '',
        time: '09:00',
        type: 'meeting'
      },
      eventTypes: [
        { label: '회의', value: 'meeting' },
        { label: '예약', value: 'reservation' },
        { label: '휴가', value: 'vacation' },
        { label: '마감일', value: 'deadline' }
      ]
    }
  },
  computed: {
    ...mapState(['user', 'notifications']),
    activeMenuIndex() {
      const path = this.$route.path
      
      // 급여 관련 경로인 경우 해당 경로를 반환 (하위 메뉴 활성화)
      if (path.startsWith('/payroll')) {
        return path
      }
      
      // 예약 관련 경로인 경우 해당 경로를 반환 (하위 메뉴 활성화)
      if (path.startsWith('/resource')) {
        return path
      }
      
      return path
    },
    openedMenus() {
      const path = this.$route.path
      
      // 급여 관련 경로인 경우 급여 메뉴들을 열어둠
      if (path.startsWith('/payroll')) {
        return ['payroll', 'payroll-management', 'payroll-inquiry']
      }
      
      // 예약 관련 경로인 경우 예약 메뉴를 열어둠
      if (path.startsWith('/resource')) {
        return ['resource']
      }
      
      return []
    },
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long' 
      })
    },
    sessionTimeLeft() {
      if (!this.sessionExpiryTime) return '00:00:00'
      
      const now = this.currentTime.getTime()
      const expiry = this.sessionExpiryTime.getTime()
      const diff = expiry - now
      
      if (diff <= 0) return '00:00:00'
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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
        
        days.push({
          date: dateStr,
          day: date.getDate(),
          currentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        })
      }
      
      return days
    }
  },
  methods: {
    formatLocalDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    ...mapMutations(['removeNotification']),
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    getPageTitle() {
      const titles = {
        '/': '대시보드',
        '/organization': '조직도',
        '/employee': '직원 관리',
        '/attendance': '근태 관리',
        '/payroll': '급여 관리',
        '/payroll/item-management': '급여기초정보',
        '/payroll/basic-info': '급여 기본 정보',
        '/payroll/calculation': '급여 계산',
        '/payroll/transfer-output': '급여 이체 출력',
        '/payroll/statement-output': '명세서 출력',
        '/payroll/item-inquiry': '급여 항목별 조회',
        '/payroll/insurance-deduction': '월별 보험료 공제 현황',
        '/payroll/status-output': '급여 현황 출력',
        '/payroll/withholding-report': '원천징수이행신고서',
        '/payroll/elderly-incentive': '고령자장려금신고서',
        '/chat': '채팅',
        '/meeting': '화상회의',
        '/approval': '전자결재',
        '/board': '게시판',
        '/resource/reservation': '예약하기',
        '/resource/management': '자원 관리'
      }
      return titles[this.$route.path] || 'H.ONE'
    },
    handleUserCommand(command) {
      switch (command) {
        case 'profile':
          this.info('프로필 페이지로 이동')
          break
        case 'settings':
          this.info('설정 페이지로 이동')
          break
        case 'logout':
          this.info('로그아웃')
          break
      }
    },
    showOrganizationModal() {
      this.showOrgModal = true
    },
    handleClose(done) {
      this.showOrgModal = false
      done()
    },
    formatDateForEvent(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    openCalendarModal() {
      // 캘린더를 열 때마다 현재 달로 리셋
      this.currentDate = new Date()
      this.showCalendarModal = true
    },
    handleCalendarClose(done) {
      this.showCalendarModal = false
      done()
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    addEvent(defaultDate) {
      // 기본 날짜가 넘어오면 폼에 세팅 (달력 날짜 더블클릭 진입)
      if (defaultDate) {
        this.eventForm.date = defaultDate
      } else {
        // 모달 상단 버튼 클릭 진입 시 현재 달의 오늘 날짜 기본값
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        this.eventForm.date = `${yyyy}-${mm}-${dd}`
      }
      this.eventForm.title = ''
      this.eventForm.time = '09:00'
      this.eventForm.type = 'meeting'
      this.showEventDialog = true
    },
    handleEventDialogClose(done) {
      this.showEventDialog = false
      if (done) done()
    },
    saveEvent() {
      const { title, date, time, type } = this.eventForm
      if (!title || !date || !time || !type) {
        this.warning('필수 항목을 입력해주세요.')
        return
      }
      const newId = (this.events[this.events.length - 1]?.id || 0) + 1
      this.events.push({ id: newId, title, date, time, type })
      this.success('일정이 추가되었습니다.')
      this.showEventDialog = false
    },
    viewEvent(event) {
      this.info(`${event.title} 상세보기`)
    },
    toggleDepartment(department) {
      this.expandedDepartments[department] = !this.expandedDepartments[department]
    },
    initSessionTimer() {
      // 세션 만료시간을 30분으로 설정
      this.sessionExpiryTime = new Date(Date.now() + 30 * 60 * 1000)
      
      // 1초마다 타이머 업데이트
      this.sessionTimer = setInterval(() => {
        // 현재 시간 업데이트 (반응성 트리거)
        this.currentTime = new Date()
        
        const now = this.currentTime.getTime()
        const expiry = this.sessionExpiryTime.getTime()
        const diff = expiry - now
        
        if (diff <= 0) {
          this.handleSessionExpiry()
        } else if (diff <= 5 * 60 * 1000 && diff > 4 * 60 * 1000 && !this.sessionWarningShown) { // 5분 남았을 때 한 번만 경고
          this.showSessionWarning()
        }
      }, 1000)
    },
    handleSessionExpiry() {
      clearInterval(this.sessionTimer)
      this.error('세션이 만료되었습니다. 다시 로그인해주세요.')
      // 실제로는 로그인 페이지로 리다이렉트
      this.info('로그인 페이지로 이동합니다.')
    },
    showSessionWarning() {
      this.sessionWarningShown = true // 경고 표시 플래그 설정
      this.warning('세션이 곧 만료됩니다. (5분 남음)')
    },
    extendSession() {
      // 세션 연장 (30분 추가)
      this.sessionExpiryTime = new Date(Date.now() + 30 * 60 * 1000)
      this.sessionWarningShown = false // 경고 상태 리셋
      this.success('세션이 연장되었습니다.')
    },
    updatePayrollMenuState() {
      // DOM 조작을 통한 급여 메뉴 활성화
      this.$nextTick(() => {
        const payrollSubMenu = document.querySelector('.sidebar-menu .el-sub-menu[index="payroll"]')
        if (payrollSubMenu) {
          const title = payrollSubMenu.querySelector('.el-sub-menu__title')
          if (title) {
            if (this.isPayrollActive) {
              // 클래스 추가
              title.classList.add('is-payroll-active')
              
              // 인라인 스타일로 강제 적용 (선택된 탭과 동일한 스타일)
              title.style.setProperty('background', '#f0f9ff', 'important')
              title.style.setProperty('color', '#4f46e5', 'important')
              title.style.setProperty('border-right', '3px solid #4f46e5', 'important')
              title.style.setProperty('font-weight', '600', 'important')
              
              // 아이콘도 활성화
              const icon = title.querySelector('.el-icon')
              if (icon) {
                icon.style.setProperty('color', '#4f46e5', 'important')
              }
            } else {
              // 클래스 제거
              title.classList.remove('is-payroll-active')
              
              // 스타일 초기화
              title.style.removeProperty('background')
              title.style.removeProperty('color')
              title.style.removeProperty('border-right')
              title.style.removeProperty('font-weight')
              
              // 아이콘도 원래대로
              const icon = title.querySelector('.el-icon')
              if (icon) {
                icon.style.removeProperty('color')
              }
            }
          }
        }
      })
    }
  },
  mounted() {
    this.initSessionTimer()
    this.updatePayrollMenuState()
  },
  watch: {
    '$route'() {
      this.updatePayrollMenuState()
    }
  },
  beforeUnmount() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 230px;
  background: white;
  color: #2c3e50;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-right: 1px solid #e4e7ed;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform-origin: left center;
}

.sidebar.collapsed .logo-text-container {
  opacity: 0;
  transform: translateX(-10px) scale(0.9);
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #1e40af;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.logo-subtitle {
  font-size: 10px;
  font-weight: 500;
  color: #60a5fa;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

.logo.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.logo.clickable:hover {
  background: #f5f7fa;
  transform: scale(1.05);
}

.logo.clickable:hover .logo-icon {
  color: #4f46e5;
}

.collapse-btn {
  color: #606266 !important;
  font-size: 16px;
}

.sidebar-menu {
  border: none;
  background: transparent;
  flex: 1;
  padding-bottom: 80px;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #606266;
  background: transparent;
}

.sidebar-menu .el-menu-item span,
.sidebar-menu .el-sub-menu__title span {
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform-origin: left center;
}

.sidebar.collapsed .sidebar-menu .el-menu-item span,
.sidebar.collapsed .sidebar-menu .el-sub-menu__title span {
  opacity: 0;
  transform: translateX(-10px) scale(0.9);
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background: #f5f7fa;
  color: #2c3e50;
}

.sidebar-menu .el-menu-item.is-active {
  background: #f0f9ff;
  color: #4f46e5;
  border-right: 3px solid #4f46e5;
}

/* 급여 관리 상위 메뉴 활성화 스타일 */
.sidebar-menu .el-sub-menu.is-active > .el-sub-menu__title {
  background: #f0f9ff;
  color: #4f46e5;
  border-right: 3px solid #4f46e5;
}

/* 급여 하위 메뉴가 활성화된 경우 최상위 급여 관리 메뉴만 활성화 */
.sidebar-menu .el-sub-menu[index="payroll"]:has(.el-menu-item.is-active) > .el-sub-menu__title {
  background: #f0f9ff !important;
  color: #4f46e5 !important;
  border-right: 3px solid #4f46e5 !important;
  font-weight: 600 !important;
}

.sidebar-menu .el-sub-menu[index="payroll"]:has(.el-menu-item.is-active) > .el-sub-menu__title .el-icon {
  color: #4f46e5 !important;
}

/* 사이드바 메뉴 스크롤 스타일 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}


.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: white;
  z-index: 10;
}

.organization-btn {
  width: 100%;
  justify-content: flex-start;
  color: #606266;
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.sidebar.collapsed .organization-btn {
  justify-content: center;
  padding: 12px;
}

.organization-btn:hover {
  background: #f5f7fa;
  color: #4f46e5;
}

.organization-btn .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.organization-btn span {
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform-origin: left center;
}

.sidebar.collapsed .organization-btn span {
  opacity: 0;
  transform: translateX(-10px) scale(0.9);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: white;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.notification-btn {
  font-size: 18px;
  color: #606266;
}

.notification-panel {
  padding: 16px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 조직도 모달 스타일 */
.organization-dialog .el-dialog__body {
  padding: 0;
  max-height: 60vh;
  overflow: hidden;
}

.organization-modal {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 조직도 모달 스크롤바 스타일 */
.organization-modal::-webkit-scrollbar {
  width: 6px;
}

.organization-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.organization-modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.organization-modal::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.org-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.org-level {
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
}

.org-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
  min-width: 120px;
}

.org-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.org-item.ceo {
  border-color: #4f46e5;
  background: #f0f9ff;
}

.org-item.director {
  border-color: #10b981;
  background: #f0fdf4;
}

.org-item.manager {
  border-color: #f59e0b;
  background: #fffbeb;
}

.org-avatar {
  margin-bottom: 12px;
}

.org-info {
  text-align: center;
}

.org-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.org-position {
  font-size: 14px;
  color: #4f46e5;
  font-weight: 500;
  margin-bottom: 2px;
}

.org-department {
  font-size: 12px;
  color: #606266;
}

/* 캘린더 모달 스타일 */
.calendar-btn {
  font-size: 18px;
  color: #606266;
  margin-right: 8px;
}

.calendar-modal {
  padding: 20px 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.calendar-controls h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
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
  border: 2px solid #93c5fd;
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

.event-item.deadline {
  background: #fee2e2;
  color: #dc2626;
}

.event-item:hover {
  transform: scale(1.05);
}

.more-events {
  font-size: 10px;
  color: #606266;
  font-style: italic;
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
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
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

.legend-color.deadline {
  background: #fee2e2;
}

/* 트리 구조 조직도 스타일 */
.org-tree {
  padding: 0;
  min-height: auto;
}

.company-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e4e7ed;
}

.company-header h2 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
  font-weight: 600;
}

.tree-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tree-node {
  margin-bottom: 8px;
}

.tree-node.root {
  background: #f0f9ff;
  border: 2px solid #4f46e5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.tree-node.employee {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-left: 20px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.tree-node.employee:hover {
  background: #f8f9fa;
  border-color: #4f46e5;
}

.tree-node.highlighted {
  background: #e0f2fe;
  border-color: #0ea5e9;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  font-size: 16px;
}

.tree-node.employee .node-icon {
  width: 24px;
  height: 24px;
  font-size: 14px;
  background: #6b7280;
}

.node-info {
  flex: 1;
}

.node-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.tree-node.employee .node-name {
  font-size: 14px;
}

.node-position {
  font-size: 12px;
  color: #606266;
}

.tree-branches {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tree-branch {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
}

.branch-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.branch-header:hover {
  background: #f8f9fa;
}

.branch-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-size: 14px;
}

.branch-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.branch-content {
  padding: 16px;
  background: #f8f9fa;
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

/* 세션 타이머 스타일 */
.session-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;
}

.session-timer:hover {
  background: #e0f2fe;
  border-color: #0284c7;
}

.session-timer .el-icon {
  color: #0ea5e9;
  font-size: 16px;
}

.timer-text {
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  font-family: 'Courier New', monospace;
}
</style>

<style>
/* 급여 하위 메뉴가 활성화된 경우 최상위 급여 관리 메뉴만 활성화 */
.el-sub-menu[index="payroll"]:has(.el-menu-item.is-active) > .el-sub-menu__title {
  background: #f0f9ff !important;
  color: #4f46e5 !important;
  border-right: 3px solid #4f46e5 !important;
  font-weight: 600 !important;
}

.el-sub-menu[index="payroll"]:has(.el-menu-item.is-active) > .el-sub-menu__title .el-icon {
  color: #4f46e5 !important;
}

/* 예약 하위 메뉴가 활성화된 경우 최상위 예약 메뉴만 활성화 */
.el-sub-menu[index="resource"]:has(.el-menu-item.is-active) > .el-sub-menu__title {
  background: #f0f9ff !important;
  color: #4f46e5 !important;
  border-right: 3px solid #4f46e5 !important;
  font-weight: 600 !important;
}

.el-sub-menu[index="resource"]:has(.el-menu-item.is-active) > .el-sub-menu__title .el-icon {
  color: #4f46e5 !important;
}
</style>

