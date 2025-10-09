<template>
  <div class="main-layout">
    <!-- 사이드바 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <router-link to="/" class="logo-link">
          <div class="logo">
            <div class="logo-icon">
              <img src="@/assets/H.ONE-no-text.png" alt="H.ONE Logo" class="logo-image" />
            </div>
            <div v-if="!sidebarCollapsed" class="logo-text-container">
              <div class="logo-text">H.ONE</div>
              <div class="logo-subtitle">HR MANAGEMENT</div>
            </div>
          </div>
        </router-link>
        <el-button v-if="!sidebarCollapsed" type="text" @click="toggleSidebar" class="collapse-btn">
          <el-icon>
            <Fold />
          </el-icon>
        </el-button>
      </div>

      <el-menu :default-active="activeMenuIndex" :default-openeds="openedMenus" :collapse="sidebarCollapsed" router
        class="sidebar-menu" :unique-opened="false" :active-text-color="'#4f46e5'" :background-color="'transparent'"
        :text-color="'#606266'">
        <el-menu-item index="/">
          <el-icon>
            <House />
          </el-icon>
          <span>대시보드</span>
        </el-menu-item>

        <el-menu-item index="/search">
          <el-icon>
            <Search />
          </el-icon>
          <span>통합 검색</span>
        </el-menu-item>

        <el-sub-menu index="employee">
          <template #title>
            <el-icon>
              <User />
            </el-icon>
            <span>직원 관리</span>
          </template>
          <el-menu-item index="/employee">
            <span>직원 목록</span>
          </el-menu-item>
          <el-menu-item index="/organization">
            <span>조직 관리</span>
          </el-menu-item>
          <el-menu-item index="/employee/titles">
            <span>직책 관리</span>
          </el-menu-item>
          <el-menu-item index="/employee/grades">
            <span>직급 관리</span>
          </el-menu-item>
          <el-sub-menu index="roles">
            <template #title>
              <span>역할 관리</span>
            </template>
            <el-menu-item index="/employee/roles">
              <span>역할 목록</span>
            </el-menu-item>
            <el-menu-item index="/employee/roles/create">
              <span>역할 생성</span>
            </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <el-sub-menu index="attendance">
          <template #title>
            <el-icon>
              <Clock />
            </el-icon>
            <span>근태 관리</span>
          </template>
          <el-menu-item index="/attendance">
            <span>내 근태 현황</span>
          </el-menu-item>
          <el-menu-item index="/leave-request">
            <span>휴가/출장 신청</span>
          </el-menu-item>
          <el-menu-item index="/shared-calendar">
            <span>공유 캘린더</span>
          </el-menu-item>
          <el-menu-item index="/admin/attendance">
            <span>관리자 근태 현황</span>
          </el-menu-item>
          <el-menu-item index="/admin/leave-management">
            <span>관리자 연차 현황</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="performance">
          <template #title>
            <el-icon>
              <TrendCharts />
            </el-icon>
            <span>성과 관리</span>
          </template>
          <el-menu-item index="/performance/team-goal">
            <span>팀 목표 관리</span>
          </el-menu-item>
          <el-menu-item index="/performance/my-goal">
            <span>내 목표 관리</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="payroll">
          <template #title>
            <el-icon>
              <Money />
            </el-icon>
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
          <el-icon>
            <VideoCamera />
          </el-icon>
          <span>화상회의</span>
        </el-menu-item>

        <el-menu-item index="/approval">
          <el-icon>
            <Document />
          </el-icon>
          <span>전자결재</span>
        </el-menu-item>

        <el-menu-item index="/board">
          <el-icon>
            <List />
          </el-icon>
          <span>게시판</span>
        </el-menu-item>

        <el-sub-menu index="resource">
          <template #title>
            <el-icon>
              <Calendar />
            </el-icon>
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
        <el-button type="text" class="organization-btn" @click="showOrganizationModal">
          <el-icon>
            <OfficeBuilding />
          </el-icon>
          <span v-if="!sidebarCollapsed">직원찾기</span>
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
            <el-icon>
              <Clock />
            </el-icon>
            <span class="timer-text">{{ sessionTimeLeft }}</span>
          </div>

          <!-- 캘린더 -->
          <el-button type="text" class="calendar-btn" @click="openCalendarModal">
            <el-icon>
              <Calendar />
            </el-icon>
          </el-button>

          <!-- 알림 -->
          <el-popover placement="bottom-end" :width="320" trigger="click">
            <template #reference>
              <el-badge :value="notifications.length" class="notification-badge">
                <el-button type="text" class="notification-btn">
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-button>
              </el-badge>
            </template>

            <div class="notification-panel">
              <div class="notification-header">
                <h3>알림</h3>
                <el-button type="text" size="small">모두 읽음</el-button>
              </div>
              <div class="notification-list">
                <div v-for="notification in notifications" :key="notification.id" class="notification-item">
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                  </div>
                  <el-button type="text" size="small" @click="removeNotification(notification.id)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-popover>

          <!-- 사용자 메뉴 -->
          <el-dropdown v-if="user" @command="handleUserCommand">
            <div class="user-profile">
              <el-avatar :src="user.avatar" :size="32" />
              <span class="user-name">{{ user.name }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="my-info">내 정보</el-dropdown-item>
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
    <el-dialog v-model="showOrgModal" title="조직/사원" width="800px" :before-close="handleClose"
      class="organization-dialog">
      <el-tabs v-model="activeOrgTab" class="organization-tabs-modal">
        <el-tab-pane label="조직" name="org">
          <div class="organization-modal">
            <div class="org-tree-container-modal">
              <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input-modal" />
              <div class="tree-container">
                <el-tree ref="orgTree" :data="orgTreeData" :props="defaultProps" @node-click="handleOrgNodeClick"
                  :filter-node-method="filterNode" default-expand-all :expand-on-click-node="false" class="org-tree">
                  <template #default="{ node, data }">
                    <div class="custom-tree-node-modal">
                      <span>{{ node.label }}</span>
                      <span class="member-count">{{ data.members.length }}명</span>
                    </div>
                  </template>
                </el-tree>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="사원" name="employee">
          <div class="employee-search-modal">
            <div class="employee-search-bar-modal">
              <el-input v-model="employeeSearch" placeholder="사원명 또는 부서명 입력" clearable @keyup.enter="searchEmployees" />
              <el-button type="primary" @click="searchEmployees">검색</el-button>
            </div>
            <el-table :data="searchedEmployees" style="width: 100%" height="40vh" empty-text="검색된 사원이 없습니다.">
              <el-table-column prop="name" label="이름" width="120"></el-table-column>
              <el-table-column prop="department" label="부서"></el-table-column>
              <el-table-column prop="team" label="팀"></el-table-column>
              <el-table-column prop="position" label="직급" width="150"></el-table-column>
              <el-table-column prop="email" label="이메일"></el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="activeOrgTab === 'org'" @click="goToOrganizationManagement">조직 관리</el-button>
          <el-button @click="showOrgModal = false">닫기</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 캘린더 모달 -->
    <el-dialog v-model="showCalendarModal" title="일정 관리" width="900px" :before-close="handleCalendarClose">
      <div class="calendar-modal">
        <div class="calendar-header">
          <div class="calendar-controls">
            <el-button @click="prevMonth" circle>
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
            <h3>{{ currentMonthYear }}</h3>
            <el-button @click="nextMonth" circle>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </el-button>
          </div>
          <div class="calendar-actions">
            <el-button type="primary" @click="addEvent">
              <el-icon>
                <Plus />
              </el-icon>
              일정 추가
            </el-button>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
          </div>
          <div class="calendar-days">
            <div v-for="day in calendarDays" :key="day.date" class="calendar-day" :class="{
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'has-events': day.events.length > 0
            }" @dblclick="addEvent(day.date)">
              <div class="day-number">{{ day.day }}</div>
              <div class="day-events">
                <div v-for="event in day.events.slice(0, 2)" :key="event.id" class="event-item" :class="event.type"
                  @click="viewEvent(event)">
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
    <el-dialog v-model="showEventDialog" title="일정 추가" width="480px" :before-close="handleEventDialogClose">
      <el-form label-width="80px">
        <el-form-item label="제목">
          <el-input v-model="eventForm.title" placeholder="일정 제목을 입력" />
        </el-form-item>
        <el-form-item label="날짜">
          <el-date-picker v-model="eventForm.date" type="date" placeholder="날짜 선택" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="시간">
          <el-time-picker v-model="eventForm.time" placeholder="시간 선택" format="HH:mm" value-format="HH:mm"
            style="width: 100%;" />
        </el-form-item>
        <el-form-item label="유형">
          <el-select v-model="eventForm.type" placeholder="유형 선택" style="width: 100%;">
            <el-option v-for="type in eventTypes" :key="type.value" :label="type.label" :value="type.value" />
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
import SnackbarContainer from '../components/SnackbarContainer.vue'

export default {
  name: 'MainLayout',
  components: { SnackbarContainer },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      sidebarCollapsed: false,
      showOrgModal: false,
      showCalendarModal: false,
      activeOrgTab: 'org',
      orgSearch: '',
      employeeSearch: '',
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
      orgTreeData: [
        {
          id: 1,
          label: 'H.ONE',
          type: 'company',
          members: [],
          children: [
            {
              id: 2,
              label: '경영팀',
              type: 'department',
              members: [
                { id: 101, name: '김경영', position: '팀장', email: 'ky.kim@h.one' },
                { id: 102, name: '이경영', position: '사원', email: 'ky.lee@h.one' },
              ],
              children: [],
            },
            {
              id: 3,
              label: '개발팀',
              type: 'department',
              members: [],
              children: [
                {
                  id: 5,
                  label: '프론트엔드',
                  type: 'team',
                  members: [
                    { id: 201, name: '박프론', position: '과장', email: 'front.park@h.one' },
                    { id: 202, name: '최프론', position: '대리', email: 'front.choi@h.one' },
                  ],
                  children: []
                },
                {
                  id: 6,
                  label: '백엔드',
                  type: 'team',
                  members: [
                    { id: 301, name: '정보백', position: '차장', email: 'back.jung@h.one' },
                    { id: 302, name: '강백엔', position: '주임', email: 'back.kang@h.one' },
                  ],
                  children: []
                },
              ],
            },
            {
              id: 4,
              label: '디자인팀',
              type: 'department',
              members: [
                { id: 401, name: '오디자인', position: '팀장', email: 'design.oh@h.one' },
              ],
              children: [],
            },
          ],
        },
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      allEmployees: [],
      searchedEmployees: [],
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
  watch: {
    orgSearch(val) {
      this.$refs.orgTree.filter(val);
    },
    '$route'() {
      this.updatePayrollMenuState()
    }
  },
  methods: {
    ...mapMutations(['removeNotification']),
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    getPageTitle() {
      const titles = {
        '/': '대시보드',
        '/organization': '조직/사원',
        '/employee': '직원 관리',
        '/employee/titles': '직책 관리',
        '/employee/grades': '직급 관리',
        '/employee/roles': '역할 목록',
        '/employee/roles/create': '역할 생성',
        '/attendance': '내 근태 현황',
        '/leave-request': '휴가/출장 신청',
        '/shared-calendar': '공유 캘린더',
        '/admin/attendance': '관리자 근태 현황',
        '/admin/leave-management': '관리자 연차 현황',
        '/performance/team-goal': '팀 목표 관리',
        '/performance/my-goal': '내 목표 관리',
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
        case 'my-info':
          this.$router.push('/my-info');
          break;
        case 'logout':
          this.$store.dispatch('logout');
          this.$router.push('/landing');
          break
      }
    },
    showOrganizationModal() {
      this.showOrgModal = true
      this.activeOrgTab = 'org'
      this.orgSearch = ''
      this.employeeSearch = ''
      this.searchedEmployees = this.allEmployees
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
    goToOrganizationManagement() {
      this.$router.push('/organization');
      this.showOrgModal = false;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleOrgNodeClick(data) {
      this.searchedEmployees = this.getAllMembersFromNode(data);
      this.activeOrgTab = 'employee';
    },
    getAllMembersFromNode(node) {
      let members = [];
      if (node.members && node.members.length > 0) {
        members.push(...node.members);
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          members = members.concat(this.getAllMembersFromNode(child));
        });
      }
      return members;
    },
    flattenOrgTree(nodes) {
      let employees = [];
      const traverse = (node, department, team) => {
        if (node.members && node.members.length > 0) {
          node.members.forEach(member => {
            employees.push({
              ...member,
              department: department,
              team: team,
            });
          });
        }
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            let nextDepartment = department;
            let nextTeam = team;
            if (child.type === 'department') {
              nextDepartment = child.label;
              nextTeam = '';
            } else if (child.type === 'team') {
              nextTeam = child.label;
            }
            traverse(child, nextDepartment, nextTeam);
          });
        }
      };
      nodes.forEach(node => traverse(node, '', ''));
      return employees;
    },
    searchEmployees() {
      if (!this.employeeSearch) {
        this.searchedEmployees = this.allEmployees;
        return;
      }
      const searchTerm = this.employeeSearch.toLowerCase();
      this.searchedEmployees = this.allEmployees.filter(emp => {
        return (
          (emp.name && emp.name.toLowerCase().includes(searchTerm)) ||
          (emp.department && emp.department.toLowerCase().includes(searchTerm)) ||
          (emp.team && emp.team.toLowerCase().includes(searchTerm))
        );
      });
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
    formatLocalDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
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
      this.warning('세션이 곧 만료됩니다. (5분 남음)')
    },
    extendSession() {
      // 세션 연장 (30분 추가)
      this.sessionExpiryTime = new Date(Date.now() + 30 * 60 * 1000)
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
  created() {
    this.allEmployees = this.flattenOrgTree(this.orgTreeData);
    this.searchedEmployees = this.allEmployees;
  },
  mounted() {
    this.initSessionTimer()
    this.updatePayrollMenuState()
  },
  beforeUnmount() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }
  }
}
</script>

<style scoped>
/* ... (existing styles) */
.logo-link {
  text-decoration: none;
}

.logo {
  cursor: pointer;
}

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
.sidebar-menu .el-sub-menu.is-active>.el-sub-menu__title {
  background: #f0f9ff;
  color: #4f46e5;
  border-right: 3px solid #4f46e5;
}

/* 급여 하위 메뉴가 활성화된 경우 최상위 급여 관리 메뉴만 활성화 */
.sidebar-menu .el-sub-menu[index="payroll"]:has(.el-menu-item.is-active)>.el-sub-menu__title {
  background: #f0f9ff !important;
  color: #4f46e5 !important;
  border-right: 3px solid #4f46e5 !important;
  font-weight: 600 !important;
}

.sidebar-menu .el-sub-menu[index="payroll"]:has(.el-menu-item.is-active)>.el-sub-menu__title .el-icon {
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

.organization-dialog .el-dialog__body {
  padding: 0 24px 24px;
}

.organization-tabs-modal {
  /* min-height: 450px; */
}

.organization-modal,
.employee-search-modal {
  padding-top: 16px;
}

.org-tree-container-modal {
  display: flex;
  flex-direction: column;
}

.search-input-modal {
  margin-bottom: 16px;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  max-height: 40vh;
}

.custom-tree-node-modal {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.member-count {
  color: #909399;
  font-size: 12px;
}

.employee-search-bar-modal {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
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
.el-sub-menu[index="payroll"]:has(.el-menu-item.is-active)>.el-sub-menu__title {
  background: #f0f9ff !important;
  color: #4f46e5 !important;
  border-right: 3px solid #4f46e5 !important;
  font-weight: 600 !important;
}

.el-sub-menu[index="payroll"]:has(.el-menu-item.is-active)>.el-sub-menu__title .el-icon {
  color: #4f46e5 !important;
}

/* 예약 하위 메뉴가 활성화된 경우 최상위 예약 메뉴만 활성화 */
.el-sub-menu[index="resource"]:has(.el-menu-item.is-active)>.el-sub-menu__title {
  background: #f0f9ff !important;
  color: #4f46e5 !important;
  border-right: 3px solid #4f46e5 !important;
  font-weight: 600 !important;
}

.el-sub-menu[index="resource"]:has(.el-menu-item.is-active)>.el-sub-menu__title .el-icon {
  color: #4f46e5 !important;
}
</style>