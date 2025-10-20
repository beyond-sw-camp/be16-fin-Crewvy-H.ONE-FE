<template>
  <div class="payroll-item-management">
    <div class="page-header">
      <div class="header-content">
        <h1>급여 기초 정보</h1>
        <p>급여 지급 및 공제 항목을 관리합니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="addNewItem">
          <el-icon><Plus /></el-icon>
          행 추가
        </el-button>
        <el-button 
          type="success" 
          @click="saveItems"
          :class="{ 'disabled-button': !hasChanges }"
        >
          <el-icon><Document /></el-icon>
          저장
        </el-button>
        <el-button 
          type="info" 
          @click="cancelChanges"
          :class="{ 'disabled-button': !hasChanges }"
        >
          <el-icon><RefreshLeft /></el-icon>
          취소
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
        
        <!-- 테이블이 비어있을 때 -->
        <div v-if="payrollItems.length === 0" class="empty-state">
          <el-empty description="등록된 급여 항목이 없습니다">
            <el-button type="primary" @click="addNewItem">첫 번째 항목 추가</el-button>
          </el-empty>
        </div>
        
        <!-- 테이블이 있을 때 -->
        <div v-else class="table-container">
          <el-table 
            :data="payrollItems" 
            border 
            style="width: 100%"
            v-loading="loading"
            element-loading-text="데이터를 불러오는 중..."
          >
            <el-table-column label="번호" width="80" align="center">
              <template #default="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            
            <el-table-column label="구분" width="150" align="center">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.type" 
                  placeholder="선택하세요"
                  size="small"
                  style="width: 100%"
                >
                  <el-option label="지급" value="ALLOWANCE" />
                  <el-option label="공제" value="DEDUCTION" />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="항목명" min-width="200">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.itemName" 
                  placeholder="항목명을 입력하세요"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="설명" min-width="250">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.description" 
                  placeholder="항목 설명을 입력하세요"
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
                  <el-icon><Delete /></el-icon>
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
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
            <div class="stats-label">지급</div>
            <div class="stats-value">{{ paymentItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card deduction">
          <div class="stats-icon">
            <el-icon><Remove /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">공제</div>
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
import { 
  Plus, 
  Document, 
  RefreshLeft, 
  Money, 
  Remove, 
  Check, 
  Close, 
  Delete 
} from '@element-plus/icons-vue'

export default {
  name: 'PayrollItemManagement',
  components: {
    Plus,
    Document,
    RefreshLeft,
    Money,
    Remove,
    Check,
    Close,
    Delete
  },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      payrollItems: [],
      originalData: [], // 원본 데이터를 저장할 배열
      loading: false,
    }
  },
  computed: {
    paymentItemsCount() {
      return this.payrollItems.filter(item => item.type === 'ALLOWANCE').length
    },
    deductionItemsCount() {
      return this.payrollItems.filter(item => item.type === 'DEDUCTION').length
    },
    activeItemsCount() {
      return this.payrollItems.filter(item => item.isActive).length
    },
    inactiveItemsCount() {
      return this.payrollItems.filter(item => !item.isActive).length
    },
    hasChanges() {
      if (this.originalData.length !== this.payrollItems.length) {
        return true
      }
      
      return this.payrollItems.some((item, index) => {
        const original = this.originalData[index]
        if (!original) return true
        
        return (
          item.type !== original.type ||
          item.itemName !== original.itemName ||
          item.description !== original.description ||
          item.isActive !== original.isActive
        )
      })
    },
    changedItems() {
      return this.payrollItems.filter((item, index) => {
        const original = this.originalData[index]
        if (!original) return true
        
        return (
          item.type !== original.type ||
          item.itemName !== original.itemName ||
          item.description !== original.description ||
          item.isActive !== original.isActive
        )
      })
    }
  },
  async mounted() {
    await this.loadPayrollItems()
  },
  methods: {
    async loadPayrollItems() {
      try {
        this.loading = true
        
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem/list`, {
          params: { companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e' }
        })
        
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
        this.payrollItems = items.map(item => ({
          id: item.id,
          type: item.salaryType || item.type, // salaryType을 type으로 매핑
          itemName: item.name || item.itemName, // name 필드 사용
          description: item.description || '',
          isActive: item.isActive === 'TRUE' || item.isActive === true,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          isNew: false
        }))
        
        this.saveOriginalData()
        
        this.success('급여 항목 목록을 불러왔습니다.')
      } catch (error) {
        console.error('급여 항목 로드 실패:', error)
        this.error('급여 항목 목록을 불러오는데 실패했습니다.')
        // 에러 시 빈 배열로 초기화
        this.payrollItems = []
        this.saveOriginalData()
      } finally {
        this.loading = false
      }
    },

    saveOriginalData() {
      // 현재 데이터를 깊은 복사하여 원본 데이터로 저장
      this.originalData = JSON.parse(JSON.stringify(this.payrollItems))
    },
    addNewItem() {
      const today = new Date()
        const newItem = {
          id: null, // 새 항목은 ID가 null
          type: 'ALLOWANCE', // 기본값을 ALLOWANCE로 설정
          itemName: '',
          description: '',
          isActive: true,
          createdAt: today,
          isNew: true // 새로 추가된 항목임을 표시
        }
      this.payrollItems.push(newItem)
      this.info('새로운 항목이 추가되었습니다. 내용을 입력한 후 저장해주세요.')
    },
    async deleteItem(index) {
      const item = this.payrollItems[index]
      
      this.$confirm('이 항목을 삭제하시겠습니까?', '삭제 확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(async () => {
        try {
          // 서버에 저장된 항목인 경우 API 호출
          if (item.id && !item.isNew) {
            await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem/${item.id}`)
          }
          
          this.payrollItems.splice(index, 1)
          this.success('항목이 삭제되었습니다.')
        } catch (error) {
          console.error('항목 삭제 실패:', error)
          this.error('항목 삭제에 실패했습니다.')
        }
      }).catch(() => {
        this.info('삭제가 취소되었습니다.')
      })
    },
    cancelChanges() {
      // 변경사항이 없으면 취소하지 않음 (추가 안전장치)
      if (!this.hasChanges) {
        this.warning('취소할 변경사항이 없습니다.')
        return
      }
      
      this.$confirm('변경사항을 취소하시겠습니까?', '취소 확인', {
        confirmButtonText: '취소',
        cancelButtonText: '계속 편집',
        type: 'warning'
      }).then(() => {
        // 원본 데이터로 복원
        this.payrollItems = JSON.parse(JSON.stringify(this.originalData))
        this.info('변경사항이 취소되었습니다.')
      }).catch(() => {
        this.info('편집을 계속합니다.')
      })
    },
    async saveItems() {
      // 변경사항이 없으면 저장하지 않음 (추가 안전장치)
      if (!this.hasChanges) {
        this.warning('저장할 변경사항이 없습니다.')
        return
      }
      
      // 유효성 검사
      const invalidItems = this.payrollItems.filter(item => !item.type || !item.itemName.trim())
      
      if (invalidItems.length > 0) {
        this.error('구분과 항목명은 필수 입력 항목입니다.')
        return
      }
      
      try {
        this.loading = true
        
        // 새로 추가된 항목들과 수정된 항목들을 분리
        const newItems = this.payrollItems.filter(item => item.isNew)
        const updatedItems = this.payrollItems.filter(item => !item.isNew && item.id)
        
        // 새 항목들 추가
        for (const item of newItems) {
          const itemData = {
            companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e',
            memberId: '00000000-0000-0000-0000-000000000000', // [check]임시 memberId
            salaryType: item.type,
            name: item.itemName,
            description: item.description,
            isActive: item.isActive ? 'TRUE' : 'FALSE'
          }
          
          const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, itemData)
          // 응답에서 받은 ID로 업데이트
          item.id = response.data.id || response.data.data?.id
          item.isNew = false
        }
        
        // 수정된 항목들 업데이트
        for (const item of updatedItems) {
          const itemData = {
            id: item.id,
            companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e',
            memberId: '00000000-0000-0000-0000-000000000000', // 임시 memberId
            salaryType: item.type,
            name: item.itemName,
            description: item.description,
            isActive: item.isActive ? 'TRUE' : 'FALSE'
          }
          
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, itemData)
        }
        
        this.success(`${newItems.length + updatedItems.length}개의 항목이 성공적으로 저장되었습니다.`, {
          title: '저장 완료',
          duration: 3000
        })
        
        // 저장 성공 후 원본 데이터 업데이트
        this.saveOriginalData()
      } catch (error) {
        console.error('저장 실패:', error)
        this.error('저장 중 오류가 발생했습니다.')
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      })
    }
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

/* 버튼 스타일링 */
.disabled-button {
  opacity: 0.5 !important;
  filter: grayscale(50%);
}

.disabled-button:hover {
  transform: none !important;
}

/* 저장 버튼 활성화 상태 */
.header-actions .el-button--success:not(.disabled-button) {
  background-color: #67c23a;
  border-color: #67c23a;
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

.header-actions .el-button--success:not(.disabled-button):hover {
  background-color: #85ce61;
  border-color: #85ce61;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(103, 194, 58, 0.4);
}

/* 취소 버튼 활성화 상태 */
.header-actions .el-button--info:not(.disabled-button) {
  background-color: #909399;
  border-color: #909399;
  box-shadow: 0 2px 4px rgba(144, 147, 153, 0.3);
}

.header-actions .el-button--info:not(.disabled-button):hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(144, 147, 153, 0.4);
}
</style>
