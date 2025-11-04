<template>
  <div class="employee-edit-page">
    <div class="page-header">
      <h1>직원 정보 수정</h1>
    </div>

    <el-form ref="form" :model="form" label-width="120px" label-position="top" @submit.prevent>
      <!-- 계정 설정 -->
      <el-card class="form-section">
        <template #header><span>계정 설정</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="계정 상태">
              <el-select v-model="form.accountStatus" placeholder="계정 상태 선택">
                <el-option label="정상" value="ACTIVE"></el-option>
                <el-option label="비활성" value="INACTIVE"></el-option>
                <el-option label="잠금" value="LOCK"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비밀번호 초기화">
              <el-button type="danger" plain @click="resetPassword">비밀번호 초기화</el-button>
              <p class="reset-info">사용자의 이메일로 임시 비밀번호가 발송됩니다.</p>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 기본 정보 -->
      <el-card class="form-section">
        <template #header><span>기본 정보</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="이름">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="직급">
              <el-input v-model="form.gradeName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="재직 상태">
              <el-select v-model="form.memberStatus" placeholder="재직 상태 선택">
                <el-option label="재직" value="WORKING"></el-option>
                <el-option label="휴직" value="LEAVE"></el-option>
                <el-option label="파견" value="DETACHMENT"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="고용형태">
              <el-select v-model="form.employmentType" placeholder="고용형태 선택">
                <el-option label="정규직" value="FULL"></el-option>
                <el-option label="계약직" value="CONTRACT"></el-option>
                <el-option label="인턴" value="INTERN"></el-option>
                <el-option label="기타" value="ETC"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="사번">
              <el-input v-model="form.sabun" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="이메일">
              <el-input v-model="form.email" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="연락처">
              <el-input v-model="form.phoneNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="비상연락처">
              <el-input v-model="form.emergencyContact" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="내선 전화">
              <el-input v-model="form.extensionNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="일반 전화">
              <el-input v-model="form.telNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="은행명">
              <el-input v-model="form.bank" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="계좌번호">
              <el-input v-model="form.bankAccount" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="입사일">
              <el-date-picker v-model="form.joinDate" type="date" placeholder="입사일 선택" style="width: 100%;"
                value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="근속기간">
              <el-input v-model="form.lengthOfService" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="주소">
              <el-input v-model="form.address" placeholder="주소 검색 버튼을 눌러 주소를 입력하세요" readonly @click="openAddressSearch">
                <template #append>
                  <el-button @click="openAddressSearch">주소 검색</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="상세주소">
              <el-input v-model="form.detailAddress" placeholder="상세주소를 입력하세요"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 인사 정보 카드 (신규 추가) -->
      <el-card class="form-section">
        <template #header>
          <div class="section-title-container">
            <span>인사 정보</span>
            <div>
              <el-button @click="addGradeHistory" type="primary" plain size="small"><el-icon>
                  <Plus />
                </el-icon> 직급 추가</el-button>
              <el-button @click="showAllGradeHistory = !showAllGradeHistory" type="info" plain size="small">
                {{ showAllGradeHistory ? '활성화된 직급만 보기' : '모든 직급 보기' }}
              </el-button>
            </div>
          </div>
        </template>
        <div class="grade-history-list">
          <div v-for="(grade, index) in filteredGradeHistorySet" :key="grade.gradeHistoryId || index"
            class="grade-history-item">
            <el-row :gutter="24">
              <el-col :span="filteredGradeHistorySet.length > 1 ? 11 : 12">
                <el-form-item :label="`직급명 ${index + 1}`">
                  <el-select v-model="grade.gradeId" placeholder="직급 선택" style="width: 100%;">
                    <el-option v-for="g in allGrades" :key="g.id" :label="g.name" :value="g.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="filteredGradeHistorySet.length > 1 ? 11 : 12">
                <el-form-item :label="`진급일 ${index + 1}`">
                  <el-date-picker v-model="grade.promotionDate" type="date" placeholder="진급일 선택" style="width: 100%;"
                    value-format="YYYY-MM-DD"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="2" class="delete-grade-history-col" v-if="!grade.ynDel && activeGradeHistoryCount > 1">
                <el-form-item label="&nbsp;">
                  <el-button type="danger" circle @click="removeGradeHistory(index)"
                    v-if="!grade.ynDel && activeGradeHistoryCount > 1">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-tag v-if="grade.isActive === false && grade.ynDel === false" type="warning" size="small">비활성화</el-tag>
            <el-tag v-if="grade.ynDel === true" type="danger" size="small">삭제 예정</el-tag>
            <el-button v-if="grade.ynDel === true" @click="permanentDeleteGradeHistory(grade.gradeHistoryId)"
              type="danger" size="small" plain class="permanent-delete-btn">영구 삭제</el-button>
          </div>
          <p v-if="filteredGradeHistorySet.length === 0">진급 이력이 없습니다.</p>
        </div>
      </el-card>

      <!-- 직무 정보 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-title-container">
            <span>직무 정보</span>
            <div>
              <el-button @click="addPosition" type="primary" plain size="small"><el-icon>
                  <Plus />
                </el-icon> 직무 추가</el-button>
              <el-button @click="showAllPositions = !showAllPositions" type="info" plain size="small">
                {{ showAllPositions ? '활성화된 직무만 보기' : '모든 직무 보기' }}
              </el-button>
            </div>
          </div>
        </template>
        <div class="positions-list">
          <div v-for="(position, index) in filteredPositions" :key="position.memberPositionId || position.tempId || index"
            class="position-item">
            <div class="position-item-header">
              <h4>직무 {{ index + 1 }}</h4>
              <div class="position-item-actions">
                <el-button @click="softDeletePosition(position)" type="warning" plain size="small"
                  v-if="!position.ynDel">직무
                  종료</el-button>
                <el-button @click="permanentDeletePosition(position.memberPositionId, index)" type="danger" size="small"
                  v-if="position.ynDel">영구 삭제</el-button>
              </div>
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="부서">
                  <el-input :value="position.organizationName || '부서 선택'" readonly>
                    <template #append>
                      <el-button @click="openOrgModal(position.memberPositionId || position.tempId)">조직도</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="직책">
                  <el-select v-model="position.titleId" placeholder="직책 선택" style="width: 100%;">
                    <el-option v-for="title in allTitles" :key="title.id" :label="title.name"
                      :value="title.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="역할">
                  <el-select v-model="position.roleId" placeholder="역할 선택" style="width: 100%;">
                    <el-option v-for="role in allRoles" :key="role.id" :label="role.name" :value="role.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="시작일">
                  <el-date-picker v-model="position.startDate" type="date" placeholder="시작일 선택" style="width: 100%;"
                    value-format="YYYY-MM-DD"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="종료일">
                  <el-date-picker v-model="position.endDate" type="date" placeholder="종료일 선택" style="width: 100%;"
                    value-format="YYYY-MM-DD"></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-tag v-if="position.isActive === false && position.ynDel === false" type="warning"
              size="small">비활성화</el-tag>
          </div>
        </div>
      </el-card>

      <div class="form-actions">
        <el-button @click="onCancel">취소</el-button>
        <el-button type="primary" @click="onSubmit">저장</el-button>
      </div>
    </el-form>

    <OrganizationTreeModal :visible="isOrgModalVisible" @update:visible="isOrgModalVisible = $event"
      @select="handleOrgSelect" />
    <AddressModal v-if="isAddressModalVisible" @close="closeAddressModal" @address-selected="handleAddressSelected" />
  </div>
</template>

<script>
import employeeService from '../../api/employeeService';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import OrganizationTreeModal from '@/components/common/OrganizationTreeModal.vue';
import AddressModal from '@/components/member/AddressModal.vue';

export default {
  name: 'EmployeeEdit',
  components: {
    Plus,
    Delete,
    OrganizationTreeModal,
    AddressModal,
  },
  data() {
    return {
      form: {
        id: null,
        name: '',
        email: '',
        phoneNumber: '',
        emergencyContact: '',
        extensionNumber: '',
        telNumber: '',
        address: '',
        detailAddress: '',
        bank: '',
        bankAccount: '',
        joinDate: '',
        lengthOfService: '',
        gradeName: '',
        employmentType: '',
        memberStatus: '',
        sabun: '',
        accountStatus: '',
        gradeHistorySet: [],
        positions: [],
      },
      showAllGradeHistory: false, // 상태 변수 추가
      showAllPositions: false,   // 상태 변수 추가
      isOrgModalVisible: false,
      editingPositionIdentifier: null,
      newPositionCounter: 0,
      showPostcodeModal: false,
      isAddressModalVisible: false,
      accountStatusMapping: {
        '정상': 'AS001',
        '비활성': 'AS002',
        '잠금': 'AS003',
        'ACTIVE': 'AS001',
        'INACTIVE': 'AS002',
        'LOCK': 'AS003',
      },
      employmentTypeMapping: {
        '정규직': 'ET001',
        '계약직': 'ET002',
        '인턴': 'ET003',
        '기타': 'ET004',
        'FULL': 'ET001',
        'CONTRACT': 'ET002',
        'INTERN': 'ET003',
        'ETC': 'ET004',
      },
      memberStatusMapping: {
        '재직': 'MS001',
        '휴직': 'MS002',
        '파견': 'MS003',
        'WORKING': 'MS001',
        'LEAVE': 'MS002',
        'DETACHMENT': 'MS003',
      },
      allOrganizations: [],
      allTitles: [],
      allRoles: [],
      memberPositionId: 'YOUR_MEMBER_POSITION_ID_HERE', // TODO: 실제 로그인한 사용자의 memberPositionId로 교체해야 합니다.
      // allGrades는 인사 정보 카드에서 사용되므로 여기서는 필요 없음
    };
  },
  watch: {
    'form.gradeHistorySet': {
      handler(newVal) { // oldVal 제거
        console.log('--- form.gradeHistorySet changed ---');
        console.log(JSON.stringify(newVal, null, 2));
      },
      deep: true
    }
  },
  computed: {
    filteredGradeHistorySet() {
      let gradeHistoryToFilter = [...this.form.gradeHistorySet];

      if (!this.showAllGradeHistory) {
        // By default, show only active (not soft-deleted) grade histories
        return gradeHistoryToFilter.filter(gh => gh.ynDel === false && gh.isActive === true);
      }
      return gradeHistoryToFilter; // When showAllGradeHistory is true, return all (including soft-deleted)
    },
    activeGradeHistoryCount() {
      return this.form.gradeHistorySet.filter(gh => gh.ynDel === false && gh.isActive === true).length;
    },
        filteredPositions() {
          let positionsToFilter = [...this.form.positions];

          // Sort only when showing all positions or when filtering by active positions
          positionsToFilter.sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate) : 0;
            const dateB = b.startDate ? new Date(b.startDate) : 0;
            return dateB - dateA; // Sort in descending order
          });

          if (!this.showAllPositions) {
            // By default, show only active (not soft-deleted) positions
            return positionsToFilter.filter(p => p.ynDel === false);
          }
          return positionsToFilter; // When showAllPositions is true, return all (including soft-deleted)
        }  },
  methods: {
    async fetchEmployeeData(id) {
      try {
        const response = await employeeService.getEmployeeForEdit(id);
        const editData = response.data.data;

        // --- START CONSOLE LOGS FOR DEBUGGING ---
        console.log('--- Debugging fetchEmployeeData ---');
        console.log('Raw editData from API:', JSON.parse(JSON.stringify(editData))); // Deep copy to avoid mutation issues
        console.log('editData.organizationResList (allOrganizations source):', editData.organizationResList);
        console.log('editData.memberDetail.memberPositionResList (positions source):', editData.memberDetail.memberPositionResList);
        // --- END CONSOLE LOGS FOR DEBUGGING ---

        const employmentTypeNameToValue = {
          '정규직': 'FULL',
          '계약직': 'CONTRACT',
          '인턴': 'INTERN',
          '기타': 'ETC',
        };

        const memberStatusNameToValue = {
          '재직': 'WORKING',
          '휴직': 'LEAVE',
          '파견': 'DETACHMENT',
        };

        // Map API response to form data
        this.form = {
          id: id,
          name: editData.memberDetail.name,
          email: editData.memberDetail.email,
          phoneNumber: editData.memberDetail.phoneNumber,
          emergencyContact: editData.memberDetail.emergencyContact,
          extensionNumber: editData.memberDetail.extensionNumber,
          telNumber: editData.memberDetail.telNumber,
          address: editData.memberDetail.address,
          detailAddress: editData.memberDetail.detailAddress,
          bank: editData.memberDetail.bank,
          bankAccount: editData.memberDetail.bankAccount,
          joinDate: editData.memberDetail.joinDate,
          lengthOfService: editData.memberDetail.lengthOfService,
          gradeName: editData.memberDetail.gradeName,
          employmentType: employmentTypeNameToValue[editData.memberDetail.employmentTypeName],
          memberStatus: memberStatusNameToValue[editData.memberDetail.memberStatusName],
          sabun: editData.memberDetail.sabun,
          accountStatus: editData.memberDetail.accountStatus,
          gradeHistorySet: editData.memberDetail.gradeHistoryList?.map(gh => ({
            gradeHistoryId: gh.gradeHistoryId, // gh.gradeHistoryId를 그대로 사용
            gradeId: gh.gradeId,
            gradeName: gh.name,
            promotionDate: gh.promotionDate || null,
            isActive: typeof gh.isActive === 'string' ? gh.isActive.toUpperCase() === 'TRUE' : (gh.isActive ?? true),
            ynDel: typeof gh.ynDel === 'string' ? gh.ynDel.toUpperCase() === 'TRUE' : (gh.ynDel ?? false) // ynDel 초기화
          })) || [],
          positions: editData.memberDetail.memberPositionResList?.map(p => {
            // --- START CONSOLE LOGS FOR DEBUGGING EACH POSITION ---
            console.log('  --- Processing position (p) ---');
            console.log('  p.id:', p.id);
            console.log('  p.organization:', p.organization);
            console.log('  p.organization.id:', p.organization ? p.organization.id : 'N/A');
            console.log('  p.organization.label:', p.organization ? p.organization.label : 'N/A');
            // --- END CONSOLE LOGS FOR DEBUGGING EACH POSITION ---

            return {
              memberPositionId: p.id, // 기존 memberPositionId 추가
              organizationId: p.organization ? p.organization.id : null,
              organizationName: p.organization ? p.organization.name : '', // Use name from p.organization
              titleId: p.title ? p.title.id : null,
              roleId: p.role ? p.role.id : null,
              startDate: p.startDate, // startDate 추가
              endDate: p.endDate, // endDate 추가
              isActive: typeof p.isActive === 'string' ? p.isActive.toUpperCase() === 'TRUE' : (p.isActive ?? true),
              ynDel: typeof p.ynDel === 'string' ? p.ynDel.toUpperCase() === 'TRUE' : (p.ynDel ?? false)
            };
          }) || [],
        };

        this.allOrganizations = editData.organizationResList;
        this.allTitles = editData.titleResList;
        this.allRoles = editData.roleResList;
        this.allGrades = editData.gradeResList;

        if (this.form.positions.length === 0) {
          this.addPosition();
        }

      } catch (error) {
        console.error("직원 정보를 불러오는데 실패했습니다:", error);
        ElMessage.error(error.response?.data?.message || '직원 정보를 찾을 수 없습니다.');
        this.$router.push('/employee');
      }
    },
    async onSubmit() {
      try {
        const updatePayload = {
          name: this.form.name,
          address: this.form.address,
          detailAddress: this.form.detailAddress,
          accountStatusCodeValue: this.accountStatusMapping[this.form.accountStatus] || this.form.accountStatus,
          employmentTypeCodeValue: this.employmentTypeMapping[this.form.employmentType] || this.form.employmentType,
          memberStatusCodeValue: this.memberStatusMapping[this.form.memberStatus] || this.form.memberStatus,
          sabun: this.form.sabun,
          extensionNumber: this.form.extensionNumber,
          telNumber: this.form.telNumber,
          joinDate: this.form.joinDate, // Ensure this is in a format backend expects (e.g., YYYY-MM-DD)
          // newPw is not handled here, assuming separate resetPassword API or user input
          gradeHistoryReqList: this.form.gradeHistorySet
            .filter(gh => !(gh.gradeHistoryId === null && gh.ynDel === true)) // Filter out new items that were soft-deleted
            .map(gh => ({
              gradeHistoryId: gh.gradeHistoryId, // null이 아닌 경우 그대로 사용
              gradeId: gh.gradeId,
              promotionDate: gh.promotionDate,
              isActive: gh.isActive,
              ynDel: gh.ynDel, // ynDel 추가
            })),
          positionUpdateReqList: this.form.positions.map(p => ({
            memberPositionId: p.memberPositionId || null, // Send null for new entries
            organizationId: p.organizationId,
            titleId: p.titleId,
            roleId: p.roleId,
            startDate: p.startDate, // startDate 추가
            endDate: p.endDate // endDate 추가
          })),
        };

        console.log('--- onSubmit - updatePayload ---');
        console.log(JSON.stringify(updatePayload, null, 2));

        await employeeService.updateEmployee(this.form.id, this.memberPositionId, updatePayload);
        ElMessage.success('직원 정보가 성공적으로 수정되었습니다.');
        this.$router.push('/employee');
      } catch (error) {
        console.error("직원 정보 수정에 실패했습니다:", error);
        ElMessage.error(error.response?.data?.message || '정보 수정에 실패했습니다.');
      }
    },
    onCancel() {
      this.$router.push('/employee');
    },
    resetPassword() {
      ElMessageBox.confirm(`'${this.form.name}' 님의 비밀번호를 초기화하시겠습니까?`, '비밀번호 초기화', {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(async () => {
        try {
          await employeeService.resetPassword(this.form.email);
          ElMessage.success('사용자의 이메일로 임시 비밀번호가 발송되었습니다.');
        } catch (error) {
          console.error("비밀번호 초기화 실패:", error);
          ElMessage.error(error.response?.data?.message || '비밀번호 초기화에 실패했습니다.');
        }
      }).catch(() => {
        ElMessage.info('비밀번호 초기화가 취소되었습니다.');
      });
    },
    addGradeHistory() {
      // 새로운 진급 이력을 추가하는 로직 (프론트엔드에서만)
      // 실제로는 모달 등을 띄워 입력받고, 백엔드 API를 호출해야 합니다.
      this.form.gradeHistorySet.push({
        gradeHistoryId: null, // 새로운 항목이므로 null로 초기화
        gradeId: null,
        promotionDate: new Date().toISOString().slice(0, 10),
        isActive: true, // 새로 추가된 직급은 기본적으로 활성으로 표시
        ynDel: false // 새로 추가된 직급은 삭제되지 않은 상태
      });
      ElMessage.info('새로운 직급 항목이 추가되었습니다. 저장 시 반영됩니다.');
    },
    removeGradeHistory(index) {
      ElMessageBox.confirm('해당 진급 이력을 삭제하시겠습니까?', '경고', {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        const updatedGrade = { ...this.form.gradeHistorySet[index] };
        updatedGrade.ynDel = true;
        updatedGrade.isActive = false; // 비활성화 상태로 변경
        this.form.gradeHistorySet.splice(index, 1, updatedGrade);
        ElMessage.success('진급 이력이 삭제 처리되었습니다. 저장 시 반영됩니다.');
      }).catch(() => {
        ElMessage.info('진급 이력 삭제가 취소되었습니다.');
      });
    },
    async permanentDeleteGradeHistory(gradeHistoryId) {
      if (!gradeHistoryId) {
        ElMessage.error('삭제할 진급 이력 ID가 없습니다.');
        return;
      }

      try {
        await ElMessageBox.confirm(
          '이 진급 이력을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
          '영구 삭제 확인',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'error',
          }
        );

        await employeeService.hardDeleteGradeHistory(gradeHistoryId);

        // Remove from frontend array after successful backend deletion
        const targetIndex = this.form.gradeHistorySet.findIndex(gh => gh.gradeHistoryId === gradeHistoryId);
        if (targetIndex !== -1) {
          this.form.gradeHistorySet.splice(targetIndex, 1);
        }

        ElMessage.success('진급 이력이 영구적으로 삭제되었습니다.');

      } catch (error) {
        if (error !== 'cancel') {
          console.error("진급 이력 영구 삭제에 실패했습니다:", error);
          ElMessage.error(error.response?.data?.message || '영구 삭제에 실패했습니다.');
        } else {
          ElMessage.info('영구 삭제가 취소되었습니다.');
        }
      }
    },
    addPosition() {
      this.newPositionCounter++;
      this.form.positions.push({
        tempId: `new-position-${this.newPositionCounter}`,
        memberPositionId: null, // null로 초기화
        organizationId: null, // null로 초기화
        organizationName: '', // organizationName 초기화
        titleId: null,       // null로 초기화
        roleId: null,        // null로 초기화
        startDate: new Date().toISOString().slice(0, 10),
        isActive: true, // 새로 추가된 직무는 기본적으로 활성으로 표시
        ynDel: false // 새로 추가된 직무는 삭제되지 않은 상태
      });
    },


    softDeletePosition(position) {
      ElMessageBox.confirm(
        '이 직무를 종료 처리하시겠습니까? 최종 반영을 위해 저장 버튼을 눌러야 합니다.',
        '직무 종료 확인',
        {
          confirmButtonText: '확인',
          cancelButtonText: '취소',
          type: 'warning',
        }
      ).then(() => {
        const targetIndex = this.form.positions.findIndex(p => p.memberPositionId === position.memberPositionId || p.tempId === position.tempId);
        if (targetIndex !== -1) {
          const updatedPosition = { ...this.form.positions[targetIndex] };
          updatedPosition.ynDel = true;
          updatedPosition.isActive = false; // 비활성화 상태로 변경
          this.form.positions.splice(targetIndex, 1, updatedPosition);
        }
        ElMessage.success('직무가 종료 처리되었습니다. 저장 버튼을 눌러 최종 반영해주세요.');
      }).catch(() => {
        ElMessage.info('직무 종료가 취소되었습니다.');
      });
    },
    getDisplayName(list, id) {
      const item = list.find(item => item.id === id);
      return item ? item.name : '';
    },
    async permanentDeletePosition(identifier) {
      let targetIndex = -1;
      let positionIdToDelete = null;

      if (typeof identifier === 'string' && identifier.startsWith('new-position-')) {
        // New position, find by its temporary ID
        targetIndex = this.form.positions.findIndex(p => p.tempId === identifier);
      } else if (typeof identifier === 'string') {
        // Existing position, find by memberPositionId (UUID)
        targetIndex = this.form.positions.findIndex(p => p.memberPositionId === identifier);
        positionIdToDelete = identifier;
      }

      if (targetIndex === -1) {
        ElMessage.error('삭제할 직무를 찾을 수 없습니다.');
        return;
      }

      if (!positionIdToDelete) {
        // If it's a new position (no memberPositionId), just remove from frontend
        this.form.positions.splice(targetIndex, 1);
        ElMessage.info('새로 추가된 항목이 삭제되었습니다.');
        return;
      }

      try {
        await ElMessageBox.confirm(
          '이 직무 이력을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
          '영구 삭제 확인',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'error',
          }
        );

        await employeeService.hardDeleteMemberPosition(positionIdToDelete);

        this.form.positions.splice(targetIndex, 1);

        ElMessage.success('직무 이력이 영구적으로 삭제되었습니다.');

      } catch (error) {
        if (error !== 'cancel') {
          console.error("직무 이력 영구 삭제에 실패했습니다:", error);
          ElMessage.error(error.response?.data?.message || '영구 삭제에 실패했습니다.');
        } else {
          ElMessage.info('영구 삭제가 취소되었습니다.');
        }
      }
    },
    openOrgModal(identifier) {
      this.editingPositionIdentifier = identifier;
      this.isOrgModalVisible = true;
    },
    handleOrgSelect(organization) {
      if (this.editingPositionIdentifier !== null) {
        let targetIndex = -1;

        if (typeof this.editingPositionIdentifier === 'string' && !this.editingPositionIdentifier.startsWith('new-position-')) {
          targetIndex = this.form.positions.findIndex(p => p.memberPositionId === this.editingPositionIdentifier);
        } else if (typeof this.editingPositionIdentifier === 'string' && this.editingPositionIdentifier.startsWith('new-position-')) {
          targetIndex = this.form.positions.findIndex(p => p.tempId === this.editingPositionIdentifier);
        }

        if (targetIndex !== -1) {
          const updatedPosition = { ...this.form.positions[targetIndex] };
          updatedPosition.organizationId = organization.id;
          updatedPosition.organizationName = organization.name;
          this.form.positions.splice(targetIndex, 1, updatedPosition);
        } else {
          console.warn('Could not find target position for update with identifier:', this.editingPositionIdentifier);
        }
      }
      this.isOrgModalVisible = false;
    },
    openAddressSearch() {
      this.isAddressModalVisible = true;
    },
    closeAddressModal() {
      this.isAddressModalVisible = false;
    },
    handleAddressSelected(data) {
      let roadAddr = data.roadAddress;
      let extraRoadAddr = '';

      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraRoadAddr += data.bname;
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      if (extraRoadAddr !== '') {
        extraRoadAddr = ' (' + extraRoadAddr + ')';
      }

      this.form.address = roadAddr + extraRoadAddr;
      this.form.detailAddress = '';
      this.isAddressModalVisible = false;
    }
  },
  created() {
    const employeeId = this.$route.params.id;
    if (employeeId) {
      this.fetchEmployeeData(employeeId);
    }
  }
};
</script>

<style scoped>
.employee-edit-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
}

.form-section {
  margin-bottom: 24px;
}

.el-select {
  width: 100%;
}

.reset-info {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  margin-left: 8px;
}

.form-actions {
  text-align: right;
  margin-top: 24px;
}

.section-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.positions-list .position-item,
.grade-history-list .grade-history-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.positions-list .position-item:last-child,
.grade-history-list .grade-history-item:last-child {
  margin-bottom: 0;
}

.position-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.position-item-header h4 {
  margin: 0;
  font-size: 16px;
}

.delete-grade-history-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}
</style>
