import PolicyEditor from '@/views/attendance/PolicyEditor.vue';
import PolicyAssignment from '@/views/attendance/PolicyAssignment.vue';
import TeamAttendanceStatus from '../../views/attendance/TeamAttendanceStatus.vue';

const attendanceRoutes = [
  {
    path: '/attendance', // "내 근태 현황"은 그대로 유지
    name: 'AttendanceManagement',
    component: () => import('@/views/attendance/Attendance.vue'),
    meta: { requiresAuth: true, title: '내 근태 현황' }
  },
  {
    path: '/leave-request',
    name: 'LeaveRequest',
    component: () => import('@/views/attendance/LeaveRequest.vue'),
    meta: { requiresAuth: true, title: '휴가/출장 신청' }
  },
  {
    path: '/admin/policy-management', // 경로 수정
    name: 'PolicyManagement',
    component: () => import('@/views/PolicyManagement.vue'),
    meta: { requiresAuth: true, title: '정책 관리' }
  },
  {
    path: '/admin/policy-management/create', // 경로 수정
    name: 'PolicyCreate',
    component: PolicyEditor,
    meta: { requiresAuth: true, title: '새 정책 생성' }
  },
  {
    path: '/admin/policy-management/edit/:policyId', // 경로 수정
    name: 'PolicyEdit',
    component: PolicyEditor,
    meta: { requiresAuth: true, title: '정책 수정' }
  },
  {
    path: '/admin/policy-assignment', // 경로 수정
    name: 'PolicyAssignment',
    component: PolicyAssignment,
    meta: { requiresAuth: true, title: '정책 할당' }
  },
  {
    path: '/team-attendance-status',
    name: 'TeamAttendanceStatus',
    component: TeamAttendanceStatus,
    meta: { requiresAuth: true, title: '팀원 근태 현황' }
  },
  {
    path: '/admin/work-location-management',
    name: 'WorkLocationManagement',
    component: () => import('@/views/attendance/WorkLocationManagement.vue'),
    meta: { requiresAuth: true, title: '근무지 관리' }
  },
  {
    path: '/admin/device-approval-management',
    name: 'DeviceApprovalManagement',
    component: () => import('@/views/admin/DeviceApprovalManagement.vue'),
    meta: { requiresAuth: true, title: '디바이스 승인 관리' }
  }
];

export default attendanceRoutes;
