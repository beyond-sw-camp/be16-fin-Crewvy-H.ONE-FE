import Approval from "@/views/Approval/Approval.vue";
import ApprovalTemplateManagement from '../../views/Approval/ApprovalTemplateManagement.vue'

const routes = [
  {
    path: '/approval',
    name: 'Approval',
    component: Approval
  },
  {
    path: '/approval/templates',
    name: 'ApprovalTemplateManagement',
    component: ApprovalTemplateManagement
  },
];

export default routes;
