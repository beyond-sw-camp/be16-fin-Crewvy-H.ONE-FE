import Organization from '../../views/member/Organization.vue'
import Employee from '../../views/member/Employee.vue'

const routes = [
  {
    path: '/organization',
    name: 'Organization',
    component: Organization
  },
  {
    path: '/organization/add',
    name: 'AddOrganization',
    component: () => import('../../views/member/AddOrganization.vue')
  },
  {
    path: '/employee',
    name: 'Employee',
    component: Employee
  },
  {
    path: '/employee/add',
    name: 'AddEmployee',
    component: () => import('../../views/member/AddEmployee.vue')
  },
  {
    path: '/employee/edit/:id',
    name: 'EmployeeEdit',
    component: () => import('../../views/member/EmployeeEdit.vue')
  },
  {
    path: '/employee/titles',
    name: 'TitleManagement',
    component: () => import('../../views/member/TitleManagement.vue')
  },
  {
    path: '/employee/grades',
    name: 'GradeManagement',
    component: () => import('../../views/member/GradeManagement.vue')
  },
  {
    path: '/employee/roles',
    name: 'RoleList',
    component: () => import('../../views/member/RoleList.vue')
  },
  {
    path: '/employee/roles/create',
    name: 'CreateRole',
    component: () => import('../../views/member/CreateRole.vue')
  },
  {
    path: '/employee/roles/edit/:id',
    name: 'RoleEdit',
    component: () => import('../../views/member/RoleEdit.vue')
  },
  {
    path: '/my-info',
    name: 'MyInfo',
    component: () => import('../../views/member/MyInfo.vue')
  },
  {
    path: '/my-info/edit',
    name: 'MyInfoEdit',
    component: () => import('../../views/member/MyInfoEdit.vue')
  },
];

export default routes;
