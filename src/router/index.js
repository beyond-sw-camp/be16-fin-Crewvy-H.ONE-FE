import { createRouter, createWebHistory } from 'vue-router'
import mainRoutes from './routes/main';
import authenticationRoutes from './routes/authentication';
import memberRoutes from './routes/member';
import attendanceRoutes from './routes/attendance';
import payrollRoutes from './routes/payroll';
import appsRoutes from './routes/apps';
import approvalRoutes from './routes/approval';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import PerformanceRoutes from './routes/performance';
import meetingRoutes from './routes/meeting';
import reservationRoutes from './routes/reservation';
import LandingPage from '@/views/LandingPage.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/landing',
    name: 'Landing',
    component: LandingPage,
    meta: { layout: 'BlankLayout', requiresAuth: false }
  },
  ...mainRoutes,
  ...authenticationRoutes,
  ...memberRoutes,
  ...attendanceRoutes,
  ...payrollRoutes,
  ...appsRoutes,
  ...approvalRoutes,
  ...PerformanceRoutes,
  ...meetingRoutes,
  ...reservationRoutes,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('userInfo');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    next('/landing');
  } else {
    next();
  }
});

export default router;