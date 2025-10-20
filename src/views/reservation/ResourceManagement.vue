<template>
  <div class="resource-management">
    <div class="page-header">
      <div class="header-content">
        <h1>자원 관리</h1>
        <p>회의실, 차량 등 공용 자원을 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="success" @click="showCategoryDialog">
          <el-icon><Setting /></el-icon>
          <span style="margin-left: 8px;">카테고리 관리</span>
        </el-button>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">자원 추가</span>
        </el-button>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="자원명으로 검색..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-section">
        <el-select v-model="selectedCategory" placeholder="카테고리" clearable @change="handleFilter">
          <el-option label="전체" value="" />
          <el-option 
            v-for="category in categories" 
            :key="category.id" 
            :label="category.name" 
            :value="category.value" 
          />
        </el-select>
      </div>
      <div class="filter-section">
        <el-select v-model="selectedStatus" placeholder="상태" clearable @change="handleFilter">
          <el-option label="전체" value="" />
          <el-option 
            v-for="status in statusOptions" 
            :key="status.value" 
            :label="status.label" 
            :value="status.value" 
          />
        </el-select>
      </div>
    </div>

    <!-- 자원 목록 테이블 -->
    <div class="table-section">
      <el-table
        :data="filteredResources"
        v-loading="loading"
        style="width: 100%"
        empty-text="등록된 자원이 없습니다."
        :reserve-selection="true"
        :row-key="row => row.id"
      >
        <el-table-column label="ID" width="50">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="자원명" min-width="150" />
        <el-table-column prop="reservationCategoryName" label="카테고리" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagTypeByName(row.reservationCategoryName)">
              {{ row.reservationCategoryName || '카테고리 없음' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="위치" min-width="120" />
        <el-table-column prop="capacity" label="인원" width="50" />
        <el-table-column prop="status" label="상태" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="facilities" label="시설" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="설명" min-width="200" show-overflow-tooltip />
        <el-table-column label="관리" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editResource(row)">수정</el-button>
            <el-button size="small" type="danger" @click="deleteResource(row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 자원 추가/수정 다이얼로그 -->
    <el-dialog
      :title="isEditMode ? '자원 수정' : '자원 추가'"
      v-model="dialogVisible"
      width="600px"
      @close="resetForm"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resourceForm"
        :model="resourceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="자원명" prop="name">
          <el-input v-model="resourceForm.name" placeholder="자원명을 입력하세요" />
        </el-form-item>
        <el-form-item label="카테고리" prop="category">
          <el-select v-model="resourceForm.category" placeholder="카테고리를 선택하세요">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="위치" prop="location">
          <el-input v-model="resourceForm.location" placeholder="위치를 입력하세요" />
        </el-form-item>
        <el-form-item label="수용인원" prop="capacity">
          <el-input-number
            v-model="resourceForm.capacity"
            :min="1"
            :max="1000"
            placeholder="수용인원"
          />
        </el-form-item>
        <el-form-item label="시설" prop="facilities">
          <el-input 
            v-model="resourceForm.facilities" 
            placeholder="시설 정보를 입력하세요 (예: 프로젝터, 화이트보드, 에어컨 등)"
          />
        </el-form-item>
        <el-form-item v-if="isEditMode" label="상태" prop="status">
          <el-select v-model="resourceForm.status" placeholder="상태를 선택하세요">
            <el-option 
              v-for="status in statusOptions" 
              :key="status.value" 
              :label="status.label" 
              :value="status.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="설명" prop="description">
          <el-input
            v-model="resourceForm.description"
            type="textarea"
            :rows="3"
            placeholder="자원에 대한 설명을 입력하세요"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveResource" :loading="saving">
            {{ isEditMode ? '수정' : '추가' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 카테고리 관리 다이얼로그 -->
    <el-dialog
      title="카테고리 관리"
      v-model="categoryDialogVisible"
      width="600px"
      @close="resetCategoryForm"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <div class="category-management">
        <div class="category-form">
          <div class="category-form-content">
            <el-form
              ref="categoryForm"
              :model="categoryForm"
              :rules="categoryFormRules"
              label-width="100px"
              inline
            >
              <el-form-item label="카테고리명" prop="name">
                <el-input 
                  v-model="categoryForm.name" 
                  placeholder="카테고리명을 입력하세요" 
                  style="width: 200px;"
                />
              </el-form-item>
            </el-form>
            <div class="category-form-buttons">
              <el-button type="primary" @click="saveCategory" :loading="categorySaving">
                {{ isCategoryEditMode ? '수정' : '추가' }}
              </el-button>
              <el-button v-if="isCategoryEditMode" @click="cancelCategoryEdit">
                취소
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="category-list">
          <el-table 
            :data="categories" 
            style="width: 100%"
            :reserve-selection="true"
            :row-key="row => row.id"
          >
            <el-table-column prop="name" label="카테고리명" align="center" />
            <el-table-column label="관리" align="center">
              <template #default="{ row, $index }">
                <el-button 
                  size="small" 
                  @click="editCategory(row, $index)"
                >
                  수정
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteCategory(row, $index)"
                  :disabled="categories.length <= 1"
                >
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">닫기</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus'
import { Plus, Search, Setting } from '@element-plus/icons-vue'
import { useSnackbar } from '@/composables/useSnackbar'
import axios from 'axios'

export default {
  name: 'ResourceManagement',
  components: {
    Plus,
    Search,
    Setting
  },
  setup() {
    const { success, error } = useSnackbar()
    
    // ResizeObserver 루프 경고 방지
    const suppressResizeObserverError = () => {
      const originalError = console.error
      console.error = (...args) => {
        if (args[0] && args[0].includes && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
          return
        }
        originalError.apply(console, args)
      }
    }
    
    // 컴포넌트 마운트 시 에러 억제
    suppressResizeObserverError()
    
    return {
      success,
      error
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      dialogVisible: false,
      isEditMode: false,
      searchQuery: '',
      selectedCategory: '',
      selectedStatus: '',
      
      // 상태 옵션
      statusOptions: [],
      
      // 카테고리 관리
      categoryDialogVisible: false,
      categorySaving: false,
      isCategoryEditMode: false,
      editingCategoryIndex: -1,
      categories: [],
      categoryForm: {
        name: ''
      },
      categoryFormRules: {
        name: [
          { required: true, message: '카테고리명을 입력해주세요', trigger: 'blur' },
          { min: 2, max: 20, message: '카테고리명은 2-20자 사이여야 합니다', trigger: 'blur' }
        ]
      },
      
      // 자원 목록 데이터
      resources: [],
      
      // 폼 데이터
      resourceForm: {
        id: null,
        name: '',
        category: '',
        location: '',
        capacity: 1,
        facilities: '',
        status: 'available',
        description: ''
      },
      
      // 폼 검증 규칙
      formRules: {
        name: [
          { required: true, message: '자원명을 입력해주세요', trigger: 'blur' },
          { min: 2, max: 50, message: '자원명은 2-50자 사이여야 합니다', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '카테고리를 선택해주세요', trigger: 'change' }
        ],
        location: [
          { required: true, message: '위치를 입력해주세요', trigger: 'blur' },
          { min: 2, max: 100, message: '위치는 2-100자 사이여야 합니다', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '수용인원을 입력해주세요', trigger: 'blur' },
          { type: 'number', min: 1, max: 1000, message: '수용인원은 1-1000명 사이여야 합니다', trigger: 'blur' }
        ],
        status: [
          { required: this.isEditMode, message: '상태를 선택해주세요', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadResourceList()
    this.loadCategories()
    this.loadStatusOptions()
  },
  computed: {
    filteredResources() {
      let filtered = this.resources
      
      // 검색어 필터링
      if (this.searchQuery) {
        filtered = filtered.filter(resource =>
          resource.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          resource.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 카테고리 필터링
      if (this.selectedCategory) {
        filtered = filtered.filter(resource => resource.category === this.selectedCategory)
      }
      
      // 상태 필터링
      if (this.selectedStatus) {
        filtered = filtered.filter(resource => resource.status === this.selectedStatus)
      }
      
      return filtered
    }
  },
  methods: {
    async loadResourceList() {
      this.loading = true
      try {
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/list`, {
          params: { companyId: 'f1e85c26-14fa-4603-8edd-bfbdd82234ab' }
        })
        const list = Array.isArray(data) ? data : (data?.data || [])
        // 응답을 화면 테이블 스키마로 매핑
        this.resources = list.map(item => ({
          id: item.id || item.uuid || item.reservationTypeId,
          name: item.name || item.resourceName,
          reservationCategoryId: item.reservationCategory?.id || item.reservationCategoryId || null,
          reservationCategoryName: item.categoryName || item.reservationCategory?.name || '',
          category: item.category || (item.categoryName || item.reservationCategory?.name || '').toLowerCase().replace(/\s+/g, '_'),
          location: item.location || '',
          capacity: item.capacity ?? 1,
          facilities: item.facilities || '',
          status: item.reservationTypeStatus || 'available',
          description: item.description || '',
          createdAt: item.createdAt || ''
        })).sort((a, b) => {
          // 먼저 카테고리명으로 정렬
          const categoryA = a.reservationCategoryName || ''
          const categoryB = b.reservationCategoryName || ''
          
          if (categoryA !== categoryB) {
            return categoryA.localeCompare(categoryB, 'ko')
          }
          
          // 같은 카테고리 내에서는 자원명으로 정렬
          const nameA = a.name || ''
          const nameB = b.name || ''
          return nameA.localeCompare(nameB, 'ko')
        })
      } catch (e) {
        this.error('자원 목록 조회 실패')
        // eslint-disable-next-line no-console
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 검색 처리
    handleSearch() {
      // 검색은 computed property에서 자동으로 처리됨
    },
    
    // 필터 처리
    handleFilter() {
      // 필터링은 computed property에서 자동으로 처리됨
    },
    
    // 자원 추가 다이얼로그 표시
    showAddDialog() {
      this.isEditMode = false
      this.resetForm()
      // 카테고리 및 상태 목록 최신화
      this.loadCategories()
      this.loadStatusOptions()
      this.dialogVisible = true
    },
    
    // 자원 수정
    editResource(resource) {
      this.isEditMode = true
      
      // 카테고리 매핑: reservationCategoryName을 기반으로 category value 찾기
      let categoryValue = ''
      if (resource.reservationCategoryName) {
        const category = this.categories.find(cat => cat.name === resource.reservationCategoryName)
        categoryValue = category ? category.value : ''
      } else if (resource.reservationCategoryId) {
        const category = this.categories.find(cat => cat.id === resource.reservationCategoryId)
        categoryValue = category ? category.value : ''
      } else {
        categoryValue = resource.category || ''
      }
      
      this.resourceForm = { 
        ...resource,
        category: categoryValue,
        facilities: resource.facilities || ''
      }
      // 카테고리 및 상태 목록 최신화
      this.loadCategories()
      this.loadStatusOptions()
      this.dialogVisible = true
    },
    
    // 자원 삭제
    async deleteResource(resource) {
      try {
        await ElMessageBox.confirm(
          `"${resource.name}" 자원을 삭제하시겠습니까?`,
          '자원 삭제',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning'
          }
        )
        
        // 실제 API 삭제 요청
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/delete/${resource.id}`)
        
        // 삭제 후 목록을 다시 로드하여 최신 데이터 반영
        await this.loadResourceList()
        this.success('자원이 삭제되었습니다.')
        
      } catch (error) {
        if (error.message !== 'cancel') { // 사용자가 취소한 경우가 아닌 경우
          this.error('자원 삭제 중 오류가 발생했습니다.')
          console.error('자원 삭제 오류:', error)
        }
      }
    },
    
    // 자원 저장
    async saveResource() {
      try {
        await this.$refs.resourceForm.validate()
        
        this.saving = true
        
        const selectedCategory = this.categories.find(cat => cat.value === this.resourceForm.category)
        
        if (this.isEditMode) {
          // 수정
          const updateData = {
            reservationCategory: {
              id: selectedCategory?.id || null
            },
            name: this.resourceForm.name,
            location: this.resourceForm.location,
            capacity: this.resourceForm.capacity,
            facilities: this.resourceForm.facilities || '',
            description: this.resourceForm.description,
            reservationTypeStatus: this.resourceForm.status
          }
          
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/update/${this.resourceForm.id}`, updateData)
          
          // 자원 수정 후 목록을 다시 로드하여 최신 데이터 반영
          await this.loadResourceList()
          this.success('자원이 수정되었습니다.')
        } else {
          // 추가
          const createData = {
            reservationCategory: {
              id: selectedCategory?.id || null
            },
            name: this.resourceForm.name,
            location: this.resourceForm.location,
            capacity: this.resourceForm.capacity,
            facilities: this.resourceForm.facilities || '',
            description: this.resourceForm.description
          }
          
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/register`, createData)
          
          // 자원 추가 후 목록을 다시 로드하여 최신 데이터 반영
          await this.loadResourceList()
          this.success('자원이 추가되었습니다.')
        }
        
        this.dialogVisible = false
        this.resetForm()
        
      } catch (error) {
        if (error !== false) { // 폼 검증 실패가 아닌 경우
          this.error('저장 중 오류가 발생했습니다.')
        }
        console.error('자원 저장 오류:', error)
      } finally {
        this.saving = false
      }
    },
    
    // 폼 초기화
    resetForm() {
      this.resourceForm = {
        id: null,
        name: '',
        category: '',
        location: '',
        capacity: 1,
        facilities: '',
        status: 'available',
        description: ''
      }
      if (this.$refs.resourceForm) {
        this.$refs.resourceForm.clearValidate()
      }
    },
    
    
    // 카테고리 이름을 기반으로 태그 타입 반환
    getCategoryTagTypeByName(categoryName) {
      if (!categoryName) return 'info'
      
      const name = categoryName.toLowerCase()
      
      // 회의실 관련
      if (name.includes('회의실') || name.includes('meeting') || 
          name.includes('conference') || name.includes('room')) {
        return 'primary'
      }
      // 차량 관련
      else if (name.includes('차량') || name.includes('vehicle') || 
               name.includes('car') || name.includes('법인차량') ||
               name.includes('자동차')) {
        return 'success'
      }
      // 장비 관련
      else if (name.includes('장비') || name.includes('equipment') || 
               name.includes('기자재') || name.includes('device') ||
               name.includes('노트북') || name.includes('laptop')) {
        return 'warning'
      }
      // 시설 관련
      else if (name.includes('시설') || name.includes('facility') || 
               name.includes('공간') || name.includes('space')) {
        return 'info'
      }
      // 기타
      else if (name.includes('기타') || name.includes('other') || 
               name.includes('etc')) {
        return 'danger'
      }
      // 기본값
      else {
        return 'info'
      }
    },
    
    // 상태 라벨 반환
    getStatusLabel(status) {
      const statusOption = this.statusOptions.find(option => option.value === status)
      return statusOption ? statusOption.label : status
    },
    
    // 상태 태그 타입 반환
    getStatusTagType(status) {
      const statusOption = this.statusOptions.find(option => option.value === status)
      return statusOption ? statusOption.type : 'info'
    },

    // 상태명을 기반으로 태그 타입 반환 (API 응답 매핑용)
    getStatusTagTypeFromCode(statusName) {
      if (!statusName) return 'info'
      
      const upperStatusName = statusName.toUpperCase()
      const typeMapping = {
        // 사용 가능 상태
        'AVAILABLE': 'success',
        'ACTIVE': 'success',
        'READY': 'success',
        
        // 사용 중 상태
        'IN_USE': 'warning',
        'USING': 'warning',
        'OCCUPIED': 'warning',
        'BUSY': 'warning',
        
        // 점검/유지보수 상태
        'MAINTENANCE': 'danger',
        'REPAIR': 'danger',
        'OUT_OF_ORDER': 'danger',
        'DISABLED': 'danger',
        
        // 예약/대기 상태
        'BEFORE': 'primary',
        'RESERVED': 'primary',
        'PENDING': 'primary',
        'SCHEDULED': 'primary',
        
        // 완료/사용됨 상태
        'USED': 'info',
        'COMPLETED': 'info',
        'FINISHED': 'info',
        
        // 취소 상태
        'CANCELLED': 'info',
        
        // 비활성/정지 상태
        'INACTIVE': 'warning',
        'SUSPENDED': 'warning'
      }
      return typeMapping[upperStatusName] || 'info'
    },
    
    // 날짜 포맷팅
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    },
    
    // 카테고리 관리 다이얼로그 표시
    showCategoryDialog() {
      this.categoryDialogVisible = true
      this.loadCategories()
    },

    async loadCategories() {
      this.categorySaving = true
      try {
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/category/list`, {
          params: { companyId: 'f1e85c26-14fa-4603-8edd-bfbdd82234ab' }
        })
        const list = Array.isArray(data) ? data : (data?.data || [])
        this.categories = list.map(cat => ({
          id: cat.id || cat.categoryId || cat.uuid,
          name: cat.name,
          value: (cat.name || '').toLowerCase().replace(/\s+/g, '_')
        }))
        
      } catch (e) {
        this.error('카테고리 조회 실패')
        // eslint-disable-next-line no-console
        console.error(e)
      } finally {
        this.categorySaving = false
      }
    },

    async loadStatusOptions() {
      try {
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/status-list`)
        const list = Array.isArray(data) ? data : (data?.data || [])
        
        // 백엔드 응답을 statusOptions 형식으로 매핑
        this.statusOptions = list.map(status => ({
          value: status.statusName,
          label: status.codeName,
          type: this.getStatusTagTypeFromCode(status.statusName)
        }))
        
      } catch (e) {
        this.error('상태 목록 조회 실패')
        // eslint-disable-next-line no-console
        console.error(e)
        // API 실패 시 빈 배열로 설정
        this.statusOptions = []
      }
    },
    
    // 카테고리 저장 (추가/수정)
    async saveCategory() {
      try {
        await this.$refs.categoryForm.validate()
        
        this.categorySaving = true
        
        if (this.isCategoryEditMode) {
          // 수정: PUT /update/{id}
          const id = this.categories[this.editingCategoryIndex]?.id
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/category/update/${id}`, {
            name: this.categoryForm.name
          })
          this.success('카테고리가 수정되었습니다.')
        } else {
          // 추가: POST /register
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/category/register`, {
            name: this.categoryForm.name,
            companyId: 'f1e85c26-14fa-4603-8edd-bfbdd82234ab'
          })
          this.success('카테고리가 추가되었습니다.')
        }
        
        await this.loadCategories()
        this.resetCategoryForm()
        
      } catch (error) {
        if (error !== false) { // 폼 검증 실패가 아닌 경우
          this.error(this.isCategoryEditMode ? '카테고리 수정 중 오류가 발생했습니다.' : '카테고리 추가 중 오류가 발생했습니다.')
        }
      } finally {
        this.categorySaving = false
      }
    },
    
    // 카테고리 수정
    editCategory(category, index) {
      this.isCategoryEditMode = true
      this.editingCategoryIndex = index
      this.categoryForm.name = category.name
    },
    
    // 카테고리 수정 취소
    cancelCategoryEdit() {
      this.isCategoryEditMode = false
      this.editingCategoryIndex = -1
      this.resetCategoryForm()
    },
    
    // 카테고리 삭제
    async deleteCategory(category) {
      try {
        await ElMessageBox.confirm(
          `"${category.name}" 카테고리를 삭제하시겠습니까?`,
          '카테고리 삭제',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning'
          }
        )
        
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/category/delete/${category.id}`)
        await this.loadCategories()
        this.success('카테고리가 삭제되었습니다.')
        
      } catch (error) {
        // 사용자가 취소한 경우
      }
    },
    
    // 카테고리 폼 초기화
    resetCategoryForm() {
      this.categoryForm = {
        name: ''
      }
      this.isCategoryEditMode = false
      this.editingCategoryIndex = -1
      if (this.$refs.categoryForm) {
        this.$refs.categoryForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.resource-management {
  max-width: 1220px;
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
  gap: 12px;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-bar {
  flex: 2;
  min-width: 180px;
}

.search-bar .el-input {
  width: 100%;
}

.filter-section {
  flex: 1;
}

.filter-section .el-select {
  width: 100%;
}

.table-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .resource-management {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .search-section {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .search-bar {
    max-width: 100%;
    flex: none;
  }
  
  .search-bar .el-input {
    width: 100%;
  }
  
  .filter-section {
    flex: none;
    width: 100%;
  }
  
  .filter-section .el-select {
    width: 100%;
  }
  
  .table-section {
    padding: 16px;
    overflow-x: auto;
  }
}

/* 테이블 스타일 개선 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-table .cell) {
  padding: 0 12px;
}

/* 빈 상태 스타일 개선 */
:deep(.el-table__empty-block) {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-table__empty-text) {
  color: #909399;
  font-size: 14px;
}

/* 태그 스타일 */
:deep(.el-tag) {
  font-weight: 500;
}

/* 버튼 스타일 */
:deep(.el-button--small) {
  padding: 5px 12px;
  font-size: 12px;
}

/* 폼 스타일 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

:deep(.el-select .el-input__inner) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}

/* 다이얼로그 스타일 */
:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}

/* 카테고리 관리 스타일 */
.category-management {
  padding: 10px 0;
}

.category-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  width: 100%;
  min-width: 500px;
}

.category-form :deep(.el-form-item) {
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.category-form :deep(.el-form-item__label) {
  margin-bottom: 0 !important;
  line-height: 32px;
}

.category-form-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.category-form-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.category-form :deep(.el-form-item) {
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.category-form :deep(.el-form-item__label) {
  margin-bottom: 0 !important;
  line-height: 32px;
}

.category-form :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.category-list {
  margin-top: 20px;
}

.category-list .el-table {
  border-radius: 6px;
  overflow: hidden;
  min-height: 200px;
}

.category-list :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>