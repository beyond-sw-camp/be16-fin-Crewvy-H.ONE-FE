import Dashboard from '../../views/dashboard/Dashboard.vue'
import GlobalSearch from '../../views/search/GlobalSearch.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/search',
    name: 'GlobalSearch',
    component: GlobalSearch
  },
  {
    path: '/landing',
    name: 'LandingPage',
    component: () => import('../../views/LandingPage.vue'),
    meta: { layout: 'BlankLayout' }
  },
  {
    path: '/landing2',
    name: 'LandingPage2',
    component: () => import('../../views/LandingPage2.vue'),
    meta: { layout: 'BlankLayout' }
  },
  {
    path: '/landing3',
    name: 'LandingPage3',
    component: () => import('../../views/LandingPage3.vue'),
    meta: { layout: 'BlankLayout' }
  },
];

export default routes;
