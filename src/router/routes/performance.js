import MyGoal from "@/views/performance/MyGoal.vue";
import MyGoalDetail from "@/views/performance/MyGoalDetail.vue";
import RegisterMyGoal from "@/views/performance/RegisterMyGoal.vue";
import TeamGoal from "@/views/performance/TeamGoal.vue";
import RegisterTeamGoal from "@/views/performance/RegisterTeamGoal.vue";
import TeamGoalDetail from "@/views/performance/TeamGoalDetail.vue";
import TeamMemberGoalDetail from "@/views/performance/TeamMemberGoalDetail.vue";

const routes = [
  {
    path: '/performance/team-goal',
    name: 'TeamGoal',
    component: TeamGoal,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/team-goal/create',
    name: 'RegisterTeamGoal',
    component: RegisterTeamGoal,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/my-goal',
    name: 'MyGoal',
    component: MyGoal,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/team-goal/:id',
    name: 'TeamGoalDetail',
    component: TeamGoalDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/team-goal/edit/:id',
    name: 'EditTeamGoal',
    component: RegisterTeamGoal,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/team-goal/:goalId/member-goal/:memberGoalId',
    name: 'TeamMemberGoalDetail',
    component: TeamMemberGoalDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/register-my-goal/:teamGoalId',
    name: 'RegisterMyGoal',
    component: RegisterMyGoal,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/my-goal/:goalId',
    name: 'MyGoalDetail',
    component: MyGoalDetail,
    meta: { requiresAuth: true }
  },
];

export default routes;
