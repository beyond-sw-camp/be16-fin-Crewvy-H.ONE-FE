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
    component: Payroll
  },
  {
    path: '/payroll/item-management',
    name: 'PayrollItemManagement',
    component: PayrollItemManagement
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
];

export default routes;
