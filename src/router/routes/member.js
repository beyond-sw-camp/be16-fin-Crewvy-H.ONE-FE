import Organization from '../../views/member/Organization.vue'
import EmployeeManagement from '../../views/member/EmployeeManagement.vue'

const routes = [
  {
    path: '/organization',
    name: 'Organization',
    component: Organization,
    meta: { requiresAuth: true }
  },
  {
    path: '/organization/add',
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
    path: '/employee/titles',
    name: 'TitleManagement',
    component: () => import('../../views/member/TitleManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/grades',
    name: 'GradeManagement',
    component: () => import('../../views/member/GradeManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/roles',
    name: 'RoleList',
    component: () => import('../../views/member/RoleList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/roles/create',
    name: 'CreateRole',
    component: () => import('../../views/member/CreateRole.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/roles/edit/:id',
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
];

export default routes;
