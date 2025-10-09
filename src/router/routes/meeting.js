import Meeting from '../../views/meeting/Meeting.vue'

const routes = [
  {
    path: '/meeting',
    name: 'Meeting',
    component: Meeting,
    meta: { requiresAuth: true }
  },
];

export default routes;
