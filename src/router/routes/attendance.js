import Attendance from '../../views/attendance/Attendance.vue'
import AdminAttendance from '../../views/attendance/AdminAttendance.vue'
import LeaveManagement from '../../views/attendance/LeaveManagement.vue'
import PolicyManagement from '../../views/PolicyManagement.vue'
import WorkLocationManagement from '../../views/attendance/WorkLocationManagement.vue'
import AuditLog from '../../views/AuditLog.vue'
import LeaveRequest from '../../views/attendance/LeaveRequest.vue'
import SharedCalendar from '../../views/SharedCalendar.vue'
import LeavePolicyEditor from '../../views/policy/LeavePolicyEditor.vue'
import BusinessTripPolicyEditor from '../../views/policy/BusinessTripPolicyEditor.vue'
import WorkPolicyEditor from '../../views/policy/WorkPolicyEditor.vue'
import BalanceManagement from '../../views/admin/BalanceManagement.vue'
import ApprovalLineManagement from '../../views/admin/ApprovalLineManagement.vue'

const routes = [
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true }
  },
  {
    path: '/leave-request',
    name: 'LeaveRequest',
    component: LeaveRequest,
    meta: { requiresAuth: true }
  },
  {
    path: '/shared-calendar',
    name: 'SharedCalendar',
    component: SharedCalendar,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/attendance',
    name: 'AdminAttendance',
    component: AdminAttendance,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/leave-management',
    name: 'LeaveManagement',
    component: LeaveManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/policy-management',
    name: 'PolicyManagement',
    component: PolicyManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/policy-management/create',
    name: 'PolicyCreate',
    component: () => import('@/views/attendance/PolicyEditor.vue')
  },
  {
    path: '/admin/policy-management/edit/:policyId',
    name: 'PolicyEdit',
    component: () => import('@/views/attendance/PolicyEditor.vue'),
    props: true // URL 파라미터를 컴포넌트의 props로 전달
  },
  {
    path: '/admin/work-location-management',
    name: 'WorkLocationManagement',
    component: WorkLocationManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/audit-log',
    name: 'AuditLog',
    component: AuditLog,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/policy-management/leave-editor',
    name: 'LeavePolicyEditor',
    component: LeavePolicyEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/policy-management/trip-editor',
    name: 'BusinessTripPolicyEditor',
    component: BusinessTripPolicyEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/policy-management/work-editor',
    name: 'WorkPolicyEditor',
    component: WorkPolicyEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/policy/overtime-request',
    name: 'OvertimeRequest',
    component: () => import('../../views/policy/OvertimeRequest.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/policy/expense-report',
    name: 'ExpenseReport',
    component: () => import('../../views/policy/ExpenseReport.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/policy/vacation-request',
    name: 'VacationRequestForm',
    component: () => import('../../views/policy/VacationRequestForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/policy/business-trip-request',
    name: 'BusinessTripRequestForm',
    component: () => import('../../views/policy/BusinessTripRequestForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/policy/resource-booking',
    name: 'ResourceBookingForm',
    component: () => import('../../views/policy/ResourceBookingForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/policy/other-approval',
    name: 'OtherApprovalForm',
    component: () => import('../../views/policy/OtherApprovalForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/balance',
    name: 'BalanceManagement',
    component: BalanceManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/approval-lines',
    name: 'ApprovalLineManagement',
    component: ApprovalLineManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/work-schedule',
    name: 'WorkScheduleManagement',
    component: () => import('../../views/admin/WorkScheduleManagement.vue'),
    meta: { requiresAuth: true }
  },
];

export default routes;
