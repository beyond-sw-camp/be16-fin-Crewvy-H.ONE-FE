import Dashboard from '../../views/dashboard/Dashboard.vue'
import GlobalSearch from '../../views/search/GlobalSearch.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'GlobalSearch',
    component: GlobalSearch,
    meta: { requiresAuth: true }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/Schedule.vue'),
    meta: { requiresAuth: true }
  },
];

export default routes;
