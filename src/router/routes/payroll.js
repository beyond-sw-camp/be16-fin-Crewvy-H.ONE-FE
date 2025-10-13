import Payroll from '../../views/payroll/Payroll.vue'
import PayrollBasicInfo from '../../views/payroll/PayrollBasicInfo.vue'
import PayrollCalculation from '../../views/payroll/PayrollCalculation.vue'
import PayrollTransferOutput from '../../views/payroll/PayrollTransferOutput.vue'
import PayrollStatementOutput from '../../views/payroll/PayrollStatementOutput.vue'
import PayrollItemInquiry from '../../views/payroll/PayrollItemInquiry.vue'
import PayrollInsuranceDeduction from '../../views/payroll/PayrollInsuranceDeduction.vue'
import PayrollStatusOutput from '../../views/payroll/PayrollStatusOutput.vue'
import PayrollWithholdingReport from '../../views/payroll/PayrollWithholdingReport.vue'
import PayrollElderlyIncentive from '../../views/payroll/PayrollElderlyIncentive.vue'
import PayrollItemManagement from '../../views/payroll/PayrollItemManagement.vue'

const routes = [
  {
    path: '/payroll',
    name: 'Payroll',
    component: Payroll,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/item-management',
    name: 'PayrollItemManagement',
    component: PayrollItemManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/basic-info',
    name: 'PayrollBasicInfo',
    component: PayrollBasicInfo,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/calculation',
    name: 'PayrollCalculation',
    component: PayrollCalculation,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/transfer-output',
    name: 'PayrollTransferOutput',
    component: PayrollTransferOutput,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/statement-output',
    name: 'PayrollStatementOutput',
    component: PayrollStatementOutput,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/item-inquiry',
    name: 'PayrollItemInquiry',
    component: PayrollItemInquiry,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/insurance-deduction',
    name: 'PayrollInsuranceDeduction',
    component: PayrollInsuranceDeduction,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/status-output',
    name: 'PayrollStatusOutput',
    component: PayrollStatusOutput,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/withholding-report',
    name: 'PayrollWithholdingReport',
    component: PayrollWithholdingReport,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/elderly-incentive',
    name: 'PayrollElderlyIncentive',
    component: PayrollElderlyIncentive,
    meta: { requiresAuth: true }
  },
];

export default routes;
