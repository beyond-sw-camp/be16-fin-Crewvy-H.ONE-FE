import ResourceReservation from '../../views/reservation/ResourceReservation.vue'
import ResourceManagement from '../../views/reservation/ResourceManagement.vue'

const routes = [
  {
    path: '/resource/reservation',
    name: 'ResourceReservation',
    component: ResourceReservation,
    meta: { requiresAuth: true }
  },
  {
    path: '/resource/management',
    name: 'ResourceManagement',
    component: ResourceManagement,
    meta: { requiresAuth: true }
  },
];

export default routes;
