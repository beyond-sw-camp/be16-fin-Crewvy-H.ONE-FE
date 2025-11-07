import EmployeeManagement from '@/views/member/EmployeeManagement.vue';
import OrganizationView from '../../views/member/OrganizationView.vue'
import EmployeeDetailView from '@/views/member/EmployeeDetailView.vue';

const routes = [
  {
    path: '/organization',
    name: 'OrganizationView',
    component: OrganizationView,
  },
  {
    path: '/OrganizationView/add',
    name: 'AddOrganization',
    component: () => import('../../views/member/AddOrganization.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee',
    name: 'EmployeeManagement',
    component: EmployeeManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/add',
    name: 'AddEmployee',
    component: () => import('../../views/member/AddEmployee.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/edit/:id',
    name: 'EmployeeEdit',
    component: () => import('../../views/member/EmployeeEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/detail/:id',
    name: 'EmployeeDetailView',
    component: EmployeeDetailView,
    props: (route) => ({ memberId: route.params.id }), // Modified line
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/title',
    name: 'TitleManagement',
    component: () => import('../../views/member/TitleManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/grade',
    name: 'GradeManagement',
    component: () => import('../../views/member/GradeManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/role',
    name: 'RoleList',
    component: () => import('../../views/member/RoleList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/role/create',
    name: 'CreateRole',
    component: () => import('../../views/member/CreateRole.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/role/edit/:id',
    name: 'RoleEdit',
    component: () => import('../../views/member/RoleEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-info',
    name: 'MyInfo',
    component: () => import('../../views/member/MyInfo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-info/edit',
    name: 'MyInfoEdit',
    component: () => import('../../views/member/MyInfoEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-info/notification-settings',
    name: 'NotificationSettings',
    component: () => import('@/views/member/NotificationSettings.vue'),
    meta: { requiresAuth: true }
  },
];

export default routes;
