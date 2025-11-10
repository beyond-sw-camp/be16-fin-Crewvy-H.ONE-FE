<template>
  <div class="register-team-goal-container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1 class="title">{{ isEditMode ? '팀 목표 수정' : '팀 목표 추가' }}</h1>
        <p class="subtitle">팀의 목표를 설정하고 팀원들과 공유하세요</p>
      </div>
      <el-button @click="cancel" class="back-button" :icon="ArrowLeft">
        목록으로
      </el-button>
    </div>

    <div class="content-wrapper">
      <div class="main-content">
        <!-- Goal Form Card -->
        <div class="goal-form-container">
          <el-card class="goal-form-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon class="section-icon"><Document /></el-icon>
                <span class="section-title">목표 정보</span>
              </div>
            </template>
            <el-form :model="form" label-width="140px" class="goal-form" label-position="top">
              <el-form-item label="팀 목표명">
                <el-input v-model="form.title" placeholder="예: 2024년 하반기 매출 20% 증대" size="large"></el-input>
              </el-form-item>
              <el-form-item label="목표에 대한 설명">
                <el-input 
                  v-model="form.contents" 
                  type="textarea" 
                  :rows="8"
                  placeholder="예: 신규 고객 확보 및 기존 고객 대상 프로모션을 통해 매출 증대를 목표로 합니다."
                ></el-input>
              </el-form-item>
              <el-form-item label="목표 설정 기간">
                <el-date-picker 
                  v-model="form.dateRange" 
                  type="daterange" 
                  range-separator="~" 
                  start-placeholder="시작일"
                  end-placeholder="종료일" 
                  :disabled-date="disabledDate"
                  size="large"
                  style="width: 100%"
                >
                </el-date-picker>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- Team Selection Card -->
        <div class="team-selection-container">
          <el-card class="team-selection-box" shadow="never">
            <template #header>
              <div class="team-selection-header">
                <div class="header-left">
                  <el-icon class="section-icon"><UserFilled /></el-icon>
                  <h2 class="team-selection-title">팀원 지정</h2>
                </div>
                <el-button type="primary" size="small" class="add-member-btn" @click="openTeamMemberSelectionModal">
                  <el-icon><Plus /></el-icon>
                  <span>추가</span>
                </el-button>
              </div>
            </template>
            <div class="member-cards-scroll-area">
              <div class="selected-members-list">
                <div v-if="selectedTeamMembers.length === 0" class="empty-state">
                  <el-icon class="empty-icon"><User /></el-icon>
                  <p class="empty-text">선택된 팀원이 없습니다.</p>
                </div>
                <div v-else>
                  <el-card v-for="(member, index) in selectedTeamMembers" :key="member.id" class="member-card" shadow="hover">
                    <div class="member-card-header">
                      <div class="member-info">
                        <el-icon class="member-icon" :class="{ 'manager': member.isCreater }">
                          <Star v-if="member.isCreater" />
                          <User v-else />
                        </el-icon>
                        <span class="member-name">{{ member.name }}</span>
                      </div>
                      <el-button v-if="!member.isCreater" type="danger" size="small" @click="removeMember(index)" class="remove-btn">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <div class="member-details">
                      <p class="member-detail-item">
                        <span class="detail-label">소속:</span>
                        <span class="detail-value">{{ member.department }}</span>
                      </p>
                      <p class="member-detail-item">
                        <span class="detail-label">직책:</span>
                        <span class="detail-value">{{ member.position }}</span>
                      </p>
                      <el-tag :type="member.isCreater ? 'warning' : 'info'" size="small" class="member-role">
                        {{ member.isCreater ? '관리자' : '팀원' }}
                      </el-tag>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <el-button @click="cancel" class="cancel-button">취소</el-button>
        <el-button type="primary" @click="saveGoal" class="save-button">
          <el-icon><Select /></el-icon>
          <span>{{ isEditMode ? '수정' : '저장' }}</span>
        </el-button>
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
import { 
  User, 
  Star, 
  Document, 
  UserFilled, 
  Plus, 
  Delete, 
  Select,
  ArrowLeft
} from '@element-plus/icons-vue';

export default {
  name: 'RegisterTeamGoal',
  components: {
    TeamMemberSelectionModal,
    User,
    Star,
    Document,
    UserFilled,
    Plus,
    Delete,
    Select,
  },
  data() {
    return {
      ArrowLeft,
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
/* Container */
.register-team-goal-container {
  padding: 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Header Section */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

.back-button {
  border-radius: 8px;
  font-weight: 500;
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-content {
  display: flex;
  gap: 24px;
  flex-grow: 1;
}

/* Goal Form Container */
.goal-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goal-form-card {
  border-radius: 16px;
  border: none;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.goal-form-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 480px;
}

/* Card Headers */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-icon {
  font-size: 24px;
  color: #667eea;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
}

.goal-form {
  padding: 0;
  flex: 1;
}

/* Team Selection Container */
.team-selection-container {
  width: 360px;
  display: flex;
  flex-direction: column;
}

.team-selection-box {
  border-radius: 16px;
  border: none;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.team-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-selection-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.add-member-btn {
  border-radius: 4px;
  font-weight: 500;
  font-size: small;
  width: 60px;
  height: 25px;
}

/* Member Cards Scroll Area */
.member-cards-scroll-area {
  flex-grow: 1;
  max-height: 480px;
  overflow-y: auto;
  padding: 8px 0;
}

.selected-members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #909399;
  margin: 0;
  font-weight: 500;
}

/* Member Card */
.member-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.member-card:hover {
  transform: translateY(-2px);
}

.member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-icon {
  font-size: 24px;
  color: #909399;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 8px;
}

.member-icon.manager {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.member-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.remove-btn {
  border-radius: 4px;
}

.member-details {
  margin-left: 0;
}

.member-detail-item {
  font-size: 13px;
  color: #606266;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-label {
  font-weight: 600;
  color: #909399;
  min-width: 40px;
}

.detail-value {
  color: #606266;
}

.member-role {
  margin-top: 8px;
}

/* Actions */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.save-button {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 4px;
  width: 95px;
  height: 30px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .team-selection-container {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .register-team-goal-container {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
  }

  .actions .el-button {
    width: 100%;
  }
}
</style>
