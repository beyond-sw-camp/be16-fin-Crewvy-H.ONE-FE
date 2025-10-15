const routes = [
  {
    path: '/unlock-account',
    name: 'AccountUnlock',
    component: () => import('../../views/member/AccountUnlock.vue'),
    meta: { layout: 'BlankLayout', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../../views/member/LoginPage.vue'),
    meta: { layout: 'BlankLayout', requiresAuth: false }
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import('../../views/member/TermsOfService.vue'),
    meta: { layout: 'BlankLayout', requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'SignUpPage',
    component: () => import('../../views/member/SignUp.vue'),
    meta: { layout: 'BlankLayout', requiresAuth: false }
  },
];

export default routes;