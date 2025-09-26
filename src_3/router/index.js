import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Organization from '../views/Organization.vue'
import Employee from '../views/Employee.vue'
import Attendance from '../views/Attendance.vue'
import Payroll from '../views/Payroll.vue'
import PayrollBasicInfo from '../views/payroll/PayrollBasicInfo.vue'
import PayrollCalculation from '../views/payroll/PayrollCalculation.vue'
import PayrollTransferOutput from '../views/payroll/PayrollTransferOutput.vue'
import PayrollStatementOutput from '../views/payroll/PayrollStatementOutput.vue'
import PayrollItemInquiry from '../views/payroll/PayrollItemInquiry.vue'
import PayrollInsuranceDeduction from '../views/payroll/PayrollInsuranceDeduction.vue'
import PayrollStatusOutput from '../views/payroll/PayrollStatusOutput.vue'
import PayrollWithholdingReport from '../views/payroll/PayrollWithholdingReport.vue'
import PayrollElderlyIncentive from '../views/payroll/PayrollElderlyIncentive.vue'
import Chat from '../views/Chat.vue'
import Meeting from '../views/Meeting.vue'
import Approval from '../views/Approval.vue'
import Board from '../views/Board.vue'
import Resource from '../views/Resource.vue'
import AdminAttendance from '../views/AdminAttendance.vue'
import LeaveManagement from '../views/LeaveManagement.vue'
import PolicyManagement from '../views/PolicyManagement.vue'
import WorkLocationManagement from '../views/WorkLocationManagement.vue'
import AuditLog from '../views/AuditLog.vue'
import LeaveRequest from '../views/LeaveRequest.vue'
import SharedCalendar from '../views/SharedCalendar.vue'
import LeavePolicyEditor from '../views/policy/LeavePolicyEditor.vue'
import BusinessTripPolicyEditor from '../views/policy/BusinessTripPolicyEditor.vue'
import WorkPolicyEditor from '../views/policy/WorkPolicyEditor.vue'
import BalanceManagement from '../views/admin/BalanceManagement.vue'
import ApprovalLineManagement from '../views/admin/ApprovalLineManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/organization',
    name: 'Organization',
    component: Organization
  },
  {
    path: '/employee',
    name: 'Employee',
    component: Employee
  },
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
    component: () => import('../views/policy/OvertimeRequest.vue')
  },
  {
    path: '/policy/expense-report',
    name: 'ExpenseReport',
    component: () => import('../views/policy/ExpenseReport.vue')
  },
  {
    path: '/policy/vacation-request',
    name: 'VacationRequestForm',
    component: () => import('../views/policy/VacationRequestForm.vue')
  },
  {
    path: '/policy/business-trip-request',
    name: 'BusinessTripRequestForm',
    component: () => import('../views/policy/BusinessTripRequestForm.vue')
  },
  {
    path: '/policy/resource-booking',
    name: 'ResourceBookingForm',
    component: () => import('../views/policy/ResourceBookingForm.vue')
  },
  {
    path: '/policy/other-approval',
    name: 'OtherApprovalForm',
    component: () => import('../views/policy/OtherApprovalForm.vue')
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
    component: () => import('../views/admin/WorkScheduleManagement.vue')
  },
  {
    path: '/payroll',
    name: 'Payroll',
    component: Payroll
  },
  {
    path: '/payroll/basic-info',
    name: 'PayrollBasicInfo',
    component: PayrollBasicInfo
  },
  {
    path: '/payroll/calculation',
    name: 'PayrollCalculation',
    component: PayrollCalculation
  },
  {
    path: '/payroll/transfer-output',
    name: 'PayrollTransferOutput',
    component: PayrollTransferOutput
  },
  {
    path: '/payroll/statement-output',
    name: 'PayrollStatementOutput',
    component: PayrollStatementOutput
  },
  {
    path: '/payroll/item-inquiry',
    name: 'PayrollItemInquiry',
    component: PayrollItemInquiry
  },
  {
    path: '/payroll/insurance-deduction',
    name: 'PayrollInsuranceDeduction',
    component: PayrollInsuranceDeduction
  },
  {
    path: '/payroll/status-output',
    name: 'PayrollStatusOutput',
    component: PayrollStatusOutput
  },
  {
    path: '/payroll/withholding-report',
    name: 'PayrollWithholdingReport',
    component: PayrollWithholdingReport
  },
  {
    path: '/payroll/elderly-incentive',
    name: 'PayrollElderlyIncentive',
    component: PayrollElderlyIncentive
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/meeting',
    name: 'Meeting',
    component: Meeting
  },
  {
    path: '/approval',
    name: 'Approval',
    component: Approval
  },
  {
    path: '/approval/templates',
    name: 'ApprovalTemplateManagement',
    component: () => import('../views/approval/ApprovalTemplateManagement.vue')
  },
  {
    path: '/board',
    name: 'Board',
    component: Board
  },
  {
    path: '/resource',
    name: 'Resource',
    component: Resource
  },
  {
    path: '/landing',
    name: 'LandingPage',
    component: () => import('../views/LandingPage.vue'),
    meta: { hideLayout: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
