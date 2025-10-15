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
  {
    path: '/board',
    name: 'Board',
    component: () => import('@/views/dashboard/Board.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resource',
    name: 'Resource',
    component: () => import('@/views/reservation/Resource.vue'),
    meta: { requiresAuth: true }
  }
];

export default routes;