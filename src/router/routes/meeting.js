const Meeting = () => import('../../views/meeting/Meeting.vue')
const MeetingRoom = () => import('../../views/meeting/MeetingRoom.vue')
const MeetingMinutes = () => import('../../views/meeting/MeetingMinutes.vue')

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
  {
    path: '/meeting/minutes/:id',
    name: 'MeetingMinutes',
    component: MeetingMinutes,
    meta: { requiresAuth: true }
  },
];

export default routes;
