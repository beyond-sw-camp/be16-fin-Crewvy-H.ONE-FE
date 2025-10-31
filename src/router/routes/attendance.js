import PolicyEditor from '@/views/attendance/PolicyEditor.vue';
import PolicyAssignment from '@/views/attendance/PolicyAssignment.vue';

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
    path: '/shared-calendar',
    name: 'SharedCalendar',
    component: () => import('@/views/SharedCalendar.vue'),
    meta: { requiresAuth: true, title: '공유 캘린더' }
  },
  {
    path: '/admin/attendance',
    name: 'AdminAttendance',
    component: () => import('@/views/attendance/AdminAttendance.vue'),
    meta: { requiresAuth: true, title: '근태 현황' }
  },
  {
    path: '/admin/leave-management',
    name: 'AdminLeaveManagement',
    component: () => import('@/views/attendance/LeaveManagement.vue'),
    meta: { requiresAuth: true, title: '연차 현황' }
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
    redirect: '/admin/attendance',
    meta: { requiresAuth: true }
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
  },
  {
    path: '/admin/audit-log',
    name: 'AuditLog',
    component: () => import('@/views/AuditLog.vue'),
    meta: { requiresAuth: true, title: '감사 로그' }
  }
];

export default attendanceRoutes;
