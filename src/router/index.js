import { createRouter, createWebHistory } from 'vue-router'
import mainRoutes from './routes/main';
import authenticationRoutes from './routes/authentication';
import memberRoutes from './routes/member';
import attendanceRoutes from './routes/attendance';
import payrollRoutes from './routes/payroll';
import appsRoutes from './routes/apps';
import approvalRoutes from './routes/approval';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import LandingPage3 from '@/views/LandingPage3.vue';
import PerformanceRoutes from './routes/performance';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/landing',
    name: 'Landing',
    component: LandingPage3
  },
  ...mainRoutes,
  ...authenticationRoutes,
  ...memberRoutes,
  ...attendanceRoutes,
  ...payrollRoutes,
  ...appsRoutes,
  ...approvalRoutes,
  ...PerformanceRoutes,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;