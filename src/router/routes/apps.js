const routes = [
  {
    path: '/meeting',
    name: 'Meeting',
    component: () => import('@/views/meeting/Meeting.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval',
    name: 'ApprovalView',
    component: () => import('@/views/Approval/ApprovalView.vue'),
    meta: { requiresAuth: true }
  },
];

export default routes;