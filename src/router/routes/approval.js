import ApprovalView from "@/views/Approval/ApprovalView.vue";
import ApprovalTemplateManagement from '../../views/Approval/ApprovalTemplateManagement.vue';

// Policy Form Imports
import ExpenseReport from '@/views/policy/ExpenseReport.vue';
import OvertimeRequest from '@/views/policy/OvertimeRequest.vue';
import VacationRequestForm from '@/views/policy/VacationRequestForm.vue';
import BusinessTripRequestForm from '@/views/policy/BusinessTripRequestForm.vue';
import ResourceBookingForm from '@/views/policy/ResourceBookingForm.vue';
import OtherApprovalForm from '@/views/policy/OtherApprovalForm.vue';

const routes = [
  {
    path: '/approval',
    name: 'ApprovalView',
    component: ApprovalView
  },
  {
    path: '/approval/templates',
    name: 'ApprovalTemplateManagement',
    component: ApprovalTemplateManagement
  },
  // Policy Form Routes
  {
    path: '/approval/expense-report/:templateId?', // templateId is optional
    name: 'ApprovalExpenseReport',
    component: ExpenseReport,
    props: true // Pass route.params as props
  },
  {
    path: '/approval/overtime-request/:templateId?',
    name: 'ApprovalOvertimeRequest',
    component: OvertimeRequest,
    props: true
  },
  {
    path: '/approval/vacation-request/:templateId?',
    name: 'ApprovalVacationRequest',
    component: VacationRequestForm,
    props: true
  },
  {
    path: '/approval/business-trip-request/:templateId?',
    name: 'ApprovalBusinessTripRequest',
    component: BusinessTripRequestForm,
    props: true
  },
  {
    path: '/approval/resource-booking/:templateId?',
    name: 'ApprovalResourceBooking',
    component: ResourceBookingForm,
    props: true
  },
  {
    path: '/approval/other-form/:templateId?',
    name: 'ApprovalOtherForm',
    component: OtherApprovalForm,
    props: true
  },
];

export default routes;
