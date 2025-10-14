<template>
  <div class="payroll-item-management">
    <div class="page-header">
      <div class="header-content">
        <h1>급여 기초 정보</h1>
        <p>급여 지급 및 공제 항목을 관리합니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="info" @click="loadPayrollItems" :loading="loading">
          <el-icon><Refresh /></el-icon>
          새로고침
        </el-button>
        <el-button type="primary" @click="addNewItem">
          <el-icon><Plus /></el-icon>
          행 추가
        </el-button>
        <el-button type="success" @click="saveItems">
          <el-icon><Document /></el-icon>
          저장
        </el-button>
      </div>
    </div>

    <!-- 급여 항목 테이블 -->
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 항목 관리</span>
            <span class="item-count">총 {{ payrollItems.length }}개 항목</span>
          </div>
        </template>
        
        <div class="table-container">
          <el-table :data="payrollItems" border style="width: 100%">
            <el-table-column prop="id" label="번호" width="80" align="center" />
            
            <el-table-column label="구분" width="150" align="center">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.type" 
                  placeholder="선택하세요"
                  size="small"
                  style="width: 100%"
                  @change="(value) => handleTypeChange(scope.row, value)"
                >
                  <el-option label="지급항목" value="payment" />
                  <el-option label="공제항목" value="deduction" />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="항목명" min-width="200">
              <template #default="scope">
                <div class="item-name-container">
                  <el-select 
                    v-model="scope.row.itemName" 
                    placeholder="항목명을 선택하세요"
                    size="small"
                    style="width: 100%"
                    @change="(value) => handleItemNameChange(scope.row, value)"
                  >
                    <el-option 
                      v-for="option in getItemNameOptions(scope.row.type)" 
                      :key="option.value" 
                      :label="option.label" 
                      :value="option.value" 
                    />
                  </el-select>
                  <el-input 
                    v-if="scope.row.itemName === '기타항목'"
                    v-model="scope.row.customItemName" 
                    placeholder="직접 입력하세요"
                    size="small"
                    style="width: 100%; margin-top: 8px;"
                    @input="(value) => handleCustomItemNameChange(scope.row, value)"
                  />
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="설명" min-width="250">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.description" 
                  :placeholder="'항목 설명을 입력하세요'"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="사용여부" width="100" align="center">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.isActive"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="등록일" width="120" align="center">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="작업" width="120" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteItem(scope.$index)"
                >
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 테이블이 비어있을 때 -->
        <div v-if="payrollItems.length === 0" class="empty-state">
          <el-empty description="등록된 급여 항목이 없습니다">
            <el-button type="primary" @click="addNewItem">첫 번째 항목 추가</el-button>
          </el-empty>
        </div>
      </el-card>
    </div>

    <!-- 급여 항목 통계 -->
    <div class="statistics-section">
      <div class="stats-cards">
        <div class="stats-card payment">
          <div class="stats-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">지급항목</div>
            <div class="stats-value">{{ paymentItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card deduction">
          <div class="stats-icon">
            <el-icon><Remove /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">공제항목</div>
            <div class="stats-value">{{ deductionItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card active">
          <div class="stats-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">사용중인 항목</div>
            <div class="stats-value">{{ activeItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card inactive">
          <div class="stats-icon">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">미사용 항목</div>
            <div class="stats-value">{{ inactiveItemsCount }}개</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import axios from 'axios'

export default {
  name: 'PayrollItemManagement',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      payrollItems: [],
      originalPayrollItems: [], // 원본 데이터 저장
      loading: false,
    }
  },
  computed: {
    paymentItemsCount() {
      return this.payrollItems.filter(item => item.type === 'payment').length
    },
    deductionItemsCount() {
      return this.payrollItems.filter(item => item.type === 'deduction').length
    },
    activeItemsCount() {
      return this.payrollItems.filter(item => item.isActive).length
    },
    inactiveItemsCount() {
      return this.payrollItems.filter(item => !item.isActive).length
    }
  },
  methods: {
    // 백엔드에서 급여 항목 목록 로드
    async loadPayrollItems() {
      try {
        this.loading = true
        
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem/list`, {
          params: { companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e' }
        })
        
        // API 응답에 따라 데이터 구조 조정
        let items = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            items = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data
          } else if (response.data.payrollItems && Array.isArray(response.data.payrollItems)) {
            items = response.data.payrollItems
          }
        }
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedItems = items.map((item, index) => {
          const type = item.salaryType === 'ALLOWANCE' ? 'payment' : 'deduction'
          const availableOptions = this.getItemNameOptions(type)
          const isStandardItem = availableOptions.some(option => option.value === item.name)
          
          return {
            id: index + 1, // 화면에 보여줄 번호 (1부터 시작)
            uuid: item.id, // 실제 UUID는 내부적으로만 사용
            type: type,
            itemName: isStandardItem ? item.name : '기타항목',
            customItemName: isStandardItem ? '' : item.name,
            description: item.description || '',
            isActive: item.isActive === 'TRUE' || item.isActive === true,
            createdAt: item.createdAt
          }
        })
        
        // 지급 항목을 상위에, 공제 항목을 하위에 정렬
        // 각 구분 내에서 기타항목은 하단에 위치
        this.payrollItems = convertedItems.sort((a, b) => {
          // 먼저 구분별로 정렬 (지급 > 공제)
          if (a.type === 'payment' && b.type === 'deduction') return -1
          if (a.type === 'deduction' && b.type === 'payment') return 1
          
          // 같은 구분 내에서는 기타항목을 하단에 배치
          if (a.type === b.type) {
            if (a.itemName === '기타항목' && b.itemName !== '기타항목') return 1
            if (a.itemName !== '기타항목' && b.itemName === '기타항목') return -1
          }
          
          return 0
        })
        
        // 정렬 후 ID 재정렬 (1부터 순차적으로)
        this.payrollItems.forEach((item, index) => {
          item.id = index + 1
        })
        
        // 원본 데이터 저장 (깊은 복사)
        this.originalPayrollItems = JSON.parse(JSON.stringify(this.payrollItems))
        
      } catch (error) {
        console.error('급여 항목 로드 실패:', error)
        this.payrollItems = []
        this.originalPayrollItems = []
        this.error('급여 항목을 불러오는데 실패했습니다.')
      } finally {
        this.loading = false
      }
    },

    addNewItem() {
      const today = new Date()
      // 현재 존재하는 항목들 중 가장 큰 ID를 찾아서 +1
      const maxId = this.payrollItems.length > 0 ? Math.max(...this.payrollItems.map(item => item.id)) : 0
      const newItem = {
        id: maxId + 1,
        uuid: null, // 새 항목은 UUID가 없음
        type: '',
        itemName: '',
        customItemName: '',
        description: '',
        isActive: true,
        createdAt: today
      }
      this.payrollItems.push(newItem)
      this.info('새로운 항목이 추가되었습니다. 내용을 입력한 후 저장해주세요.')
    },
    async deleteItem(index) {
      const item = this.payrollItems[index]
      
      // 새로 추가된 항목(uuid가 null)인 경우 백엔드 요청 없이 로컬에서만 삭제
      if (!item.uuid) {
        this.$confirm('이 항목을 삭제하시겠습니까?', '삭제 확인', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning'
        }).then(() => {
          this.payrollItems.splice(index, 1)
          this.reorderIds()
          this.success('항목이 삭제되었습니다.')
        }).catch(() => {
          this.info('삭제가 취소되었습니다.')
        })
        return
      }

      // 기존 항목인 경우 백엔드 삭제 요청
      this.$confirm('이 항목을 삭제하시겠습니까?', '삭제 확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(async () => {
        try {
          // axios delete 요청으로 RequestBody에 항목의 uuid 배열로 전송 (일괄 삭제 대응)
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, {
            data: [item.uuid]
          })
          
          // 백엔드 삭제 성공 시 로컬에서도 삭제
          this.payrollItems.splice(index, 1)
          this.reorderIds()
          this.success('항목이 삭제되었습니다.')
        } catch (error) {
          console.error('항목 삭제 실패:', error)
          this.error('항목 삭제 중 오류가 발생했습니다.')
        }
      }).catch(() => {
        this.info('삭제가 취소되었습니다.')
      })
    },
    reorderIds() {
      // 모든 항목의 ID를 1부터 순차적으로 재정렬
      this.payrollItems.forEach((item, index) => {
        item.id = index + 1
      })
    },
    // 변경사항이 있는지 확인
    hasChanges() {
      if (this.payrollItems.length !== this.originalPayrollItems.length) {
        return true // 항목 개수가 다름
      }
      
      for (let i = 0; i < this.payrollItems.length; i++) {
        const current = this.payrollItems[i]
        const original = this.originalPayrollItems[i]
        
        if (!original) return true
        
        // 비교할 필드들
        const fieldsToCompare = ['type', 'itemName', 'customItemName', 'description', 'isActive']
        
        for (const field of fieldsToCompare) {
          if (current[field] !== original[field]) {
            return true
          }
        }
      }
      
      return false
    },

    // 개별 항목의 변경사항 확인
    hasItemChanged(originalItem, currentItem) {
      const fieldsToCompare = ['type', 'itemName', 'customItemName', 'description', 'isActive']
      
      for (const field of fieldsToCompare) {
        if (currentItem[field] !== originalItem[field]) {
          return true
        }
      }
      
      return false
    },

    async saveItems() {
      // 변경사항이 없으면 저장하지 않음
      if (!this.hasChanges()) {
        this.info('변경된 내용이 없습니다.')
        return
      }
      
      // 유효성 검사
      const invalidItems = this.payrollItems.filter(item => {
        if (!item.type || !item.itemName.trim()) return true
        // 기타항목인 경우 커스텀 항목명이 필수
        if (item.itemName === '기타항목' && !item.customItemName.trim()) return true
        return false
      })
      
      if (invalidItems.length > 0) {
        this.error('구분과 항목명은 필수 입력 항목입니다. 기타항목을 선택한 경우 직접 입력도 필요합니다.')
        return
      }
      
      // 저장 로직 (실제로는 API 호출)
      try {
        // 새 항목과 변경된 기존 항목을 구분
        const newItems = []
        const changedItems = []
        
        this.payrollItems.forEach(item => {
          const finalItemName = item.itemName === '기타항목' ? item.customItemName : item.itemName
          const finalSalaryType = item.type === 'payment' ? 'ALLOWANCE' : 'DEDUCTION'
          
          const itemData = {
            companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e', // 회사 UUID
            memberId: item.uuid, // 기존 항목의 UUID (새 항목은 null)
            salaryType: finalSalaryType,
            name: finalItemName, // 기타항목인 경우 입력 필드의 실제 값
            isActive: item.isActive ? 'TRUE' : 'FALSE',
            description: item.description
          }
          
          // 새 항목인 경우 (uuid가 null)
          if (!item.uuid) {
            newItems.push(itemData)
          } else {
            // 기존 항목인 경우 변경사항 확인
            const originalItem = this.originalPayrollItems.find(orig => orig.uuid === item.uuid)
            if (originalItem && this.hasItemChanged(originalItem, item)) {
              changedItems.push({
                id: item.uuid,
                salaryType: finalSalaryType,
                name: finalItemName,
                isActive: item.isActive ? 'TRUE' : 'FALSE',
                description: item.description
              })
            }
          }
        })
        
        // 새 항목 저장 (POST)
        if (newItems.length > 0) {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, newItems)
        }
        
        // 변경된 기존 항목 수정 (PUT)
        if (changedItems.length > 0) {
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, changedItems)
        }
        
        this.success('급여 항목이 성공적으로 저장되었습니다.', {
          title: '저장 완료',
          duration: 3000
        })
        
        // 저장 후 원본 데이터 업데이트
        this.originalPayrollItems = JSON.parse(JSON.stringify(this.payrollItems))
        
        // 저장 후 데이터 다시 로드
        await this.loadPayrollItems()
      } catch (error) {
        console.error('급여 항목 저장 실패:', error)
        this.error('저장 중 오류가 발생했습니다.')
      }
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    // 구분에 따른 항목명 옵션 반환
    getItemNameOptions(type) {
      if (type === 'payment') {
        return [
          { label: '기본급', value: '기본급' },
          { label: '연장수당', value: '연장수당' },
          { label: '야간수당', value: '야간수당' },
          { label: '직책수당', value: '직책수당' },
          { label: '식대', value: '식대' },
          { label: '기타항목', value: '기타항목' }
        ]
      } else if (type === 'deduction') {
        return [
          { label: '국민연금', value: '국민연금' },
          { label: '건강보험', value: '건강보험' },
          { label: '고용보험', value: '고용보험' },
          { label: '장기요양보험', value: '장기요양보험' },
          { label: '기타항목', value: '기타항목' }
        ]
      }
      return []
    },
    
    // 구분 변경 시 처리
    handleTypeChange(row) {
      // 구분이 변경되면 항목명과 커스텀 항목명 초기화
      row.itemName = ''
      row.customItemName = ''
      row.description = ''
    },
    
    // 항목명 변경 시 처리
    handleItemNameChange(row, newItemName) {
      // 기타항목이 아닌 경우 커스텀 항목명 초기화
      if (newItemName !== '기타항목') {
        row.customItemName = ''
        // 기타항목이 아닌 경우에만 기본 설명 설정
        this.updateDescriptionByItemName(row, newItemName)
      } else {
        // 기타항목 선택 시 설명 필드는 비워둠 (placeholder만 표시)
        row.description = ''
      }
    },
    
    // 커스텀 항목명 변경 시 처리
    handleCustomItemNameChange() {
      // 커스텀 항목명 변경 시에는 설명을 자동으로 설정하지 않음
      // 사용자가 직접 설명을 입력하도록 함
    },
    
    // 항목명에 따른 설명 자동 설정
    updateDescriptionByItemName(row, itemName) {
      const descriptions = {
        '기본급': '정규 직원 기본 급여',
        '연장수당': '정규 근무 시간 초과시 발생하는 수당',
        '야간수당': '야간 근무 수당',
        '직책수당': '직책에 따른 추가 수당',
        '식대': '직원 식대 지원금',
        '국민연금': '국민연금 보험료 공제',
        '건강보험': '건강보험료 공제',
        '고용보험': '고용보험료 공제',
        '장기요양보험': '장기요양보험료 공제',
        '기타항목': '기타 항목'
      }
      
      row.description = descriptions[itemName] || ''
    }
  },
  async created() {
    // 컴포넌트 생성 시 급여 항목 목록 로드
    await this.loadPayrollItems()
  }
}
</script>

<style scoped>
.payroll-item-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
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
  gap: 12px;
}

.content-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span:first-child {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.item-count {
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.table-container {
  margin-top: 16px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.statistics-section {
  margin-top: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stats-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stats-card.payment .stats-icon {
  background: #10b981;
}

.stats-card.deduction .stats-icon {
  background: #ef4444;
}

.stats-card.active .stats-icon {
  background: #3b82f6;
}

.stats-card.inactive .stats-icon {
  background: #6b7280;
}

.stats-content {
  flex: 1;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

/* 테이블 스타일 */
.table-container :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-container :deep(.el-table th) {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

.table-container :deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

.table-container :deep(.el-table tr:hover > td) {
  background: #f8f9fa;
}

/* 항목명 컨테이너 스타일 */
.item-name-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
