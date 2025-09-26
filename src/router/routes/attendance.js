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
    component: Attendance
  },
  {
    path: '/leave-request',
    name: 'LeaveRequest',
    component: LeaveRequest
  },
  {
    path: '/shared-calendar',
    name: 'SharedCalendar',
    component: SharedCalendar
  },
  {
    path: '/admin/attendance',
    name: 'AdminAttendance',
    component: AdminAttendance
  },
  {
    path: '/admin/leave-management',
    name: 'LeaveManagement',
    component: LeaveManagement
  },
  {
    path: '/admin/policy-management',
    name: 'PolicyManagement',
    component: PolicyManagement
  },
  {
    path: '/admin/work-location-management',
    name: 'WorkLocationManagement',
    component: WorkLocationManagement
  },
  {
    path: '/admin/audit-log',
    name: 'AuditLog',
    component: AuditLog
  },
  {
    path: '/admin/policy-management/leave-editor',
    name: 'LeavePolicyEditor',
    component: LeavePolicyEditor
  },
  {
    path: '/admin/policy-management/trip-editor',
    name: 'BusinessTripPolicyEditor',
    component: BusinessTripPolicyEditor
  },
  {
    path: '/admin/policy-management/work-editor',
    name: 'WorkPolicyEditor',
    component: WorkPolicyEditor
  },
  {
    path: '/policy/overtime-request',
    name: 'OvertimeRequest',
    component: () => import('../../views/policy/OvertimeRequest.vue')
  },
  {
    path: '/policy/expense-report',
    name: 'ExpenseReport',
    component: () => import('../../views/policy/ExpenseReport.vue')
  },
  {
    path: '/policy/vacation-request',
    name: 'VacationRequestForm',
    component: () => import('../../views/policy/VacationRequestForm.vue')
  },
  {
    path: '/policy/business-trip-request',
    name: 'BusinessTripRequestForm',
    component: () => import('../../views/policy/BusinessTripRequestForm.vue')
  },
  {
    path: '/policy/resource-booking',
    name: 'ResourceBookingForm',
    component: () => import('../../views/policy/ResourceBookingForm.vue')
  },
  {
    path: '/policy/other-approval',
    name: 'OtherApprovalForm',
    component: () => import('../../views/policy/OtherApprovalForm.vue')
  },
  {
    path: '/admin/balance',
    name: 'BalanceManagement',
    component: BalanceManagement
  },
  {
    path: '/admin/approval-lines',
    name: 'ApprovalLineManagement',
    component: ApprovalLineManagement
  },
  {
    path: '/admin/work-schedule',
    name: 'WorkScheduleManagement',
    component: () => import('../../views/admin/WorkScheduleManagement.vue')
  },
];

export default routes;
