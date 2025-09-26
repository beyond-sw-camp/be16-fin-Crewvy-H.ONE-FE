import ResourceReservation from '../../views/reservation/ResourceReservation.vue'
import ResourceManagement from '../../views/reservation/ResourceManagement.vue'

const routes = [
  {
    path: '/resource/reservation',
    name: 'ResourceReservation',
    component: ResourceReservation
  },
  {
    path: '/resource/management',
    name: 'ResourceManagement',
    component: ResourceManagement
  },
];

export default routes;
