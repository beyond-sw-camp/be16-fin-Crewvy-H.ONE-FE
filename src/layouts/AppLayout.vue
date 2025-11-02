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
          <!-- 세션 연장 버튼 -->
          <div class="session-control">
            <div class="timer-display" :class="{ blinking: isBlinking }">
              <el-icon><Clock /></el-icon>
              <span :class="{ 'low-time': isTimeLow }">{{ sessionTimeLeft }}</span>
            </div>
            <button class="extend-button" @click="extendSession">
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
                <div v-for="event in day.events.slice(0, 3)" :key="event.id" class="event-item" :class="event.type"
                  @click="viewEvent(event)">
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
      <template #footer>
        <el-button @click="showCalendarModal = false">닫기</el-button>
      </template>
    </el-dialog>

    <!-- 일정 전체 보기 다이얼로그 -->
    <el-dialog v-model="showAllEventsDialog" :title="selectedDayTitle" width="600px">
      <div class="all-events-list">
        <div v-if="selectedDayEvents.length === 0" class="no-events">
          <p>일정이 없습니다.</p>
        </div>
        <div v-for="event in selectedDayEvents" :key="event.id" class="full-event-item" :class="event.type">
          <div class="event-header">
            <span class="event-title">{{ event.title }}</span>
            <span class="event-time">{{ event.time }}</span>
          </div>
          <div class="event-type-badge" :class="event.type">{{ getEventTypeName(event.type) }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAllEventsDialog = false">닫기</el-button>
      </template>
    </el-dialog>

    <!-- 일정 상세 보기 다이얼로그 -->
    <el-dialog 
      v-model="showEventDetailDialog" 
      :title="eventDetailTitle" 
      width="580px"
      class="event-dialog"
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
          <el-date-picker 
            v-model="editEventForm.startDate" 
            type="datetime" 
            placeholder="시작 날짜 및 시간 선택" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;" 
          />
        </el-form-item>
        <el-form-item label="종료 날짜" required>
          <el-date-picker 
            v-model="editEventForm.endDate" 
            type="datetime" 
            placeholder="종료 날짜 및 시간 선택" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;" 
          />
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
        <div v-else class="dialog-footer">
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
      width="560px" 
      :before-close="handleEventDialogClose"
      class="event-dialog"
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
          <el-date-picker 
            v-model="eventForm.startDate" 
            type="datetime" 
            placeholder="시작 날짜 및 시간 선택" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="종료 날짜" required>
          <el-date-picker 
            v-model="eventForm.endDate" 
            type="datetime" 
            placeholder="종료 날짜 및 시간 선택" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleEventDialogClose" size="large">취소</el-button>
          <el-button type="primary" @click="saveEvent" size="large">
            <el-icon style="margin-right: 6px;"><CirclePlus /></el-icon>
            저장
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 스낵바 컨테이너 -->
    <SnackbarContainer />

    <!-- 직무 선택 모달 -->
    <SelectPositionModal v-if="showSelectPositionModal" @close="showSelectPositionModal = false" />
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
import apiClient from '@/api/http';
import NotificationBell from '@/components/NotificationBell.vue';
import SelectPositionModal from '@/components/member/SelectPositionModal.vue';
import { ArrowLeft, ArrowRight, CirclePlus, Delete, Edit, CircleCheck, Notebook, Document, Tickets, Clock } from '@element-plus/icons-vue';

export default {
  name: 'MainLayout',
  components: { 
    SnackbarContainer, 
    NotificationBell, 
    SelectPositionModal,
    CirclePlus,
    Delete,
    Edit,
    CircleCheck,
    Notebook,
    Document,
    Tickets,
    Clock
  },
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
      showSelectPositionModal: false,
      defaultAvatarSvg, // Expose to template
      sidebarCollapsed: false,
      showOrgModal: false,
      showCalendarModal: false,
      showAllEventsDialog: false,
      selectedDayEvents: [],
      selectedDayTitle: '',
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

      currentDate: new Date(), // 현재 날짜
      weekdays: ['일', '월', '화', '수', '목', '금', '토'],
      ArrowLeft,
      ArrowRight,
      sessionExpiryTime: null,
      sessionTimer: null,
      currentTime: new Date(),
      sessionWarningShown: false, // 세션 경고 표시 여부 추적
      blinkerInterval: null,
      isBlinking: false,

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
        contents: '',
        startDate: '',
        endDate: ''
      },
      showEventDetailDialog: false,
      isEditingEvent: false,
      selectedEvent: {},
      editEventForm: {
        id: null,
        title: '',
        contents: '',
        startDate: '',
        endDate: ''
      }
    }
  },
  computed: {
    ...mapState('auth', ['permissions']),
    eventDetailTitle() {
      return this.isEditingEvent ? '일정 수정' : '일정 상세';
    },
    canEditEvent() {
      // 개인일정만 수정/삭제 가능 (화상회의, 예약, 휴가, 출장 등은 다른 시스템에서 관리)
      return this.selectedEvent.typeName === '개인일정' || this.selectedEvent.type === 'personal';
    },
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
      } else if (!newVal && oldVal) {
        clearInterval(this.blinkerInterval);
        this.blinkerInterval = null;
      }
    }
  },
  methods: {
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
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userName');
          localStorage.removeItem('memberId');
          localStorage.removeItem('memberPositionId');
          localStorage.removeItem('companyId');
          this.$router.push('/landing');
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
    async openCalendarModal() {
      console.log('🔵 openCalendarModal 호출됨!')
      this.showCalendarModal = true
      console.log('🔵 showCalendarModal = true 설정됨')
      await this.fetchMySchedule()
      console.log('🔵 fetchMySchedule 완료')
    },
    async fetchMySchedule() {
      console.log('🟢 fetchMySchedule 메서드 시작!')
      try {
        // 캘린더에 표시되는 년월 가져오기
        console.log('🟢 currentDate:', this.currentDate)
        const year = this.currentDate.getFullYear()
        const month = this.currentDate.getMonth() + 1 // getMonth()는 0부터 시작하므로 +1
        console.log('🟢 year:', year, 'month:', month)

        const params = {
          searchType: 'Month',
          year: year,
          month: month
        };
        
        console.log('=== 캘린더 일정 조회 ===');
        console.log('파라미터 객체:', params);
        console.log('각 파라미터 값:', {
          searchType: params.searchType,
          year: params.year,
          month: params.month
        });

        // 쿼리 파라미터를 직접 URL에 추가하는 방식으로 시도
        const queryString = `?searchType=${encodeURIComponent(params.searchType)}&year=${params.year}&month=${params.month}`;
        const urlWithParams = `/workspace-service/calendar/find-my-schedule${queryString}`;
        
        console.log('📤 요청 URL:', urlWithParams);
        
        const response = await apiClient.get(urlWithParams);
        
        console.log('📥 응답 받은 후 실제 요청 정보:');
        console.log('- 요청 URL:', response.config?.url);
        console.log('- 요청 파라미터:', response.config?.params);
        // API 응답 데이터를 events 형식으로 변환
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
        
        console.log('📋 받은 일정 데이터:', scheduleData);
        
        // typeName을 캘린더 타입으로 매핑하는 함수
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
          return typeMapping[typeName] || 'personal'; // 기본값: 개인일정
        };
        
        // CalendarResDto 형식으로 변환
        // { title, typeName, startDate (LocalDateTime), endDate (LocalDateTime) }
        const allEvents = [];
        
        scheduleData.forEach((item, index) => {
          // LocalDateTime 파싱 (예: "2025-09-20T14:00:00" 형식)
          const startDateTime = item.startDate ? new Date(item.startDate) : null;
          const endDateTime = item.endDate ? new Date(item.endDate) : startDateTime;
          
          if (!startDateTime) return; // startDate가 없으면 스킵
          
          // 시작일부터 종료일까지 모든 날짜에 일정 추가
          const currentDate = new Date(startDateTime);
          currentDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
          
          const endDate = new Date(endDateTime);
          endDate.setHours(0, 0, 0, 0);
          
          // 시간 문자열 추출 (HH:mm)
          const timeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`;
          
          // typeName 매핑
          const calendarType = mapTypeNameToCalendarType(item.typeName);
          
          // 시작일부터 종료일까지 반복
          while (currentDate <= endDate) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            
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
            
            // 다음 날로 이동
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
        
        this.events = allEvents;
        console.log('✅ 변환된 events:', this.events);
      } catch (error) {
        console.error('❌ 일정 조회 실패:', error)
        console.error('❌ 에러 상세:', error.response || error.message)
        // 에러 발생 시 기본 이벤트 유지
        this.error('일정을 불러오는데 실패했습니다.')
      }
    },
    handleCalendarClose(done) {
      this.showCalendarModal = false
      done()
    },
    showAllEvents(day) {
      this.selectedDayEvents = day.events;
      this.selectedDayTitle = `${day.date} 일정 (${day.events.length}개)`;
      this.showAllEventsDialog = true;
    },
    getEventTypeName(type) {
      const typeNames = {
        'meeting': '화상회의',
        'reservation': '예약',
        'vacation': '휴가',
        'businessTrip': '출장',
        'personal': '개인일정'
      };
      return typeNames[type] || '기타';
    },
    formatLocalDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      // 월이 변경되면 일정 다시 불러오기
      this.fetchMySchedule()
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      // 월이 변경되면 일정 다시 불러오기
      this.fetchMySchedule()
    },
    addEvent(defaultDate) {
      // 폼 초기화
      this.eventForm.title = ''
      this.eventForm.contents = ''
      
      // 기본 날짜가 넘어오면 시작일로 세팅 (달력 날짜 더블클릭 진입)
      if (defaultDate) {
        this.eventForm.startDate = `${defaultDate}T09:00:00`
        this.eventForm.endDate = `${defaultDate}T10:00:00`
      } else {
        // 모달 상단 버튼 클릭 진입 시 현재 날짜 및 시간 기본값
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const hh = String(now.getHours()).padStart(2, '0')
        const min = String(now.getMinutes()).padStart(2, '0')
        
        this.eventForm.startDate = `${yyyy}-${mm}-${dd}T${hh}:${min}:00`
        
        // 종료 시간은 시작 시간 + 1시간
        const endTime = new Date(now.getTime() + 60 * 60 * 1000)
        const endHH = String(endTime.getHours()).padStart(2, '0')
        const endMin = String(endTime.getMinutes()).padStart(2, '0')
        this.eventForm.endDate = `${yyyy}-${mm}-${dd}T${endHH}:${endMin}:00`
      }
      this.showEventDialog = true
    },
    handleEventDialogClose(done) {
      this.showEventDialog = false
      this.eventForm = {
        title: '',
        contents: '',
        startDate: '',
        endDate: ''
      }
      if (done && typeof done === 'function') {
        done()
      }
    },
    async saveEvent() {
      const { title, contents, startDate, endDate } = this.eventForm
      if (!title || !startDate || !endDate) {
        this.warning('필수 항목을 입력해주세요.')
        return
      }
      
      // 시작일이 종료일보다 나중이면 경고
      if (new Date(startDate) > new Date(endDate)) {
        this.warning('종료 날짜는 시작 날짜보다 이후여야 합니다.')
        return
      }
      
      try {
        // PersonalScheduleReqDto 형식으로 전송
        await apiClient.post('/workspace-service/calendar/post-my-schedule', {
          title: title,
          contents: contents || '', // contents가 없으면 빈 문자열
          startDate: startDate,
          endDate: endDate
        })
        
        this.success('일정이 추가되었습니다.')
        this.showEventDialog = false
        
        // 일정 목록 새로고침
        await this.fetchMySchedule()
      } catch (error) {
        console.error('일정 추가 실패:', error)
        this.error('일정 추가에 실패했습니다.')
      }
    },
    viewEvent(event) {
      this.selectedEvent = { ...event };
      this.isEditingEvent = false;
      this.showEventDetailDialog = true;
    },
    startEditEvent() {
      this.editEventForm = {
        id: this.selectedEvent.scheduleId,
        title: this.selectedEvent.title,
        contents: this.selectedEvent.contents || '',
        startDate: this.selectedEvent.startDate,
        endDate: this.selectedEvent.endDate
      };
      this.isEditingEvent = true;
    },
    cancelEditEvent() {
      this.isEditingEvent = false;
    },
    async updateEvent() {
      const { id, title, contents, startDate, endDate } = this.editEventForm;
      if (!title || !startDate || !endDate) {
        this.warning('필수 항목을 입력해주세요.');
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        this.warning('종료 날짜는 시작 날짜보다 이후여야 합니다.');
        return;
      }
      
      try {
        // PATCH 요청으로 수정
        await apiClient.patch(`/workspace-service/calendar/update-my-schedule/${id}`, {
          title: title,
          contents: contents || '',
          startDate: startDate,
          endDate: endDate
        });
        
        this.success('일정이 수정되었습니다.');
        this.showEventDetailDialog = false;
        this.isEditingEvent = false;
        
        // 일정 목록 새로고침
        await this.fetchMySchedule();
      } catch (error) {
        console.error('일정 수정 실패:', error);
        this.error('일정 수정에 실패했습니다.');
      }
    },
    async deleteEvent() {
      try {
        await this.$confirm('정말로 이 일정을 삭제하시겠습니까?', '일정 삭제', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning'
        });
        
        // DELETE 요청으로 삭제 (요청 본문 없음)
        await apiClient.delete(`/workspace-service/calendar/delete-my-schedule/${this.selectedEvent.scheduleId}`);
        
        this.success('일정이 삭제되었습니다.');
        this.showEventDetailDialog = false;
        
        // 일정 목록 새로고침
        await this.fetchMySchedule();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('일정 삭제 실패:', error);
          this.error('일정 삭제에 실패했습니다.');
        }
      }
    },
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    getEventTagType(typeName) {
      const typeMap = {
        '화상회의': 'primary',
        '예약': 'success',
        '휴가': 'warning',
        '출장': 'danger',
        '개인일정': ''
      };
      return typeMap[typeName] || '';
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
    // handleSessionExpiry() {
    //   clearInterval(this.sessionTimer)
    //   this.error('세션이 만료되었습니다. 다시 로그인해주세요.')
    //   // 실제로는 로그인 페이지로 리다이렉트
    //   this.info('로그인 페이지로 이동합니다.')
    // },
    // showSessionWarning() {
    //   this.warning('세션이 곧 만료됩니다. (5분 남음)')
    // },
    async extendSession() {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const memberPositionId = localStorage.getItem('memberPositionId');

        if (!refreshToken) {
          this.error('세션 연장에 필요한 정보가 없습니다. 다시 로그인해주세요.');
          return;
        }

        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/generate-at`, {
          refreshToken,
          memberPositionId
        });

        if (response.data && response.data.success) {
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          
          this.initSessionTimer();
          
          this.success('세션이 성공적으로 연장되었습니다.');
        } else {
          throw new Error(response.data.message || '세션 연장에 실패했습니다.');
        }
      } catch (err) {
        this.error('세션 연장에 실패했습니다. 다시 로그인해주세요.');
        localStorage.clear();
        this.$router.push('/login');
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
  },
  beforeUnmount() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }
    if (this.blinkerInterval) {
      clearInterval(this.blinkerInterval);
    }
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

.event-item.businessTrip {
  background: #fee2e2;
  color: #dc2626;
}

.event-item.personal {
  background: #f3e8ff;
  color: #7c3aed;
}

.event-item:hover {
  transform: scale(1.05);
}

.more-events {
  font-size: 10px;
  color: #606266;
  font-style: italic;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.more-events:hover {
  background: #f5f7fa;
  color: #409eff;
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
  background: #3b82f6;
}

.legend-color.reservation {
  background: #10b981;
}

.legend-color.vacation {
  background: #f59e0b;
}

.legend-color.businessTrip {
  background: #ef4444;
}

.legend-color.personal {
  background: #8b5cf6;
}

/* 전체 일정 보기 모달 스타일 */
.all-events-list {
  max-height: 500px;
  overflow-y: auto;
}

.no-events {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.full-event-item {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.full-event-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.full-event-item.meeting {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.full-event-item.reservation {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.full-event-item.vacation {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.full-event-item.businessTrip {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.full-event-item.personal {
  border-left-color: #8b5cf6;
  background: #faf5ff;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.event-time {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.event-type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

/* 일정 다이얼로그 공통 스타일 */
.event-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.event-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.event-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;
}

.event-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}

/* 일정 폼 스타일 */
.event-form {
  padding: 4px 0;
}

.event-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.event-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  line-height: 32px;
}

.event-form :deep(.el-form-item.is-required .el-form-item__label::before) {
  color: #f56c6c;
  margin-right: 4px;
}

.event-form :deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
}

.event-form :deep(.el-textarea__inner) {
  padding: 12px 15px;
  line-height: 1.6;
  border-radius: 4px;
}

/* 일정 상세 보기 스타일 */
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
  color: #606266;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.datetime-separator {
  margin: 0 12px;
  color: #909399;
  font-weight: 400;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-footer > div {
  display: flex;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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