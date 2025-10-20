import Approval from "@/views/Approval/ApprovalView.vue";
import ApprovalTemplateList from '@/views/Approval/ApprovalTemplateList.vue';
import ApprovalRequestForm from "@/views/Approval/ApprovalRequestForm.vue";
import ApprovalDetailView from "@/views/Approval/ApprovalDetailView.vue";

const routes = [
  {
    path: '/approval',
    name: 'Approval',
    component: Approval
  },
  {
    path: '/approval/templates/list',
    name: 'ApprovalTemplateList',
    component: ApprovalTemplateList
  },
  {
    path: '/approval/form/:documentId',
    name: 'ApprovalRequestForm',
    component: ApprovalRequestForm
  },
  {
    path: '/approval/form/draft/:id',
    name: 'ApprovalDraftForm',
    component: ApprovalRequestForm
  },
  {
    path: '/approval/detail/:id',
    name: 'ApprovalDetailView',
    component: ApprovalDetailView
  },
];

export default routes;

