import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Organization from '../views/Organization.vue'
import Employee from '../views/Employee.vue'
import Attendance from '../views/Attendance.vue'
import Payroll from '../views/Payroll.vue'
import PayrollBasicInfo from '../views/payroll/PayrollBasicInfo.vue'
import PayrollItemManagement from '../views/payroll/PayrollItemManagement.vue'
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
import ResourceReservation from '../views/resource/ResourceReservation.vue'
import ResourceManagement from '../views/resource/ResourceManagement.vue'
import Landing from '../views/Landing.vue'

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
    path: '/payroll/item-management',
    name: 'PayrollItemManagement',
    component: PayrollItemManagement
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
    path: '/board',
    name: 'Board',
    component: Board
  },
  {
    path: '/resource/reservation',
    name: 'ResourceReservation',
    component: ResourceReservation
  },
  {
    path: '/resource/management',
    name: 'ResourceManagement',
    component: ResourceManagement
  },
  {
    path: '/landing',
    name: 'Landing',
    component: Landing
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
