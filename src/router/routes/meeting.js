import Meeting from '../../views/meeting/Meeting.vue'
import MeetingRoom from '../../views/meeting/MeetingRoom.vue'

const routes = [
  {
    path: '/meeting',
    name: 'Meeting',
    component: Meeting,
    meta: { requiresAuth: true }
  },
  {
    path: '/meeting/room',
    name: 'MeetingRoom',
    component: MeetingRoom,
    meta: { layout: 'BlankLayout' }
  },
];

export default routes;
