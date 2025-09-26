const routes = [
  {
    path: '/meeting',
    name: 'Meeting',
    component: () => import('@/views/meeting/Meeting.vue')
  },
  {
    path: '/approval',
    name: 'Approval',
    component: () => import('@/views/Approval/Approval.vue')
  },
  {
    path: '/board',
    name: 'Board',
    component: () => import('@/views/dashboard/Board.vue')
  },
  {
    path: '/resource',
    name: 'Resource',
    component: () => import('@/views/reservation/Resource.vue')
  }
];

export default routes;