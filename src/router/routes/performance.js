import MyGoal from "@/views/performance/MyGoal.vue";
import MyGoalDetail from "@/views/performance/MyGoalDetail.vue";
import RegisterMyGoal from "@/views/performance/RegisterMyGoal.vue";
import TeamGoal from "@/views/performance/TeamGoal.vue";
import TeamGoalDetail from "@/views/performance/TeamGoalDetail.vue";
import TeamMemberGoalDetail from "@/views/performance/TeamMemberGoalDetail.vue";

const routes = [
  {
    path: '/performance/team-goal',
    name: 'TeamGoal',
    component: TeamGoal
  },
  {
    path: '/performance/my-goal',
    name: 'MyGoal',
    component: MyGoal
  },
  {
    path: '/performance/team-goal/:id',
    name: 'TeamGoalDetail',
    component: TeamGoalDetail
  },
  {
    path: '/performance/team-goal/:goalId/member-goal/:memberGoalId',
    name: 'TeamMemberGoalDetail',
    component: TeamMemberGoalDetail
  },
  {
    path: '/performance/register-my-goal/:teamGoalId',
    name: 'RegisterMyGoal',
    component: RegisterMyGoal
  },
  {
    path: '/performance/my-goal/:goalId',
    name: 'MyGoalDetail',
    component: MyGoalDetail
  },
];

export default routes;
