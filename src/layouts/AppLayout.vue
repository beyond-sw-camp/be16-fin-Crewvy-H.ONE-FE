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

        <el-sub-menu index="employee" v-if="hasEmployeeReadCompanyOrSystem || hasEmployeeReadDepartment">
          <template #title>
            <el-icon>
              <User />
            </el-icon>
            <span>직원 관리</span>
          </template>
          <el-menu-item index="/employee" v-if="hasEmployeeReadCompanyOrSystem || hasEmployeeReadDepartment">
            <span>직원 목록</span>
          </el-menu-item>
          <el-menu-item index="/organization" v-if="hasEmployeeReadCompanyOrSystem">
            <span>조직 관리</span>
          </el-menu-item>
          <el-menu-item index="/employee/title" v-if="hasEmployeeReadCompanyOrSystem">
            <span>직책 관리</span>
          </el-menu-item>
          <el-menu-item index="/employee/grade" v-if="hasEmployeeReadCompanyOrSystem">
            <span>직급 관리</span>
          </el-menu-item>
          <el-sub-menu index="roles" v-if="hasEmployeeReadCompanyOrSystem">
            <template #title>
              <span>역할 관리</span>
            </template>
            <el-menu-item index="/employee/role">
              <span>역할 목록</span>
            </el-menu-item>
            <el-menu-item index="/employee/role/create">
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
          <el-menu-item index="/team-attendance-status">
            <span>팀원 근태 현황</span>
          </el-menu-item>
          <el-sub-menu index="attendance-admin">
            <template #title>
              <span>관리자 메뉴</span>
            </template>
            <el-menu-item index="/admin/attendance">
              <span>근태 현황</span>
            </el-menu-item>
            <el-menu-item index="/admin/leave-management">
              <span>연차 현황</span>
            </el-menu-item>
            <el-menu-item index="/admin/policy-management">
              <span>정책 관리</span>
            </el-menu-item>
            <el-menu-item index="/admin/policy-assignment">
              <span>정책 할당</span>
            </el-menu-item>
            <el-menu-item index="/admin/work-location-management">
              <span>근무지 관리</span>
            </el-menu-item>
            <el-menu-item index="/admin/device-approval-management">
              <span>디바이스 승인</span>
            </el-menu-item>
            <el-menu-item index="/admin/audit-log">
              <span>감사 로그</span>
            </el-menu-item>
          </el-sub-menu>
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
          <el-menu-item index="/performance/review">
            <span>평가</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="payroll">
          <template #title>
            <el-icon>
              <Money />
            </el-icon>
            <span>급여 관리</span>
          </template>
          <el-sub-menu index="payroll-management">
            <template #title>
              <span>급여 관리</span>
            </template>
            <el-menu-item index="/payroll/settings">
              <span>급여 설정</span>
            </el-menu-item>
            <el-menu-item index="/payroll/basic-info">
              <span>급여 계약 정보</span>
            </el-menu-item>
            <el-menu-item index="/payroll/actual-calculation">
              <span>급여 계산</span>
            </el-menu-item>
            <el-menu-item index="/payroll/calculation">
              <span>급여 모의 계산</span>
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
          <span v-if="!sidebarCollapsed">직원 찾기</span>
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
          <!-- 토큰 연장 버튼 -->
          <div class="session-control">
            <div class="timer-display" :class="{ blinking: isBlinking }">
              <el-icon><Clock /></el-icon>
              <span :class="{ 'low-time': isTimeLow }">{{ sessionTimeLeft }}</span>
            </div>
            <button class="extend-button" @click="extendSession" :disabled="!canExtendSession">
              연장
            </button>
          </div>

          <!-- 캘린더 -->
          <el-button type="text" class="calendar-btn" @click="openCalendarModal">
            <el-icon>
              <Calendar />
            </el-icon>
          </el-button>

          <!-- 알림 -->
          <notification-bell />

          <!-- 사용자 메뉴 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-profile">
              <el-avatar :src="userAvatarUrl" :size="32" />
              <span class="user-name">{{ user?.userName }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="my-info">내 정보</el-dropdown-item>
                <el-dropdown-item command="notification-settings">알림 설정</el-dropdown-item>
                <el-dropdown-item command="select-position">직무 선택</el-dropdown-item>
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
    <el-dialog v-model="showOrgModal" title="직원 찾기" width="800px" :before-close="handleClose"
      class="organization-dialog">
      <el-tabs v-model="activeOrgTab">
        <el-tab-pane label="조직" name="org">
          <div class="organization-modal">
            <div class="org-tree-container-modal">
              <el-input v-model="orgSearch" placeholder="조직 검색" clearable class="search-input-modal" />
              <div class="tree-container">
                <el-tree ref="orgTree" :data="orgTreeData" :props="defaultProps" node-key="id"
                  @node-click="handleOrgNodeClick" :filter-node-method="filterNode" :expand-on-click-node="false"
                  :default-expanded-keys="defaultExpandedOrgKeys" class="org-tree">
                  <template #default="{ node, data }">
                    <div class="custom-tree-node-modal">
                      <span>{{ node.label }}</span>
                      <span v-if="data.members && data.members.length > 0" class="member-count">{{ data.members.length
                      }}명</span>
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
              <el-input v-model="employeeSearch" placeholder="사원명, 부서, 연락처 등으로 검색" clearable
                @keyup.enter="searchEmployees" class="search-input-field" />
              <el-button type="primary" @click="searchEmployees" class="search-button">검색</el-button>
            </div>
            <div class="employee-search-results">
              <el-table v-if="searchedEmployees.length > 0" :data="searchedEmployees" style="width: 100%" stripe
                :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }"
                :row-key="row => row.memberId">
                <el-table-column prop="name" label="이름" width="120" show-overflow-tooltip></el-table-column>
                <el-table-column label="부서" show-overflow-tooltip>
                  <template #default="{ row }">
                    <div class="multi-line-cell">
                      <div v-for="orgItem in row.organizationList || []" :key="orgItem.id" class="line-item">
                        {{ orgItem.name }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="직책" width="150" show-overflow-tooltip>
                  <template #default="{ row }">
                    <div class="multi-line-cell">
                      <div v-for="title in row.titleName" :key="title" class="line-item">
                        {{ title }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="phoneNumber" label="연락처" width="150" show-overflow-tooltip></el-table-column>
                <el-table-column prop="memberStatus" label="상태" width="100"></el-table-column>
              </el-table>
              <div v-else class="empty-state">
                <el-icon>
                  <Search />
                </el-icon>
                <span v-if="!hasSearched">검색어를 입력하여 직원을 찾아보세요.</span>
                <span v-else>검색 결과가 없습니다.</span>
              </div>
            </div>
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
            <el-button @click="prevMonth" :icon="ArrowLeft" circle />
            <h3>{{ currentMonthYear }}</h3>
            <el-button @click="nextMonth" :icon="ArrowRight" circle />
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

    <!-- 직무 선택 모달 -->
    <SelectPositionModal v-if="showSelectPositionModal" @close="showSelectPositionModal = false" />

    <!-- 토큰 만료 모달 -->
    <SessionExpiredModal v-model="showSessionExpiredModal" @confirm="handleSessionExpiredConfirm" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters, useStore } from 'vuex';
import { useSnackbar } from '@/composables/useSnackbar';
import SnackbarContainer from '../components/SnackbarContainer.vue';
import { defaultAvatarSvg } from '@/utils/defaultAvatar.js';
import employeeService from '@/api/employeeService';
import organizationService from '@/api/organizationService';
import { onMounted, onBeforeUnmount } from 'vue';
import { useSse } from '@/composables/useSse.js';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import NotificationBell from '@/components/NotificationBell.vue';
import SelectPositionModal from '@/components/member/SelectPositionModal.vue';
import SessionExpiredModal from '@/components/SessionExpiredModal.vue';

export default {
  name: 'MainLayout',
  components: { SnackbarContainer, NotificationBell, SelectPositionModal, SessionExpiredModal },
  setup() {
    const { success, error, warning, info } = useSnackbar();
    const { connect, disconnect } = useSse();
    const store = useStore();

    onMounted(() => {
      store.dispatch('notification/fetchNotifications');
      connect();
    });

    onBeforeUnmount(() => {
      disconnect();
    });

    return { success, error, warning, info };
  },
  data() {
    return {
      showSessionExpiredModal: false,
      showSelectPositionModal: false,
      defaultAvatarSvg, // Expose to template
      sidebarCollapsed: false,
      showOrgModal: false,
      showCalendarModal: false,
      activeOrgTab: 'org',
      orgSearch: '',
      employeeSearch: '',
      expandedDepartments: {
        management: false,
        sales: true
      },
      defaultExpandedOrgKeys: [],
      orgTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      allEmployees: [],
      searchedEmployees: [],
      hasSearched: false, // 검색 실행 여부 상태

      currentDate: new Date(2025, 8, 1), // 2025년 9월
      weekdays: ['일', '월', '화', '수', '목', '금', '토'],
      sessionExpiryTime: null,
      sessionTimer: null,
      currentTime: new Date(),
      sessionWarningShown: false,
      blinkerInterval: null,
      isBlinking: false,
      sessionWarningInterval: null, // Add this line

      events: [
        {
          id: 1,
          title: '주간 팀 미팅',
          date: '2025-09-20',
          type: 'meeting',
          time: '14:00'
        },
        {
          id: 2,
          title: '회의실 예약',
          date: '2025-09-22',
          type: 'reservation',
          time: '10:00'
        },
        {
          id: 3,
          title: '연차 휴가',
          date: '2025-09-25',
          type: 'vacation',
          time: '09:00'
        },
        {
          id: 4,
          title: '프로젝트 마감',
          date: '2025-09-30',
          type: 'deadline',
          time: '18:00'
        },
        {
          id: 5,
          title: '월간 보고서 회의',
          date: '2025-09-15',
          type: 'meeting',
          time: '15:00'
        },
        {
          id: 6,
          title: '고객사 미팅',
          date: '2025-09-18',
          type: 'meeting',
          time: '11:00'
        },
        {
          id: 7,
          title: '법인 차량 예약',
          date: '2025-09-19',
          type: 'reservation',
          time: '09:00'
        },
        {
          id: 8,
          title: '반차 휴가',
          date: '2025-09-23',
          type: 'vacation',
          time: '14:00'
        },
        {
          id: 9,
          title: '신규 프로젝트 킥오프',
          date: '2025-09-24',
          type: 'meeting',
          time: '10:00'
        },
        {
          id: 10,
          title: '대회의실 예약',
          date: '2025-09-26',
          type: 'reservation',
          time: '16:00'
        },
        {
          id: 11,
          title: '개인 휴가',
          date: '2025-09-27',
          type: 'vacation',
          time: '09:00'
        },
        {
          id: 12,
          title: '부서 회의',
          date: '2025-09-28',
          type: 'meeting',
          time: '14:30'
        },
        {
          id: 13,
          title: '프레젠테이션 준비',
          date: '2025-09-29',
          type: 'deadline',
          time: '17:00'
        },
        {
          id: 14,
          title: '팀 빌딩',
          date: '2025-09-30',
          type: 'meeting',
          time: '13:00'
        },
        {
          id: 15,
          title: '고객 상담',
          date: '2025-09-16',
          type: 'meeting',
          time: '10:30'
        },
        {
          id: 16,
          title: '회의실 A 예약',
          date: '2025-09-17',
          type: 'reservation',
          time: '14:00'
        },
        {
          id: 17,
          title: '개인 휴가',
          date: '2025-09-21',
          type: 'vacation',
          time: '09:00'
        },
        {
          id: 18,
          title: '프로젝트 발표',
          date: '2025-09-19',
          type: 'deadline',
          time: '16:00'
        },
        {
          id: 19,
          title: '부서 교육',
          date: '2025-09-24',
          type: 'meeting',
          time: '09:30'
        },
        {
          id: 20,
          title: '차량 예약',
          date: '2025-09-25',
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
    ...mapState('auth', ['permissions']),
    hasEmployeeReadCompanyOrSystem() {
      return this.$store.getters['auth/hasEmployeeReadCompanyOrSystem'];
    },
    hasEmployeeReadDepartment() {
      return this.$store.getters['auth/hasEmployeeReadDepartment'];
    },
    userAvatarUrl() {
      return this.user?.avatar || this.defaultAvatarSvg;
    },
    ...mapState(['user']),
    ...mapGetters(['userName', 'memberId']),
    activeMenuIndex() {
      const path = this.$route.path
      if (path.startsWith('/payroll')) {
        return path
      }
      return path
    },
    openedMenus() {
      const path = this.$route.path
      if (path.startsWith('/payroll')) {
        return ['payroll', 'payroll-management', 'payroll-inquiry']
      }
      if (path.startsWith('/employee')) {
        const opened = ['employee'];
        if (path.includes('/roles')) {
          opened.push('roles');
        }
        return opened;
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
      if (!this.sessionExpiryTime) return '00:00';
      const now = this.currentTime.getTime();
      const expiry = this.sessionExpiryTime.getTime();
      const diff = expiry - now;

      if (diff <= 0) return '00:00';

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    canExtendSession() {
      // Allow extending if there's more than 5 seconds left.
      // Backend might still validate a truly expired refresh token.
      if (!this.sessionExpiryTime) return false;
      const diff = this.sessionExpiryTime.getTime() - this.currentTime.getTime();
      return diff > 5 * 1000;
    },
    isTimeLow() {
      if (!this.sessionExpiryTime) return false;
      const diff = this.sessionExpiryTime.getTime() - this.currentTime.getTime();
      return diff > 0 && diff < 3 * 60 * 1000;
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
    '$route'() {
      this.updatePayrollMenuState()
    },
    isTimeLow(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.triggerBlink();
        this.blinkerInterval = setInterval(this.triggerBlink, 30000);
        this.showSessionWarning(); // 최초 즉시 실행
        this.sessionWarningInterval = setInterval(this.showSessionWarning, 30000);
      } else if (!newVal && oldVal) {
        clearInterval(this.blinkerInterval);
        this.blinkerInterval = null;
        clearInterval(this.sessionWarningInterval);
        this.sessionWarningInterval = null;
      }
    },
    sessionTimeLeft(newVal) {
      if (newVal === '00:00') {
        this.sessionExpiredLogout();
      }
    }
  },
  methods: {
    manualLogout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('memberId');
      localStorage.removeItem('memberPositionId');
      localStorage.removeItem('companyId');
      this.$router.push('/landing');
    },
    sessionExpiredLogout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('memberId');
      localStorage.removeItem('memberPositionId');
      localStorage.removeItem('companyId');
      this.showSessionExpiredModal = true;
    },
    handleSessionExpiredConfirm() {
      this.showSessionExpiredModal = false;
      this.$router.push('/landing');
    },
    showSessionWarning() {
      if (this.isTimeLow) {
        this.error(`${this.sessionTimeLeft} 후 자동 로그아웃됩니다.`);
      }
    },
    triggerBlink() {
      this.isBlinking = true;
      setTimeout(() => {
        this.isBlinking = false;
      }, 500);
    },
    ...mapMutations(['removeNotification']),
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    getPageTitle() {
      const titles = {
        '/': '대시보드',
        '/organization': '직원 찾기',
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
        '/admin/device-approval-management': '디바이스 승인 관리',
        '/performance/team-goal': '팀 목표 관리',
        '/performance/my-goal': '내 목표 관리',
        '/performance/review': '평가 관리',
        '/payroll': '급여 관리',
        '/payroll/policy-settings': '급여 정책 설정',
        '/payroll/item-management': '급여 기초 정보',
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
        '/resource': '예약'
      }
      return titles[this.$route.path] || 'H.ONE'
    },
    handleUserCommand(command) {
      switch (command) {
        case 'my-info':
          this.$router.push('/my-info');
          break;
        case 'notification-settings':
          this.$router.push('/my-info/notification-settings');
          break;
        case 'select-position':
          this.showSelectPositionModal = true;
          break;
        case 'logout':
          this.manualLogout();
          break
      }
    },
    handleClose(done) {
      this.showOrgModal = false
      done()
    },
    goToOrganizationManagement() {
      this.$router.push('/organization');
      this.showOrgModal = false;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    async handleOrgNodeClick(data) {
      this.hasSearched = true; // 검색 실행 상태로 변경
      console.log('Clicked Organization ID:', data.id);
      try {
        const response = await employeeService.searchEmployeesByOrganizationId(data.id);
        console.log('API Response:', response.data);
        this.searchedEmployees = response.data.data;
        this.activeOrgTab = 'employee';
      } catch (error) {
        console.error('Failed to search employees by organization:', error);
        this.error('조직별 직원 검색에 실패했습니다.');
        this.searchedEmployees = [];
      }
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
    buildOrganizationTree(flatList) {
      if (!flatList || flatList.length === 0) {
        return [];
      }
      const map = {};
      // First pass: create map and initialize children array
      flatList.forEach(org => {
        map[org.organizationId] = {
          ...org,
          id: org.organizationId,
          label: org.label,
          children: []
        };
      });

      const roots = [];
      // Second pass: link children to parents and find roots
      Object.values(map).forEach(node => {
        if (node.parentId) {
          const parent = map[node.parentId];
          if (parent) {
            parent.children.push(node);
          }
        } else {
          // No parent, it's a root
          roots.push(node);
        }
      });
      return roots;
    },
    async fetchOrganizationTree() {
      try {
        const orgTreeData = (await organizationService.getOrganizationTree()).data.data;
        this.orgTreeData = this.buildOrganizationTree(orgTreeData);

        // Expand all top-level nodes by default
        if (this.orgTreeData && this.orgTreeData.length > 0) {
          this.defaultExpandedOrgKeys = this.orgTreeData.map(rootNode => rootNode.id);
        }

      } catch (error) {
        console.error('Failed to fetch organization tree:', error);
        this.error('조직도를 불러오는데 실패했습니다.');
      }
    },
    showOrganizationModal() {
      this.showOrgModal = true;
      this.activeOrgTab = 'org'; // 조직 탭을 기본으로 설정
      this.orgSearch = '';
      this.employeeSearch = '';
      this.searchedEmployees = []; // 직원 목록 초기화
      this.hasSearched = false; // 검색 상태 초기화

      // Always fetch the latest organization tree data when the modal is opened
      this.fetchOrganizationTree();
      // this.fetchAllEmployees(); // This is for the employee tab, can be fetched when that tab is active or on demand.
    },
    async fetchAllEmployees() {
      try {
        const response = await employeeService.getAllEmployees();
        this.allEmployees = response.data.data; // Corrected to access nested 'data' property
        this.searchedEmployees = this.allEmployees;
      } catch (error) {
        console.error('Failed to fetch all employees:', error);
        this.error('직원 목록을 불러오는데 실패했습니다.');
      }
    },
    async searchEmployees() {
      this.hasSearched = true; // 검색이 실행되었음을 표시
      if (!this.employeeSearch) {
        this.searchedEmployees = [];
        return;
      }
      try {
        const response = await employeeService.searchEmployees(this.employeeSearch);
        this.searchedEmployees = response.data.data;
      } catch (error) {
        console.error('Failed to search employees:', error);
        this.error('직원 검색에 실패했습니다.');
        this.searchedEmployees = [];
      }
    },
    openCalendarModal() {
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
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const decodedToken = jwtDecode(accessToken);
          const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds

          if (expiryTime > Date.now()) {
            this.sessionExpiryTime = new Date(expiryTime);
          } else {
            this.sessionExpiryTime = new Date(Date.now());
          }
        } catch (e) {
          console.error("Failed to decode token:", e);
          this.sessionExpiryTime = new Date(Date.now());
        }
      } else {
        this.sessionExpiryTime = new Date(Date.now());
      }

      if (this.sessionTimer) {
          clearInterval(this.sessionTimer);
      }
      this.sessionTimer = setInterval(() => {
        this.currentTime = new Date();
      }, 1000);
    },
    async extendSession() {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken'); // at 가져오기
        const memberPositionId = localStorage.getItem('memberPositionId');

        if (!refreshToken || !accessToken) { // at도 확인
          this.error('토큰 연장에 필요한 정보가 없습니다. 다시 로그인해주세요.');
          return;
        }

        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/generate-at`, {
          refreshToken,
          memberPositionId
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.data && response.data.success) {
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          
          this.initSessionTimer();
          
          this.success('토큰이 성공적으로 연장되었습니다.');
        } else {
          throw new Error(response.data.message || '토큰 연장에 실패했습니다.');
        }
      } catch (err) {
        this.error('토큰 연장에 실패했습니다. 다시 로그인해주세요.');
        localStorage.clear();
        this.$router.push('/landing');
      }
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
  async created() {
    if (localStorage.getItem('accessToken')) {
      await this.fetchOrganizationTree();
      this.$store.dispatch('auth/fetchPermissions');
    }
  },
  mounted() {
    if (localStorage.getItem('accessToken')) {
      this.initSessionTimer();
    }
    this.updatePayrollMenuState();
    window.addEventListener('session-expired', this.sessionExpiredLogout);
  },
  beforeUnmount() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }
    if (this.blinkerInterval) {
      clearInterval(this.blinkerInterval);
    }
    window.removeEventListener('session-expired', this.sessionExpiredLogout);
  }
}
</script>
<style scoped>
/* ... (existing styles) */
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
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
  background: white;
  z-index: 10;
}

.organization-btn {
  width: 100%;
  justify-content: flex-start;
  color: #606266;
  font-size: 14px;
  /* padding: 12px 16px; */
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
  max-height: calc(100vh - 180px);
  /* Adjust as needed based on dialog header/footer height */
  overflow-y: auto;
}

.organization-modal {
  padding-top: 16px;
  height: 50vh;
  overflow-y: auto;
}

.employee-search-results {
  flex-grow: 1;
  position: relative;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  min-height: calc(100vh - 500px);
  /* Responsive minimum height */
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
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
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




@keyframes red-flash {
  50% { background-color: #fde2e2; }
}

.blinking {
  animation: red-flash 0.5s ease-out;
}

.session-control {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  overflow: hidden;
  font-size: 13px;
}

.timer-display {
  padding: 6px 12px;
  background-color: #f5f7fa;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.timer-display .el-icon {
  color: #0ea5e9;
  font-size: 16px;
}

.extend-button {
  padding: 6px 12px;
  border: none;
  background-color: #ffffff;
  color: #409eff;
  cursor: pointer;
  border-left: 1px solid #dcdfe6;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.extend-button:hover {
  background-color: #ecf5ff;
}

.timer-display .low-time {
  color: #f56c6c; /* Element Plus danger color */
  font-weight: 600; /* Make it bolder */
}

.employee-search-modal {
  display: flex;
  flex-direction: column;
  height: 50vh;
  /* 고정 높이 부여 (뷰포트 높이의 50%) */
}

.employee-search-bar-modal {
  padding-bottom: 16px;
}

.search-input-field .el-input__inner {
  height: 40px;
}

.search-button {
  height: 40px;
}

.employee-search-results {
  flex-grow: 1;
  /* 남은 공간을 모두 차지 */
  position: relative;
  /* 자식 요소(empty-state)를 중앙 정렬하기 위함 */
  overflow-y: auto;
  /* 내용이 많을 경우 스크롤 생성 */
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-state span {
  font-size: 16px;
}

/* el-table 스크롤바 디자인 개선 */
.employee-search-results::-webkit-scrollbar {
  width: 8px;
}

.employee-search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.employee-search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.employee-search-results::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.employee-search-results .el-table .el-table__cell {
  padding: 12px 0;
}

.employee-search-results .el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #f0f9ff !important;
}

.employee-search-results .el-table__body tr.current-row>td {
  background-color: #d9ecff !important;
}

.multi-line-cell .line-item {
  padding: 4px 0;
}

.multi-line-cell .line-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
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
</style>