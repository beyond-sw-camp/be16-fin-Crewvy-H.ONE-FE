<template>
  <div class="resource">
    <div class="page-header">
      <div class="header-content">
        <h1>예약하기</h1>
        <p>회의실, 차량 등 공용 자원을 예약하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openReservationModal">
          <el-icon><Calendar /></el-icon>
          <span style="margin-left: 8px;">예약하기</span>
        </el-button>
        <el-button @click="showMyReservations = true">
          <el-icon><List /></el-icon>
          <span style="margin-left: 8px;">내 예약</span>
        </el-button>
        <el-button @click="showStatisticsModal">
          <el-icon><DataAnalysis /></el-icon>
          <span style="margin-left: 8px;">통계</span>
        </el-button>
      </div>
    </div>

    <!-- 자원 현황 카드 -->
    <div class="resource-cards">
      <div class="resource-card">
        <div class="card-icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">회의실</div>
          <div class="d-flex">
            <div class="card-value">{{ safeMeetingRooms.length }}개</div>
            <div class="card-subtitle">사용 가능</div> 
          </div>
          
        </div>
      </div>
      
      <div class="resource-card">
        <div class="card-icon">
          <el-icon><Van /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">법인 차량</div>
          <div class="card-value">{{ safeVehicles.length }}대</div>
          <div class="card-subtitle">예약 가능</div>
        </div>
      </div>
      
      <div class="resource-card">
        <div class="card-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">오늘 예약</div>
          <div class="card-value">{{ todayReservations }}</div>
          <div class="card-subtitle">건</div>
        </div>
      </div>
      
      <div class="resource-card">
        <div class="card-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">활성 사용자</div>
          <div class="card-value">{{ activeUsers }}</div>
          <div class="card-subtitle">명</div>
        </div>
      </div>
    </div>

    <!-- 자원 목록 -->
    <div class="resource-section">
      <div class="section-header">
        <h3>자원 목록</h3>
        <div class="filter-options">
          <el-select v-model="selectedType" placeholder="자원 유형" style="width: 150px">
            <el-option label="전체" value="" />
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.name" 
            />
          </el-select>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="날짜 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
      </div>
      
      <div class="resource-list">
        <div class="resource-item" v-for="resource in filteredResources" :key="resource.id">
          <div class="resource-info">
            <div class="resource-name">{{ resource.name }}</div>
            <div class="resource-details">
              <div class="resource-capacity">
                <el-icon><User /></el-icon>
                <span>{{ resource.capacity }}명</span>
              </div>
              <div class="resource-equipment">
                <el-icon><Setting /></el-icon>
                <span>{{ resource.equipment || '시설 정보 없음' }}</span>
              </div>
            </div>
            <div class="resource-description">{{ resource.description || '자세한 설명이 없습니다.' }}</div>
          </div>
          <div class="resource-location">
            <el-tag :type="getResourceType(resource.type)" size="small">
              {{ resource.categoryName || '기타' }}
            </el-tag>
            <span class="location-text">{{ resource.location }}</span>
          </div>
          <div class="resource-actions">
            <el-button 
              type="primary"
              size="small"
              @click="reserveResource(resource)"
            >
              <el-icon><Calendar /></el-icon>
              예약
            </el-button>
            <el-button size="small" @click="viewResourceDetails(resource)">
              <el-icon><View /></el-icon>
              상세
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 예약 모달 -->
    <el-dialog
      v-model="showReservation"
      :title="isEditingMode ? '예약 수정' : '예약하기'"
      width="900px"
      :before-close="handleReservationClose"
    >
      <div class="reservation-modal">
        <!-- 자원 선택 및 날짜 선택 -->
        <div class="reservation-form-header">
          <div class="resource-selection">
            <el-form-item label="자원 선택">
              <el-select v-model="reservationForm.resourceId" placeholder="자원을 선택하세요" @change="onResourceChange">
                <el-option
                  v-for="resource in availableResources"
                  :key="resource.id"
                  :label="resource.name"
                  :value="resource.id"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="date-selection">
            <el-form-item label="예약 날짜">
              <el-date-picker
                v-model="reservationForm.date"
                type="date"
                placeholder="날짜 선택"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="onDateChange"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 예약 캘린더 영역 -->
        <div class="reservation-calendar">
          <h4>예약 현황 및 시간 선택</h4>
          <div class="calendar-container">
            <!-- 시간 헤더 -->
            <div class="time-header">
              <div class="date-label">날짜</div>
              <div class="time-labels">
                <div 
                  v-for="hour in timeSlots" 
                  :key="hour.value"
                  class="time-header-cell"
                >
                  {{ hour.label }}
                </div>
              </div>
            </div>
            
            <!-- 날짜별 시간 슬롯 -->
            <div class="calendar-grid">
              <div 
                v-for="date in weekDates" 
                :key="date.date"
                class="date-row"
              >
                <div class="date-cell">
                  <div class="date-text">{{ formatDateForDisplay(date.date) }}</div>
                  <div class="day-text">{{ date.day }}</div>
                </div>
                <div class="time-row">
                  <el-tooltip
                    v-for="hour in timeSlots" 
                    :key="`${date.date}-${hour.value}`"
                    :content="getReservationTooltip(date.date, hour.value)"
                    placement="top"
                    :disabled="!getReservationTooltip(date.date, hour.value)"
                    effect="dark"
                    :show-after="300"
                  >
                    <div 
                      class="time-cell"
                      :class="[
                        {
                          'selected': isTimeCellSelected(date.date, hour.value),
                          'selecting': isTimeCellInSelection(date.date, hour.value)
                        },
                        getTimeCellClass(date.date, hour.value)
                      ]"
                      @mousedown="startTimeCellSelection(date.date, hour.value)"
                      @mouseenter="updateTimeCellSelection(date.date, hour.value)"
                      @mouseup="endTimeCellSelection"
                    >
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
            
            <!-- 선택 정보 -->
            <div class="selection-info">
              <div class="selected-info">
                <span v-if="reservationForm.startTime && reservationForm.endTime && reservationForm.date">
                  선택된 예약: {{ reservationForm.date }} {{ reservationForm.startTime }} - {{ reservationForm.endTime }}
                  <span v-if="reservationForm.resourceId">
                    ({{ getResourceName(reservationForm.resourceId) }})
                  </span>
                </span>
                <span v-else-if="!reservationForm.resourceId" class="selection-hint">
                  모든 자원의 예약 현황을 확인할 수 있습니다. 자원을 선택하거나 드래그하여 날짜와 시간을 선택하세요
                </span>
                <span v-else class="selection-hint">드래그하여 날짜와 시간을 선택하세요</span>
              </div>
              <div class="legend">
                <div class="legend-item">
                  <div class="legend-color available"></div>
                  <span>예약 가능</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color reserved"></div>
                  <span>예약됨</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color selected"></div>
                  <span>선택됨</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <!-- 예약 상세 정보 -->
        <div class="reservation-details">
          <el-form :model="reservationForm" label-width="100px">
            <div class="form-row">
              <el-form-item label="사용 목적">
                <el-input
                  v-model="reservationForm.purpose"
                  placeholder="사용 목적을 입력하세요."
                />
              </el-form-item>
              <el-form-item label="참석자 수">
                <el-input-number
                  v-model="reservationForm.attendees"
                  :min="1"
                  :max="getMaxCapacity()"
                />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="비고">
                <el-input
                  v-model="reservationForm.notes"
                  type="textarea"
                  placeholder="추가 사항을 입력하세요."
                  :rows="2"
                />
              </el-form-item>
              <el-form-item label="공동 사용자">
                <div class="tag-input-container">
                  <div class="tag-input-tags">
                    <el-tag
                      v-for="(user, index) in reservationForm.sharedUsers"
                      :key="`user-${index}`"
                      closable
                      @close="removeSharedUser(index)"
                      size="small"
                      class="tag-input-tag"
                    >
                      {{ user }}
                    </el-tag>
                  </div>
                  <el-input
                    v-model="reservationForm.sharedUserInput"
                    :placeholder="(reservationForm.sharedUsers || []).length > 0 ? '' : '공동 사용자 이름을 입력하세요.'"
                    @keyup.enter="addSharedUser"
                    @blur="addSharedUser"
                    @keydown.backspace="handleBackspace"
                    class="tag-input-field"
                    size="small"
                    ref="mainInput"
                  />
                </div>
              </el-form-item>
            </div>
            
            <!-- 반복 설정 섹션 -->
            <div class="recurrence-section">
              <el-form-item label="반복 설정">
                <div class="recurrence-container">
                  <el-checkbox v-model="reservationForm.isRecurring" @change="onRecurrenceToggle">
                    정기 예약으로 설정
                  </el-checkbox>
                  
                  <div v-if="reservationForm.isRecurring" class="recurrence-options">
                    <div class="recurrence-type-row">
                      <span class="recurrence-label">반복 주기:</span>
                      <el-select v-model="reservationForm.recurrenceType" style="width: 120px; margin-right: 12px;">
                        <el-option label="매일" value="daily" />
                        <el-option label="매주" value="weekly" />
                        <el-option label="매월" value="monthly" />
                      </el-select>
                      <span class="recurrence-label">간격:</span>
                      <el-input-number
                        v-model="reservationForm.recurrenceInterval"
                        :min="1"
                        :max="12"
                        style="width: 80px; margin-right: 12px;"
                      />
                      <span class="recurrence-label">{{ getRecurrenceIntervalText() }}</span>
                    </div>
                    
                    <!-- 매주 반복시 요일 선택 -->
                    <div v-if="reservationForm.recurrenceType === 'weekly'" class="recurrence-days">
                      <span class="recurrence-label">반복 요일:</span>
                      <el-checkbox-group v-model="reservationForm.recurrenceDays">
                        <el-checkbox label="0">일</el-checkbox>
                        <el-checkbox label="1">월</el-checkbox>
                        <el-checkbox label="2">화</el-checkbox>
                        <el-checkbox label="3">수</el-checkbox>
                        <el-checkbox label="4">목</el-checkbox>
                        <el-checkbox label="5">금</el-checkbox>
                        <el-checkbox label="6">토</el-checkbox>
                      </el-checkbox-group>
                    </div>
                    
                    <div class="recurrence-end">
                      <span class="recurrence-label">종료일:</span>
                      <el-date-picker
                        v-model="reservationForm.recurrenceEndDate"
                        type="date"
                        placeholder="종료일 선택"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 200px;"
                      />
                    </div>
                  </div>
                </div>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="showReservation = false">취소</el-button>
        <el-button type="primary" @click="submitReservation" :disabled="!canSubmitReservation">
          {{ isEditingMode ? '수정' : '예약' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 내 예약 모달 -->
    <el-dialog
      v-model="showMyReservations"
      title="내 예약 현황"
      width="800px"
    >
      <div class="my-reservations">
        <div class="reservation-list">
          <div class="reservation-item" v-for="reservation in myReservations" :key="reservation.id">
            <div class="reservation-info">
              <div class="reservation-header">
                <div class="reservation-title">{{ reservation.resourceName }}</div>
                <div class="reservation-date-large">{{ reservation.date }}</div>
              </div>
              <div class="reservation-details">
                <div class="reservation-time">
                  <el-icon><Clock /></el-icon>
                  <span>{{ reservation.startTime }} - {{ reservation.endTime }}</span>
                </div>
                <div class="reservation-purpose">
                  <el-icon><Document /></el-icon>
                  <span>{{ reservation.purpose }}</span>
                </div>
                <div class="reservation-attendees">
                  <el-icon><User /></el-icon>
                  <span>{{ reservation.attendees }}명</span>
                </div>
                <div class="reservation-status">
                  <el-tag :type="getReservationStatusType(reservation.status)" size="small">
                    {{ getReservationStatusLabel(reservation.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="reservation-actions">
              <el-button @click="editReservation(reservation)">
                <el-icon><Edit /></el-icon>
                수정
              </el-button>
              <el-button @click="cancelReservation(reservation)">
                <el-icon><Close /></el-icon>
                취소
              </el-button>
              <el-button v-if="reservation.status === '이용 중'" type="success" @click="completeUsage(reservation)">
                <el-icon><Check /></el-icon>
                이용 완료
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 통계 모달 -->
    <el-dialog
      v-model="showStatistics"
      title="자원 이용 통계"
      width="1000px"
    >
      <div class="statistics-content">
        <div class="stats-grid">
          <div class="stat-card">
            <h4>이용률</h4>
            <div class="stat-value">{{ statistics.usageRate }}%</div>
          </div>
          <div class="stat-card">
            <h4>Peak Time</h4>
            <div class="stat-value">{{ statistics.peakTime }}</div>
          </div>
          <div class="stat-card">
            <h4>No Show</h4>
            <div class="stat-value">{{ statistics.noShow }}건</div>
          </div>
          <div class="stat-card">
            <h4>총 예약</h4>
            <div class="stat-value">{{ statistics.totalReservations }}건</div>
          </div>
        </div>
        
        <div class="chart-section">
          <h4>월별 이용 현황</h4>
          <div class="chart-container">
            <canvas ref="monthlyChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <div class="chart-section">
          <h4>자원별 이용률</h4>
          <div class="chart-container">
            <canvas ref="resourceChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 이용 완료 모달 -->
    <el-dialog
      v-model="showUsageCompletion"
      title="이용 완료"
      width="600px"
    >
      <el-form :model="usageCompletionForm" label-width="120px">
        <el-form-item label="자원명">
          <el-input v-model="usageCompletionForm.resourceName" disabled />
        </el-form-item>
        <el-form-item label="이용 날짜">
          <el-input v-model="usageCompletionForm.date" disabled />
        </el-form-item>
        <el-form-item label="이용 시간">
          <el-input v-model="usageCompletionForm.timeRange" disabled />
        </el-form-item>
        <el-form-item label="유류비 (차량인 경우)">
          <el-input-number 
            v-model="usageCompletionForm.fuelCost" 
            :min="0" 
            :precision="0"
            placeholder="유류비를 입력하세요"
          />
          <span style="margin-left: 8px;">원</span>
        </el-form-item>
        <el-form-item label="주행 거리 (차량인 경우)">
          <el-input-number 
            v-model="usageCompletionForm.distance" 
            :min="0" 
            :precision="1"
            placeholder="주행 거리를 입력하세요"
          />
          <span style="margin-left: 8px;">km</span>
        </el-form-item>
        <el-form-item label="운행 기록">
          <el-input
            v-model="usageCompletionForm.drivingRecord"
            type="textarea"
            placeholder="운행 기록을 입력하세요"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="이용 후 상태">
          <el-select v-model="usageCompletionForm.condition" placeholder="자원 상태를 선택하세요">
            <el-option label="정상" value="normal" />
            <el-option label="손상 있음" value="damaged" />
            <el-option label="청소 필요" value="cleaning_needed" />
          </el-select>
        </el-form-item>
        <el-form-item label="기타 사항">
          <el-input
            v-model="usageCompletionForm.notes"
            type="textarea"
            placeholder="기타 사항을 입력하세요"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUsageCompletion = false">취소</el-button>
        <el-button type="primary" @click="submitUsageCompletion">완료</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import Chart from 'chart.js/auto'
import axios from 'axios'

export default {
  name: 'ResourceReservation',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      selectedType: '',
      selectedDate: '',
      categories: [],
      showReservation: false,
      showMyReservations: false,
      showStatistics: false,
      showUsageCompletion: false,
      isEditingMode: false,
      editingReservationId: null,
      monthlyChartInstance: null,
      resourceChartInstance: null,
      reservationForm: {
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        notes: '',
        sharedUsers: [],
        sharedUserInput: '',
        isRecurring: false,
        recurrenceType: 'weekly', // daily, weekly, monthly
        recurrenceInterval: 1, // 매주, 매월 등
        recurrenceEndDate: '',
        recurrenceDays: [] // 요일 선택 (매주 반복시)
      },

      timeSlots: [],
      weekDates: [],
      isSelecting: false,
      selectionStartDate: null,
      selectionStartHour: null,
      selectionEndDate: null,
      selectionEndHour: null,
      reservations: [],
      todayReservations: 0,
      activeUsers: 0,
      meetingRooms: [],
      vehicles: [],
      resources: [],
      myReservations: [],
      allReservations: [], // 전체 예약 목록 (예약 가능 시간 확인용)
      statistics: {
        usageRate: 0,
        peakTime: '',
        noShow: 0,
        totalReservations: 0
      },
      monthlyData: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        datasets: [{
          label: '예약 건수',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      resourceData: {
        labels: [],
        datasets: [{
          label: '이용률 (%)',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2
        }]
      },
      usageCompletionForm: {
        resourceName: '',
        date: '',
        timeRange: '',
        fuelCost: 0,
        distance: 0,
        drivingRecord: '',
        condition: '',
        notes: ''
      }
    }
  },
  async mounted() {
    // 컴포넌트 마운트 시 데이터 로드
    await this.loadCategories()
    await this.loadResources()
    await this.loadMyReservations()
    await this.loadAllReservations()
  },
  beforeUnmount() {
    if (this.monthlyChartInstance) {
      this.monthlyChartInstance.destroy()
      this.monthlyChartInstance = null
    }
    if (this.resourceChartInstance) {
      this.resourceChartInstance.destroy()
      this.resourceChartInstance = null
    }
  },
  computed: {
    filteredResources() {
      let filtered = this.resources
      
      if (this.selectedType) {
        filtered = filtered.filter(resource => resource.categoryName === this.selectedType)
      }
      
      return filtered
    },
    
    availableResources() {
      return this.resources.filter(resource => resource.status === 'available')
    },
    canSubmitReservation() {
      return this.reservationForm.resourceId && 
             this.reservationForm.date && 
             this.reservationForm.startTime && 
             this.reservationForm.endTime && 
             this.reservationForm.purpose
    },
    safeMeetingRooms() {
      return this.meetingRooms || []
    },
    safeVehicles() {
      return this.vehicles || []
    }
  },
  methods: {
    async loadResources() {
      try {
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/list`, {
          params: { companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e' }
        })
        const list = Array.isArray(data) ? data : (data?.data || [])
        // 응답을 화면 테이블 스키마로 매핑
        this.resources = list.map(item => ({
          id: item.id || item.uuid || item.reservationTypeId,
          name: item.name || item.resourceName,
          type: this.getResourceTypeFromCategory(item.reservationCategory?.name || item.categoryName || ''),
          categoryName: item.reservationCategory?.name || item.categoryName || '',
          location: item.location || '',
          capacity: item.capacity ?? 1,
          equipment: item.facilities || '',
          status: item.status || 'available',
          description: item.description || '',
          maxHours: 8, // 기본값 설정
          requiresApproval: false // 기본값 설정
        }))
      } catch (error) {
        console.error('자원 목록 로드 실패:', error)
        this.error('자원 목록을 불러오는데 실패했습니다.')
      }
    },
    
    // 카테고리 목록 로드
    async loadCategories() {
      try {
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/category/list`, {
          params: { companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e' }
        })
        const list = Array.isArray(data) ? data : (data?.data || [])
        this.categories = list.map(cat => ({
          id: cat.id || cat.categoryId || cat.uuid,
          name: cat.name,
          value: (cat.name || '').toLowerCase().replace(/\s+/g, '_')
        }))
      } catch (error) {
        console.error('카테고리 조회 실패:', error)
        this.error('카테고리 목록을 불러오는데 실패했습니다.')
      }
    },
    
    // 카테고리 이름을 기반으로 자원 타입 결정
    getResourceTypeFromCategory(categoryName) {
      if (!categoryName) return 'other'
      
      const name = categoryName.toLowerCase()
      if (name.includes('회의실') || name.includes('meeting') || name.includes('conference')) {
        return 'meeting'
      } else if (name.includes('차량') || name.includes('vehicle') || name.includes('car')) {
        return 'vehicle'
      } else if (name.includes('장비') || name.includes('equipment') || name.includes('device')) {
        return 'equipment'
      } else {
        return 'other'
      }
    },
    
    async loadMyReservations() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/myList`, {
          params: { 
            memberId: 'c4998317-a9a3-4856-981f-366f07c29367',
            companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e' 
          }
        })
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        
        this.myReservations = list.map(item => {
          const startDateTime = new Date(item.startDateTime)
          const endDateTime = new Date(item.endDateTime)
          
          // 자원 정보 찾기
          const resource = this.resources.find(r => r.id === item.reservationTypeId)
          
          return {
            id: item.id,
            reservationTypeId: item.reservationTypeId,
            memberId: item.memberId,
            companyId: item.companyId,
            status: item.status,
            startDateTime: item.startDateTime,
            endDateTime: item.endDateTime,
            // [check] 이후 추가
            resourceName: resource ? resource.name : '알 수 없는 자원',
            date: startDateTime.toISOString().split('T')[0],
            startTime: startDateTime.toTimeString().split(' ')[0].substring(0, 5),
            endTime: endDateTime.toTimeString().split(' ')[0].substring(0, 5),
            purpose: '사용 목적 없음',
            attendees: 1 
          }
        })
      } catch (error) {
        console.error('내 예약 목록 로드 실패:', error)
        this.error('예약 목록을 불러오는데 실패했습니다.')
      }
    },
    
    async loadAllReservations() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/list`, {
          params: { 
            companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e' 
          }
        })
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        
        // 전체 예약 목록을 저장 (예약 가능 시간 확인용)
        this.allReservations = list.map(item => {
          const startDateTime = new Date(item.startDateTime)
          const endDateTime = new Date(item.endDateTime)
          
          return {
            id: item.id,
            reservationTypeId: item.reservationTypeId,
            memberId: item.memberId,
            companyId: item.companyId,
            status: item.status,
            startDateTime: item.startDateTime,
            endDateTime: item.endDateTime,
            date: startDateTime.toISOString().split('T')[0],
            startTime: startDateTime.toTimeString().split(' ')[0].substring(0, 5),
            endTime: endDateTime.toTimeString().split(' ')[0].substring(0, 5)
          }
        })
      } catch (error) {
        console.error('전체 예약 목록 로드 실패:', error)
        this.error('예약 현황을 불러오는데 실패했습니다.')
      }
    },
    
    async submitReservationToServer(reservationData, reservationId = null) {
      try {
        const requestData = {
          reservationTypeId: reservationData.resourceId,
          memberId: 'c4998317-a9a3-4856-981f-366f07c29367',
          companyId: 'e0b3b4a0-9b1e-4e6a-8b0c-3e2b1f3b3b1e',
          startDateTime: `${reservationData.date}T${reservationData.startTime}:00`,
          endDateTime: `${reservationData.date}T${reservationData.endTime}:00`
        }
        
        let response
        if (reservationId) {
          response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/${reservationId}`, requestData)
        } else {
          response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/register`, requestData)
        }
        return response.data
      } catch (error) {
        console.error(reservationId ? '예약 수정 실패:' : '예약 생성 실패:', error)
        throw error
      }
    },
    getResourceType(type) {
      const typeMap = {
        'meeting': 'primary',
        'vehicle': 'success',
        'other': 'info'
      }
      return typeMap[type] || 'info'
    },
    getResourceTypeName(type) {
      // 기본 타입 매핑 (하위 호환성을 위해 유지)
      const typeMap = {
        'meeting': '회의실',
        'vehicle': '차량',
        'equipment': '장비',
        'other': '기타'
      }
      return typeMap[type] || '기타'
    },
    getStatusText(status) {
      const statusMap = {
        'available': '사용 가능',
        'occupied': '사용 중',
        'maintenance': '점검 중'
      }
      return statusMap[status] || '알 수 없음'
    },
    getReservationStatusType(status) {
      const statusMap = {
        'ACTIVE': 'success',      // 활성 상태
        'CANCELLED': 'danger',    // 취소됨
        'COMPLETED': 'info',      // 완료됨
        'PENDING': 'warning',     // 대기 중
        'CONFIRMED': 'primary'    // 확인됨
      }
      return statusMap[status] || 'info'
    },
    getReservationStatusLabel(status) {
      const statusMap = {
        'ACTIVE': '이용 중',
        'CANCELLED': '취소됨',
        'COMPLETED': '완료됨',
        'PENDING': '대기 중',
        'CONFIRMED': '확인됨'
      }
      return statusMap[status] || status
    },
    // 캘린더 관련 메서드들
    generateTimeSlots() {
      this.timeSlots = []
      for (let hour = 9; hour <= 22; hour++) {
        this.timeSlots.push({
          value: hour,
          label: `${hour.toString().padStart(2, '0')}:00`
        })
      }
    },
    generateWeekDates() {
      this.weekDates = []
      
      // 선택된 날짜가 있으면 해당 날짜부터, 없으면 오늘부터 시작
      const startDate = this.reservationForm.date ? new Date(this.reservationForm.date) : new Date()
      
      // 선택된 날짜부터 7일간의 날짜 생성
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        this.weekDates.push({
          date: this.formatDate(date),
          day: this.getDayName(date.getDay()),
          fullDate: date
        })
      }
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDateForDisplay(dateStr) {
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}/${day}`
    },
    getDayName(dayIndex) {
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return days[dayIndex]
    },
    isToday(dateStr) {
      const today = this.formatDate(new Date())
      return dateStr === today
    },
    onResourceChange() {
      // 자원이 변경되면 선택된 시간을 초기화하고 캘린더를 다시 렌더링
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.reservationForm.date = ''
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
      this.generateWeekDates()
    },
    onDateChange() {
      // 날짜가 변경되면 선택된 시간을 초기화하고 캘린더를 다시 렌더링
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
      this.generateWeekDates()
    },
    // 새로운 시간 셀 선택 메서드들
    startTimeCellSelection(date, hour) {
      // 자원이 선택되지 않은 상태에서는 예약된 시간대도 선택할 수 있음 (자원 선택을 위해)
      if (this.reservationForm.resourceId && this.isTimeCellReserved(date, hour)) {
        return
      }
      
      this.isSelecting = true
      this.selectionStartDate = date
      this.selectionStartHour = hour
      this.selectionEndDate = date
      this.selectionEndHour = hour
      this.updateReservationTimesFromCells()
    },
    updateTimeCellSelection(date, hour) {
      if (this.isSelecting) {
        // 자원이 선택된 상태에서만 예약된 시간대 선택을 제한
        if (this.reservationForm.resourceId && this.isTimeCellReserved(date, hour)) {
          this.endTimeCellSelection()
          this.error('예약된 시간대는 선택할 수 없습니다.')
          return
        }
        
        this.selectionEndDate = date
        this.selectionEndHour = hour
        this.updateReservationTimesFromCells()
      }
    },
    endTimeCellSelection() {
      this.isSelecting = false
    },
    updateReservationTimesFromCells() {
      if (this.selectionStartDate && this.selectionStartHour !== null && 
          this.selectionEndDate && this.selectionEndHour !== null) {
        
        // 같은 날짜인 경우에만 시간 범위 설정
        if (this.selectionStartDate === this.selectionEndDate) {
          const startHour = Math.min(this.selectionStartHour, this.selectionEndHour)
          const endHour = Math.max(this.selectionStartHour, this.selectionEndHour)
          
          // 자원이 선택된 상태에서만 예약된 시간대 검사
          if (this.reservationForm.resourceId) {
            let hasReservedTime = false
            for (let hour = startHour; hour <= endHour; hour++) {
              if (this.isTimeCellReserved(this.selectionStartDate, hour)) {
                hasReservedTime = true
                break
              }
            }
            
            if (hasReservedTime) {
              this.endTimeCellSelection()
              this.error('선택 범위에 예약된 시간대가 포함되어 있습니다.')
              return
            }
          }
          
          this.reservationForm.date = this.selectionStartDate
          this.reservationForm.startTime = `${startHour.toString().padStart(2, '0')}:00`
          this.reservationForm.endTime = `${(endHour + 1).toString().padStart(2, '0')}:00`
        }
      }
    },
    isTimeCellSelected(date, hour) {
      if (!this.reservationForm.startTime || !this.reservationForm.endTime || 
          !this.reservationForm.date || this.reservationForm.date !== date) {
        return false
      }
      
      const startHour = parseInt(this.reservationForm.startTime.split(':')[0])
      const endHour = parseInt(this.reservationForm.endTime.split(':')[0])
      
      return hour >= startHour && hour < endHour
    },
    isTimeCellReserved(date, hour) {
      // 자원이 선택되지 않았으면 모든 자원의 예약을 확인
      if (!this.reservationForm.resourceId) {
        // 모든 자원의 예약 확인 (수정 중인 예약은 제외)
        return this.allReservations.some(reservation => {
          if (reservation.date !== date || reservation.status === 'CANCELLED') {
            return false
          }
          
          // 수정 모드에서는 현재 수정 중인 예약을 제외
          if (this.isEditingMode && reservation.id === this.editingReservationId) {
            return false
          }
          
          const startHour = parseInt(reservation.startTime.split(':')[0])
          const endHour = parseInt(reservation.endTime.split(':')[0])
          
          return hour >= startHour && hour < endHour
        })
      }
      
      // 특정 자원이 선택된 경우 해당 자원의 예약만 확인
      return this.allReservations.some(reservation => {
        if (reservation.reservationTypeId !== this.reservationForm.resourceId || 
            reservation.date !== date ||
            reservation.status === 'CANCELLED') {
          return false
        }
        
        // 수정 모드에서는 현재 수정 중인 예약을 제외
        if (this.isEditingMode && reservation.id === this.editingReservationId) {
          return false
        }
        
        const startHour = parseInt(reservation.startTime.split(':')[0])
        const endHour = parseInt(reservation.endTime.split(':')[0])
        
        return hour >= startHour && hour < endHour
      })
    },
    
    getReservationInfoForTimeCell(date, hour) {
      // 특정 시간대의 예약 정보 반환
      if (!this.reservationForm.resourceId) {
        // 자원이 선택되지 않았으면 모든 자원의 예약 확인 (수정 중인 예약은 제외)
        return this.allReservations.filter(reservation => {
          if (reservation.date !== date || reservation.status === 'CANCELLED') {
            return false
          }
          
          // 수정 모드에서는 현재 수정 중인 예약을 제외
          if (this.isEditingMode && reservation.id === this.editingReservationId) {
            return false
          }
          
          const startHour = parseInt(reservation.startTime.split(':')[0])
          const endHour = parseInt(reservation.endTime.split(':')[0])
          
          return hour >= startHour && hour < endHour
        })
      }
      
      // 특정 자원이 선택된 경우 (수정 중인 예약은 제외)
      const reservation = this.allReservations.find(reservation => {
        if (reservation.reservationTypeId !== this.reservationForm.resourceId || 
            reservation.date !== date ||
            reservation.status === 'CANCELLED') {
          return false
        }
        
        // 수정 모드에서는 현재 수정 중인 예약을 제외
        if (this.isEditingMode && reservation.id === this.editingReservationId) {
          return false
        }
        
        const startHour = parseInt(reservation.startTime.split(':')[0])
        const endHour = parseInt(reservation.endTime.split(':')[0])
        
        return hour >= startHour && hour < endHour
      })
      
      return reservation
    },
    
    getReservationTooltip(date, hour) {
      // 예약된 시간대에 대한 툴팁 정보 반환
      const reservationInfo = this.getReservationInfoForTimeCell(date, hour)
      
      if (!reservationInfo) return ''
      
      // 자원이 선택되지 않았을 때 (배열 반환)
      if (Array.isArray(reservationInfo)) {
        if (reservationInfo.length === 0) return ''
        
        // 여러 자원이 예약된 경우 그룹화하여 표시
        const groupedReservations = {}
        reservationInfo.forEach(reservation => {
          const resource = this.resources.find(r => r.id === reservation.reservationTypeId)
          const resourceName = resource ? resource.name : '알 수 없는 자원'
          const resourceType = resource ? resource.type : 'other'
          
          if (!groupedReservations[resourceName]) {
            groupedReservations[resourceName] = {
              type: resourceType,
              reservations: []
            }
          }
          groupedReservations[resourceName].reservations.push(reservation)
        })
        
        // 툴팁 내용 구성
        const tooltipLines = []
        Object.keys(groupedReservations).forEach(resourceName => {
          const group = groupedReservations[resourceName]
          const timeRanges = group.reservations.map(r => `${r.startTime}-${r.endTime}`).join(', ')
          const statusLabel = this.getReservationStatusLabel(group.reservations[0].status)
          tooltipLines.push(`${resourceName}: ${timeRanges} (${statusLabel})`)
        })
        
        return tooltipLines.join('\n')
      }
      
      // 특정 자원이 선택된 경우 (단일 객체 반환)
      if (reservationInfo) {
        const statusLabel = this.getReservationStatusLabel(reservationInfo.status)
        return `예약됨 (${reservationInfo.startTime} - ${reservationInfo.endTime}, 상태: ${statusLabel})`
      }
      
      return ''
    },
    
    getTimeCellClass(date, hour) {
      // 예약된 시간대에 자원별 클래스 추가
      if (!this.isTimeCellReserved(date, hour)) return ''
      
      const reservationInfo = this.getReservationInfoForTimeCell(date, hour)
      
      // 자원이 선택되지 않았을 때 (배열 반환)
      if (Array.isArray(reservationInfo) && reservationInfo.length > 0) {
        // 여러 자원이 예약된 경우
        if (reservationInfo.length > 1) {
          return 'reserved-multiple'
        }
        
        // 단일 자원 예약
        const reservation = reservationInfo[0]
        const resource = this.resources.find(r => r.id === reservation.reservationTypeId)
        if (resource) {
          return `reserved-${resource.type}`
        }
      }
      
      // 특정 자원이 선택된 경우 (단일 객체 반환)
      if (reservationInfo && !Array.isArray(reservationInfo)) {
        const resource = this.resources.find(r => r.id === reservationInfo.reservationTypeId)
        if (resource) {
          return `reserved-${resource.type}`
        }
      }
      
      return 'reserved'
    },
    
    
    isTimeCellInSelection(date, hour) {
      if (!this.isSelecting || !this.selectionStartDate || this.selectionStartHour === null ||
          !this.selectionEndDate || this.selectionEndHour === null) {
        return false
      }
      
      // 같은 날짜에서만 선택 표시
      if (this.selectionStartDate === this.selectionEndDate && date === this.selectionStartDate) {
        const startHour = Math.min(this.selectionStartHour, this.selectionEndHour)
        const endHour = Math.max(this.selectionStartHour, this.selectionEndHour)
        
        return hour >= startHour && hour <= endHour
      }
      
      return false
    },
    getMaxCapacity() {
      const resource = this.resources.find(r => r.id === this.reservationForm.resourceId)
      return resource ? resource.capacity : 1
    },
    handleReservationClose(done) {
      this.showReservation = false
      this.isEditingMode = false
      this.resetReservationForm()
      if (done) done()
    },
    openReservationModal() {
      this.isEditingMode = false
      this.reservationForm.resourceId = '' // 자원을 선택하지 않은 상태로 시작
      this.reservationForm.date = this.formatDate(new Date()) // 오늘 날짜로 기본 설정
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.reservationForm.purpose = ''
      this.reservationForm.attendees = 1
      this.reservationForm.notes = ''
      this.reservationForm.sharedUsers = []
      this.reservationForm.sharedUserInput = ''
      this.reservationForm.isRecurring = false
      this.reservationForm.recurrenceType = 'weekly'
      this.reservationForm.recurrenceInterval = 1
      this.reservationForm.recurrenceEndDate = ''
      this.reservationForm.recurrenceDays = []
      this.showReservation = true
      this.generateTimeSlots()
      this.generateWeekDates()
      
      // 자원이 선택되지 않은 상태에서도 캘린더를 표시하기 위해 선택 상태 초기화
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
    },
    reserveResource(resource) {
      this.isEditingMode = false
      this.reservationForm.resourceId = resource.id
      this.reservationForm.date = this.formatDate(new Date()) // 오늘 날짜로 기본 설정
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.reservationForm.purpose = ''
      this.reservationForm.attendees = 1
      this.reservationForm.notes = ''
      this.reservationForm.sharedUsers = []
      this.reservationForm.sharedUserInput = ''
      this.reservationForm.isRecurring = false
      this.reservationForm.recurrenceType = 'weekly'
      this.reservationForm.recurrenceInterval = 1
      this.reservationForm.recurrenceEndDate = ''
      this.reservationForm.recurrenceDays = []
      this.showReservation = true
      this.generateTimeSlots()
      this.generateWeekDates()
    },
    resetReservationForm() {
      this.reservationForm = {
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        notes: '',
        sharedUsers: [],
        sharedUserInput: '',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        recurrenceDays: []
      }
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
    },
    viewResourceDetails(resource) {
      this.info(`${resource.name} 상세 정보`)
    },
    async submitReservation() {
      // 자원이 선택되지 않은 경우 에러 메시지
      if (!this.reservationForm.resourceId) {
        this.error('예약할 자원을 선택해주세요.')
        return
      }
      
      // 예약 시간 검증
      if (!this.validateReservationTime()) {
        this.error('예약 시간을 확인해주세요.')
        return
      }

      // 반복 예약 검증
      if (this.reservationForm.isRecurring) {
        if (this.reservationForm.recurrenceType === 'weekly' && this.reservationForm.recurrenceDays.length === 0) {
          this.error('매주 반복시 반복 요일을 선택해주세요.')
          return
        }
        if (!this.reservationForm.recurrenceEndDate) {
          this.error('반복 종료일을 설정해주세요.')
          return
        }
      }

      // 반복 예약 생성
      const reservations = this.generateRecurringReservations()
      
      // 중복 예약 방지 검증 (각 예약에 대해)
      for (const reservation of reservations) {
        if (this.checkDuplicateReservationForDate(reservation)) {
          this.error(`${reservation.date} ${reservation.startTime} 시간대에 이미 예약이 있습니다.`)
          return
        }
      }

      try {
        // 백엔드로 예약 데이터 전송
        for (const reservation of reservations) {
          await this.submitReservationToServer(reservation, this.isEditingMode ? this.editingReservationId : null)
        }
        
        // 승인이 필요한 자원인지 확인
        const resource = this.resources.find(r => r.id == this.reservationForm.resourceId)
        if (resource && resource.requiresApproval) {
          this.info('승인이 필요한 자원입니다. 결재함으로 이동합니다.')
          this.$router.push('/approval')
        } else {
          if (this.isEditingMode) {
            this.success('예약이 수정되었습니다.')
          } else if (this.reservationForm.isRecurring) {
            this.success(`${reservations.length}개의 정기 예약이 완료되었습니다.`)
          } else {
            this.success('예약이 완료되었습니다.')
          }
        }
        
        // 예약 목록 새로고침
        await this.loadMyReservations()
        await this.loadAllReservations()
        
        // 모달 닫기 및 상태 초기화
        this.showReservation = false
        this.isEditingMode = false
        this.editingReservationId = null
        
      } catch (error) {
        if (error.response && error.response.status === 409) {
          this.error('해당 시간대에 이미 예약이 있습니다.')
        } else {
          this.error('예약 생성 중 오류가 발생했습니다.')
        }
        return
      }
      
      this.showReservation = false
      this.resetReservationForm()
    },
    checkDuplicateReservation() {
      return this.checkDuplicateReservationForDate(this.reservationForm)
    },
    checkDuplicateReservationForDate(reservation) {
      const { resourceId, date, startTime, endTime } = reservation
      
      // 자원이 선택되지 않았으면 모든 자원의 예약과 충돌 검사
      if (!resourceId) {
        const existingReservations = this.allReservations.filter(existingReservation => 
          existingReservation.date === date &&
          existingReservation.status !== 'CANCELLED' && // 취소된 예약은 제외
          // 수정 모드에서는 현재 수정 중인 예약을 제외
          !(this.isEditingMode && existingReservation.id === this.editingReservationId) &&
          ((existingReservation.startTime <= startTime && existingReservation.endTime > startTime) ||
           (existingReservation.startTime < endTime && existingReservation.endTime >= endTime) ||
           (existingReservation.startTime >= startTime && existingReservation.endTime <= endTime))
        )
        return existingReservations.length > 0
      }
      
      // 특정 자원이 선택된 경우 해당 자원의 예약만 확인
      const existingReservations = this.allReservations.filter(existingReservation => 
        existingReservation.reservationTypeId === resourceId &&
        existingReservation.date === date &&
        existingReservation.status !== 'CANCELLED' && // 취소된 예약은 제외
        // 수정 모드에서는 현재 수정 중인 예약을 제외
        !(this.isEditingMode && existingReservation.id === this.editingReservationId) &&
        ((existingReservation.startTime <= startTime && existingReservation.endTime > startTime) ||
         (existingReservation.startTime < endTime && existingReservation.endTime >= endTime) ||
         (existingReservation.startTime >= startTime && existingReservation.endTime <= endTime))
      )
      
      return existingReservations.length > 0
    },
    
    getReservationsForResourceAndDate(resourceId, date) {
      // 특정 자원의 특정 날짜에 대한 예약 목록 반환
      return this.allReservations.filter(reservation => 
        reservation.reservationTypeId === resourceId &&
        reservation.date === date &&
        reservation.status !== 'CANCELLED'
      )
    },
    
    isTimeSlotReserved(resourceId, date, timeSlot) {
      // 특정 시간대가 예약되어 있는지 확인
      const reservations = this.getReservationsForResourceAndDate(resourceId, date)
      return reservations.some(reservation => {
        const startTime = reservation.startTime
        const endTime = reservation.endTime
        return timeSlot >= startTime && timeSlot < endTime
      })
    },
    validateReservationTime() {
      const { startTime, endTime, resourceId } = this.reservationForm
      
      if (!startTime || !endTime) {
        return false
      }

      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      
      if (start >= end) {
        return false
      }

      // 자원별 최대 예약 시간 검증
      const resource = this.resources.find(r => r.id == resourceId)
      if (resource && resource.maxHours) {
        const duration = (end - start) / (1000 * 60 * 60) // 시간 단위
        if (duration > resource.maxHours) {
          this.error(`최대 예약 시간은 ${resource.maxHours}시간입니다.`)
          return false
        }
      }

      // 예약된 시간대와의 충돌 검사
      if (this.checkDuplicateReservationForDate(this.reservationForm)) {
        this.error('선택한 시간대에 이미 예약이 있습니다.')
        return false
      }

      return true
    },
    getResourceName(resourceId) {
      const resource = this.resources.find(r => r.id == resourceId)
      return resource ? resource.name : ''
    },
    editReservation(reservation) {
      // 예약 수정 모달 표시
      this.isEditingMode = true
      this.editingReservationId = reservation.id // 수정할 예약 ID 저장
      this.reservationForm = {
        resourceId: this.getResourceIdByName(reservation.resourceName),
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        purpose: reservation.purpose === '사용 목적 없음' ? '' : reservation.purpose,
        attendees: reservation.attendees,
        notes: '',
        sharedUsers: [],
        sharedUserInput: '',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        recurrenceDays: []
      }
      this.showReservation = true
      this.generateTimeSlots()
      this.generateWeekDates()
      // 선택 상태 초기화
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
    },
    getResourceIdByName(resourceName) {
      const resource = this.resources.find(r => r.name === resourceName)
      return resource ? resource.id : null
    },
    cancelReservation() {
      this.$confirm('정말로 예약을 취소하시겠습니까?', '확인', {
        confirmButtonText: '취소',
        cancelButtonText: '돌아가기',
        type: 'warning'
      }).then(() => {
        this.success('예약이 취소되었습니다.')
      })
    },
    showStatisticsModal() {
      this.showStatistics = true
      this.$nextTick(() => {
        // DOM이 완전히 렌더링된 후 차트 생성
        setTimeout(() => {
          this.createMonthlyChart()
          this.createResourceChart()
        }, 100)
      })
    },
    createMonthlyChart() {
      const ctx = this.$refs.monthlyChart
      if (!ctx || !ctx.getContext) {
        console.warn('Monthly chart canvas not available')
        return
      }
      
      // 기존 차트가 있다면 파괴
      if (this.monthlyChartInstance) {
        this.monthlyChartInstance.destroy()
        this.monthlyChartInstance = null
      }
      
      try {
        this.monthlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: this.monthlyData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '월별 예약 현황',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '예약 건수'
              }
            },
            x: {
              title: {
                display: true,
                text: '월'
              }
            }
          }
        }
      })
      } catch (error) {
        console.error('Error creating monthly chart:', error)
        this.monthlyChartInstance = null
      }
    },
    createResourceChart() {
      const ctx = this.$refs.resourceChart
      if (!ctx || !ctx.getContext) {
        console.warn('Resource chart canvas not available')
        return
      }
      
      // 기존 차트가 있다면 파괴
      if (this.resourceChartInstance) {
        this.resourceChartInstance.destroy()
        this.resourceChartInstance = null
      }
      
      try {
        this.resourceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: this.resourceData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '자원별 이용률',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'right'
            }
          }
        }
      })
      } catch (error) {
        console.error('Error creating resource chart:', error)
        this.resourceChartInstance = null
      }
    },
    completeUsage(reservation) {
      this.usageCompletionForm = {
        resourceName: reservation.resourceName,
        date: reservation.date,
        timeRange: `${reservation.startTime} - ${reservation.endTime}`,
        fuelCost: 0,
        distance: 0,
        drivingRecord: '',
        condition: '',
        notes: ''
      }
      this.showUsageCompletion = true
    },
    submitUsageCompletion() {
      // 이용 완료 처리
      const index = this.myReservations.findIndex(r => r.id === this.usageCompletionForm.resourceName)
      if (index > -1) {
        this.myReservations[index].status = '완료됨'
      }
      
      this.success('이용 완료가 처리되었습니다.')
      this.showUsageCompletion = false
      this.resetUsageCompletionForm()
    },
    resetUsageCompletionForm() {
      this.usageCompletionForm = {
        resourceName: '',
        date: '',
        timeRange: '',
        fuelCost: 0,
        distance: 0,
        drivingRecord: '',
        condition: '',
        notes: ''
      }
    },
    addSharedUser() {
      if (this.reservationForm.sharedUserInput.trim()) {
        const user = this.reservationForm.sharedUserInput.trim()
        this.reservationForm.sharedUsers.push(user)
        this.reservationForm.sharedUserInput = ''
      }
    },
    removeSharedUser(index) {
      this.reservationForm.sharedUsers.splice(index, 1)
    },

    // Backspace 키 처리
    handleBackspace() {
      if (this.reservationForm.sharedUserInput === '' && (this.reservationForm.sharedUsers || []).length > 0) {
        this.removeSharedUser((this.reservationForm.sharedUsers || []).length - 1)
      }
    },
    
    // 반복 설정 관련 메서드들
    onRecurrenceToggle() {
      if (this.reservationForm.isRecurring) {
        // 반복 설정이 활성화될 때 기본값 설정
        this.reservationForm.recurrenceType = 'weekly'
        this.reservationForm.recurrenceInterval = 1
        this.reservationForm.recurrenceDays = []
        this.reservationForm.recurrenceEndDate = ''
      }
    },
    getRecurrenceIntervalText() {
      const typeMap = {
        'daily': '일마다',
        'weekly': '주마다',
        'monthly': '개월마다'
      }
      return typeMap[this.reservationForm.recurrenceType] || ''
    },
    generateRecurringReservations() {
      if (!this.reservationForm.isRecurring) {
        return [this.createReservationData()]
      }
      
      const reservations = []
      const startDate = new Date(this.reservationForm.date)
      const endDate = this.reservationForm.recurrenceEndDate ? new Date(this.reservationForm.recurrenceEndDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 기본 3개월
      
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        if (this.shouldCreateReservationOnDate(currentDate)) {
          reservations.push(this.createReservationData(currentDate))
        }
        currentDate = this.getNextRecurrenceDate(currentDate)
      }
      
      return reservations
    },
    shouldCreateReservationOnDate(date) {
      if (this.reservationForm.recurrenceType === 'daily') {
        return true
      } else if (this.reservationForm.recurrenceType === 'weekly') {
        if (this.reservationForm.recurrenceDays.length === 0) {
          // 요일이 선택되지 않았으면 시작일의 요일로 설정
          const startDay = new Date(this.reservationForm.date).getDay()
          return date.getDay() === startDay
        }
        return this.reservationForm.recurrenceDays.includes(date.getDay().toString())
      } else if (this.reservationForm.recurrenceType === 'monthly') {
        return date.getDate() === new Date(this.reservationForm.date).getDate()
      }
      return false
    },
    getNextRecurrenceDate(currentDate) {
      const nextDate = new Date(currentDate)
      
      if (this.reservationForm.recurrenceType === 'daily') {
        nextDate.setDate(currentDate.getDate() + this.reservationForm.recurrenceInterval)
      } else if (this.reservationForm.recurrenceType === 'weekly') {
        nextDate.setDate(currentDate.getDate() + (7 * this.reservationForm.recurrenceInterval))
      } else if (this.reservationForm.recurrenceType === 'monthly') {
        nextDate.setMonth(currentDate.getMonth() + this.reservationForm.recurrenceInterval)
      }
      
      return nextDate
    },
    createReservationData(date = null) {
      const reservationDate = date ? this.formatDate(date) : this.reservationForm.date
      return {
        resourceId: this.reservationForm.resourceId,
        date: reservationDate,
        startTime: this.reservationForm.startTime,
        endTime: this.reservationForm.endTime,
        purpose: this.reservationForm.purpose,
        attendees: this.reservationForm.attendees,
        notes: this.reservationForm.notes,
        sharedUsers: [...this.reservationForm.sharedUsers],
        isRecurring: this.reservationForm.isRecurring,
        recurrenceType: this.reservationForm.recurrenceType,
        recurrenceInterval: this.reservationForm.recurrenceInterval,
        recurrenceEndDate: this.reservationForm.recurrenceEndDate,
        recurrenceDays: [...this.reservationForm.recurrenceDays]
      }
    },
  }
}
</script>

<style scoped>
.resource {
  max-width: 1200px;
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

.resource-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.resource-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: #4f46e5;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: #909399;
}

.resource-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.resource-list {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-right: 20px;
}

.resource-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.resource-location {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  min-width: 120px;
  align-self: flex-start;
  margin-top: 16px;
  justify-content: flex-end;
}

.location-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}


.resource-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.resource-details > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
}

.resource-status.available {
  background: #f0f9ff;
  color: #0369a1;
}

.resource-status.occupied {
  background: #faeceb;
  color: #dc381f;
}

.resource-status.maintenance {
  background: #f3f4f6;
  color: #6b7280;
}

.resource-description {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.resource-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  min-width: 80px;
  align-items: stretch;
  justify-content: center;
}

.resource-actions .el-button {
  width: 100%;
  min-width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 12px;
}

.resource-actions .el-button .el-icon {
  margin-right: 4px;
}

.my-reservations {
  padding: 20px 0;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reservation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.reservation-info {
  flex: 1;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reservation-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.reservation-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reservation-date-large {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 6px;
}

.reservation-details {
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* reservation-details 내부 폼 아이템 정렬 */
.reservation-details :deep(.el-form-item) {
  align-items: flex-start;
}

.reservation-details :deep(.el-form-item__label) {
  align-self: flex-start;
}

.reservation-details :deep(.el-form-item__content) {
  align-self: flex-start;
}

.reservation-details > div {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 5px;
}

.reservation-details > div:last-child {
  margin-bottom: 0;
}

.reservation-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
}

.reservation-actions .el-button {
  width: 120px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  margin: 0;
}

.reservation-actions .el-button .el-icon {
  margin-right: 6px;
}

.statistics-content {
  padding: 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.stat-card h4 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.chart-section {
  margin-top: 30px;
}

.chart-section h4 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

/* 예약 모달 스타일 */
.reservation-modal {
  padding: 20px 0;
}

.reservation-form-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.resource-selection,
.date-selection {
  flex: 1;
}

.date-selection :deep(.el-date-picker) {
  width: 100%;
}

.date-selection :deep(.el-input) {
  width: 100%;
}

.date-selection :deep(.el-input__wrapper) {
  width: 100%;
}

/* 예약 캘린더 스타일 */
.reservation-calendar {
  margin-bottom: 24px;
}

.reservation-calendar h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.calendar-container {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.time-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.date-label {
  width: 100px;
  padding: 12px;
  font-weight: 600;
  color: #2c3e50;
  border-right: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-labels {
  display: flex;
  flex: 1;
}

.time-header-cell {
  flex: 1;
  padding: 8px 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  border-right: 1px solid #e9ecef;
}

.time-header-cell:last-child {
  border-right: none;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
}

.date-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
}

.date-row:last-child {
  border-bottom: none;
}

.date-cell {
  width: 100px;
  padding: 12px 8px;
  border-right: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.day-text {
  font-size: 12px;
  color: #606266;
}

.time-row {
  display: flex;
  flex: 1;
}

.time-cell {
  flex: 1;
  height: 40px;
  border-right: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  position: relative;
}

.time-cell:last-child {
  border-right: none;
}

.time-cell:hover {
  background: #e3f2fd;
}

.time-cell.selected {
  background: #4f46e5;
}


/* 자원별 호버 색상 */
.time-cell.reserved-meeting:hover {
  background: linear-gradient(135deg, #4fc3f7 0%, #81d4fa 100%);
  box-shadow: 0 4px 8px rgba(79, 195, 247, 0.4);
}

.time-cell.reserved-vehicle:hover {
  background: linear-gradient(135deg, #66bb6a 0%, #a5d6a7 100%);
  box-shadow: 0 4px 8px rgba(102, 187, 106, 0.4);
}

.time-cell.reserved-equipment:hover {
  background: linear-gradient(135deg, #ffb74d 0%, #ffcc80 100%);
  box-shadow: 0 4px 8px rgba(255, 183, 77, 0.4);
}

.time-cell.reserved-other:hover {
  background: linear-gradient(135deg, #ba68c8 0%, #ce93d8 100%);
  box-shadow: 0 4px 8px rgba(186, 104, 200, 0.4);
}

.time-cell.reserved-multiple:hover {
  background: linear-gradient(45deg, #ff6b6b 25%, #4fc3f7 25%, #4fc3f7 50%, #66bb6a 50%, #66bb6a 75%, #ffb74d 75%);
  background-size: 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 기본 예약된 시간대 스타일 - 모든 예약된 시간은 #FFEBEE로 통일 */
.time-cell.reserved {
  background: #ffebee !important;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.time-cell.reserved:hover {
  background: #ffcdd2 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 자원별 예약된 시간대도 모두 #FFEBEE로 통일 */
.time-cell.reserved-meeting {
  background: #ffebee !important;
}

.time-cell.reserved-vehicle {
  background: #ffebee !important;
}

.time-cell.reserved-equipment {
  background: #ffebee !important;
}

.time-cell.reserved-other {
  background: #ffebee !important;
}

.time-cell.reserved-multiple {
  background: #ffebee !important;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  ) !important;
}

.time-cell.selecting {
  background: #e3f2fd;
}


.selection-info {
  padding: 16px;
  background: #f0f9ff;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  font-size: 14px;
  font-weight: 500;
  color: #0c4a6e;
}

.selection-hint {
  color: #64748b;
  font-style: italic;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.available {
  background: white;
  border: 1px solid #e9ecef;
}

.legend-color.reserved {
  background: #ffebee;
}

.legend-color.selected {
  background: #4f46e5;
}



.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.tag-input-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 1px 11px;
  min-height: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.tag-input-container:focus-within {
  border-color: #409eff;
}

.tag-input-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.tag-input-tags:empty {
  display: none;
}

.tag-input-field {
  border: none;
  padding: 0;
  flex: 1;
  width: 100%;
  min-width: 0;
}

.tag-input-field :deep(.el-input__wrapper) {
  box-shadow: none;
  border: none;
  padding: 0;
}

.tag-input-field :deep(.el-input__inner) {
  font-size: 14px;
}

.tag-input-field :deep(.el-input__inner::placeholder) {
  font-size: 14px;
}

/* 반복 설정 스타일 */
.recurrence-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.recurrence-container {
  width: 100%;
}

.recurrence-options {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.recurrence-type-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.recurrence-days {
  margin-bottom: 16px;
}

.recurrence-days .recurrence-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.recurrence-end {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recurrence-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.recurrence-options :deep(.el-checkbox-group) {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.recurrence-options :deep(.el-checkbox) {
  margin-right: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .reservation-form-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .time-slots {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .time-slot {
    height: 36px;
  }
  
  .time-label {
    font-size: 11px;
  }
  
  .recurrence-type-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .recurrence-end {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .time-slots {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .time-slot {
    height: 32px;
  }
}
</style>
