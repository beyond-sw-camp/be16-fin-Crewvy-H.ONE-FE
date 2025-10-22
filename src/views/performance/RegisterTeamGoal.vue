<template>
  <div class="register-team-goal-container">
    <div class="header">
      <h1 class="title">{{ isEditMode ? '팀 목표 수정' : '팀 목표 추가' }}</h1>
    </div>
    <div class="content-wrapper">
      <div class="main-content">
        <div class="goal-form-container">
          <el-form :model="form" label-width="120px" class="goal-form">
            <el-form-item label="팀 목표명">
              <el-input v-model="form.title" placeholder="예: 2024년 하반기 매출 20% 증대"></el-input>
            </el-form-item>
                      <el-form-item label="목표에 대한 설명" style="margin-bottom: 20px;">
                                    <el-input v-model="form.contents" type="textarea" :rows="10"
                                      placeholder="예: 신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다."></el-input>                      </el-form-item>
                      <el-form-item label="목표 설정 기간" style="margin-bottom: 20px;">              <el-date-picker v-model="form.dateRange" type="daterange" range-separator="-" start-placeholder="Start date"
                end-placeholder="End date" :disabled-date="disabledDate">
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
        <div class="team-selection-container">
          <div class="team-selection-box">
            <div class="team-selection-header">
              <h2 class="team-selection-title">팀원 지정</h2>
              <el-button type="primary" class="add-member-btn" @click="openTeamMemberSelectionModal">팀원 추가</el-button>
            </div>
            <div class="member-cards-scroll-area">
              <div class="selected-members-list">
                <div v-if="selectedTeamMembers.length === 0" class="empty-state">
                  <p>선택된 팀원이 없습니다.</p>
                </div>
                <div v-else>
                  <el-card v-for="(member, index) in selectedTeamMembers" :key="member.id" class="member-card">
                    <div class="member-card-header">
                      <div class="member-info">
                        <el-icon v-if="member.isCreater"><Star /></el-icon>
                        <el-icon v-else><User /></el-icon>
                        <span class="member-name">{{ member.name }}</span>
                      </div>
                      <el-button v-if="!member.isCreater" type="danger" size="small" plain @click="removeMember(index)">삭제</el-button>
                    </div>
                    <div class="member-details">
                      <p class="member-org">{{ member.department }} / {{ member.position }}</p>
                      <p class="member-role">{{ member.isCreater ? '관리자' : '팀원' }}</p>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <el-button @click="cancel">취소</el-button>
        <el-button type="primary" @click="saveGoal">{{ isEditMode ? '수정' : '저장' }}</el-button>
      </div>
    </div>

    <TeamMemberSelectionModal
      :visible="isTeamMemberSelectionModalVisible"
      @update:visible="isTeamMemberSelectionModalVisible = $event"
      @save="handleTeamMembersSelected"
      :initialSelectedMembers="selectedTeamMembers"
    />
  </div>
</template>

<script>
import apiClient from '@/api/http';
import TeamMemberSelectionModal from '@/components/performance/TeamMemberSelectionModal.vue';
import { User, Star } from '@element-plus/icons-vue';

export default {
  name: 'RegisterTeamGoal',
  components: {
    TeamMemberSelectionModal,
    User,
    Star,
  },
  data() {
    return {
      form: {
        title: '',
        contents: '',
        dateRange: ''
      },
      isTeamMemberSelectionModalVisible: false,
      selectedTeamMembers: [],
      isEditMode: false,
      teamGoalId: null,
    };
  },
  created() {
    if (this.$route.params.id) {
      this.isEditMode = true;
      this.teamGoalId = this.$route.params.id;
      this.fetchTeamGoalForEdit();
    } else {
      this.fetchMyInfo();
    }
  },
  methods: {
    async fetchTeamGoalForEdit() {
      try {
        const response = await apiClient.get(`/workforce-service/performance/team-goal/${this.teamGoalId}`);
        const data = response.data.data;

        this.form.title = data.title;
        this.form.contents = data.contents;
        this.form.dateRange = [new Date(data.startDate), new Date(data.endDate)];

        if (data.memberList) {
          this.selectedTeamMembers = data.memberList.map(member => ({
            id: member.memberPositionId, // Assuming memberPositionId is the unique ID
            name: member.memberName,
            department: member.memberOrganizationName,
            position: member.memberTitleName,
            memberPositionId: member.memberPositionId,
            isCreater: member.isCreater === 'TRUE',
          }));

          // Sort memberList to place creators (managers) first
          this.selectedTeamMembers.sort((a, b) => {
            if (a.isCreater === true && b.isCreater !== true) return -1;
            if (a.isCreater !== true && b.isCreater === true) return 1;
            return 0;
          });
        }
      } catch (error) {
        console.error('Error fetching team goal for edit:', error);
        this.$message.error('팀 목표 정보를 불러오는 데 실패했습니다.');
      }
    },
    async fetchMyInfo() {
      try {
        const memberPositionId = localStorage.getItem('memberPositionId');
        if (!memberPositionId) return;

        const response = await apiClient.post('/member-service/member/position-list', {
          uuidList: [memberPositionId]
        });

        if (response.data.data && response.data.data.length > 0) {
          const myInfo = response.data.data[0];
          this.selectedTeamMembers.push({
            id: myInfo.memberId,
            name: myInfo.memberName,
            department: myInfo.organizationName,
            position: myInfo.titleName,
            memberPositionId: myInfo.memberPositionId,
            isCreater: true,
          });
        }
      } catch (error) {
        console.error('Error fetching my info:', error);
      }
    },
    openTeamMemberSelectionModal() {
      this.isTeamMemberSelectionModalVisible = true;
    },
    handleTeamMembersSelected(members) {
      this.selectedTeamMembers = members;
      console.log('Selected Team Members:', this.selectedTeamMembers);
    },
    removeMember(index) {
      this.selectedTeamMembers.splice(index, 1);
    },
    async saveGoal() {
      if (!this.form.title || !this.form.contents || !this.form.dateRange) {
        this.$message.warning('모든 필드를 입력해주세요.');
        return;
      }

      if (this.isEditMode) {
        await this.updateTeamGoal();
      } else {
        await this.createTeamGoal();
      }
    },

    async createTeamGoal() {
      const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2)
          month = '0' + month;
        if (day.length < 2)
          day = '0' + day;

        return [year, month, day].join('-');
      }

      const teamMembersPayload = this.selectedTeamMembers.map(member => ({
        memberPositionId: member.memberPositionId,
        isCreater: member.isCreater ? 'TRUE' : 'FALSE',
      }));

      const payload = {
        title: this.form.title,
        contents: this.form.contents,
        startDate: formatDate(this.form.dateRange[0]),
        endDate: formatDate(this.form.dateRange[1]),
        members: teamMembersPayload,
      };

      try {
        await apiClient.post('/workforce-service/performance/create-team-goal', payload);
        this.$message.success('팀 목표가 성공적으로 추가되었습니다.');
        this.$router.push('/performance/team-goal');
      } catch (error) {
        console.error('Error creating team goal:', error);
        this.$message.error('목표 추가에 실패했습니다.');
      }
    },

    async updateTeamGoal() {
      const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2)
          month = '0' + month;
        if (day.length < 2)
          day = '0' + day;

        return [year, month, day].join('-');
      }

      const teamMembersPayload = this.selectedTeamMembers.map(member => ({
        memberPositionId: member.memberPositionId,
        isCreater: member.isCreater ? 'TRUE' : 'FALSE',
      }));

      const payload = {
        title: this.form.title,
        contents: this.form.contents,
        startDate: formatDate(this.form.dateRange[0]),
        endDate: formatDate(this.form.dateRange[1]),
        members: teamMembersPayload,
      };

      try {
        await apiClient.patch(`/workforce-service/performance/update-team-goal/${this.teamGoalId}`, payload);
        this.$message.success('팀 목표가 성공적으로 수정되었습니다.');
        this.$router.push('/performance/team-goal');
      } catch (error) {
        console.error('Error updating team goal:', error);
        this.$message.error('목표 수정에 실패했습니다.');
      }
    },
    cancel() {
      this.$router.go(-1);
    },
    disabledDate(time) {
      return time.getTime() < Date.now() - 8.64e7; // Disable dates before today
    }
  }
};
</script>

<style scoped>
.register-team-goal-container {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
}

.main-content {
  display: flex;
  gap: 24px;
  /* margin-bottom: 24px; */ /* Removed this line */
  flex-grow: 1;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.goal-form-container {
  flex: 1;
}

.goal-form {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 450px;
}

.team-selection-container {
  width: 300px;
}

.team-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.team-selection-title {
  font-size: 18px;
  font-weight: 600;
}

.team-selection-box {
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: auto; /* Removed fixed height */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.member-cards-scroll-area {
  flex-grow: 1;
  max-height: 380px; /* Adjusted max-height to fit within the box, considering header and padding */
  overflow-y: auto;
  padding-right: 5px; /* To prevent scrollbar from overlapping content */
}

.selected-members-list {
  /* margin-top: 16px; */ /* Removed this line */
  /* border: 1px solid #ebeef5; */ /* Removed this line */
  border-radius: 4px;
  min-height: 100px;
  /* padding: 8px; */ /* Removed this line */
  display: flex;
  flex-direction: column;
  gap: 8px; /* Increased gap between cards */
}

.selected-members-list .empty-state {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.member-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 2px;
}

.member-name {
  font-weight: 600;
  font-size: 13px;
}

.member-details {
  font-size: 11px;
  color: #606266;
  margin-left: 18px; /* Adjust to align with member name */
}

.member-role {
  font-weight: 500;
  font-size: 11px;
  color: #409eff; /* Example color for role */
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px; /* Add some space above the buttons */
}

</style>
