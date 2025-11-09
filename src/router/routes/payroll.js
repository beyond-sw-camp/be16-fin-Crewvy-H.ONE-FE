import Payroll from '../../views/payroll/Payroll.vue'
import PayrollContractInfo from '../../views/payroll/PayrollContractInfo.vue'
import PayrollCalculation from '../../views/payroll/PayrollCalculation.vue'
import PayrollActualCalculation from '../../views/payroll/PayrollActualCalculation.vue'
import PayrollTransferOutput from '../../views/payroll/PayrollTransferOutput.vue'
import PayrollStatementOutput from '../../views/payroll/PayrollStatementOutput.vue'
import PayrollItemInquiry from '../../views/payroll/PayrollItemInquiry.vue'
import PayrollInsuranceDeduction from '../../views/payroll/PayrollInsuranceDeduction.vue'
import PayrollStatusOutput from '../../views/payroll/PayrollStatusOutput.vue'
import PayrollMyInquiry from '../../views/payroll/PayrollMyInquiry.vue'
import PayrollElderlyIncentive from '../../views/payroll/PayrollElderlyIncentive.vue'
import PayrollSettings from '../../views/payroll/PayrollSettings.vue'

const routes = [
  {
    path: '/payroll',
    name: 'Payroll',
    component: Payroll
  },
  {
    path: '/payroll/settings',
    name: 'PayrollSettings',
    component: PayrollSettings
  },
  {
    path: '/payroll/contract-info',
    name: 'PayrollContractInfo',
    component: PayrollContractInfo
  },
  {
    path: '/payroll/calculation',
    name: 'PayrollCalculation',
    component: PayrollCalculation
  },
  {
    path: '/payroll/actual-calculation',
    name: 'PayrollActualCalculation',
    component: PayrollActualCalculation
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
    path: '/payroll/my-inquiry',
    name: 'PayrollMyInquiry',
    component: PayrollMyInquiry
  },
  {
    path: '/payroll/elderly-incentive',
    name: 'PayrollElderlyIncentive',
    component: PayrollElderlyIncentive
  },
];

export default routes;
