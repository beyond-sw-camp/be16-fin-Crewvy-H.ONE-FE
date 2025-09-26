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
                >
                  <el-option label="지급항목" value="payment" />
                  <el-option label="공제항목" value="deduction" />
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
                  :icon="Delete"
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

export default {
  name: 'PayrollItemManagement',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      payrollItems: [
        {
          id: 1,
          type: 'payment',
          itemName: '기본급',
          description: '기본 월급여',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 어제 날짜
        },
        {
          id: 2,
          type: 'payment',
          itemName: '직책수당',
          description: '직책에 따른 수당',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 어제 날짜
        },
        {
          id: 3,
          type: 'payment',
          itemName: '야간근무수당',
          description: '야간 근무시 지급되는 수당',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 어제 날짜
        },
        {
          id: 4,
          type: 'deduction',
          itemName: '국민연금',
          description: '국민연금 보험료',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 어제 날짜
        },
        {
          id: 5,
          type: 'deduction',
          itemName: '건강보험',
          description: '건강보험료',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 어제 날짜
        },
        {
          id: 6,
          type: 'deduction',
          itemName: '소득세',
          description: '소득세',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 어제 날짜
        }
      ],
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
    addNewItem() {
      const today = new Date()
      // 현재 존재하는 항목들 중 가장 큰 ID를 찾아서 +1
      const maxId = this.payrollItems.length > 0 ? Math.max(...this.payrollItems.map(item => item.id)) : 0
      const newItem = {
        id: maxId + 1,
        type: '',
        itemName: '',
        description: '',
        isActive: true,
        createdAt: today
      }
      this.payrollItems.push(newItem)
      this.info('새로운 항목이 추가되었습니다. 내용을 입력한 후 저장해주세요.')
    },
    deleteItem(index) {
      this.$confirm('이 항목을 삭제하시겠습니까?', '삭제 확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.payrollItems.splice(index, 1)
        // 삭제 후 ID 재정렬
        this.reorderIds()
        this.success('항목이 삭제되었습니다.')
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
    saveItems() {
      // 유효성 검사
      const invalidItems = this.payrollItems.filter(item => !item.type || !item.itemName.trim())
      
      if (invalidItems.length > 0) {
        this.error('구분과 항목명은 필수 입력 항목입니다.')
        return
      }
      
      // 저장 로직 (실제로는 API 호출)
      try {
        // 여기서 실제 저장 로직 수행
        // await this.savePayrollItems(this.payrollItems)
        
        this.success('급여 항목이 성공적으로 저장되었습니다.', {
          title: '저장 완료',
          duration: 3000
        })
      } catch (error) {
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
</style>
