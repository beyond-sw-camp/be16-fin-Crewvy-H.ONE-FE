<template>
  <div class="resource">
    <div class="page-header">
      <div class="header-content">
        <h1>예약</h1>
        <p>회의실, 차량 등 공용 자원을 예약하고 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showReservation = true">
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
            <div class="card-value">{{ meetingRooms.length }}개</div>
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
          <div class="card-value">{{ vehicles.length }}대</div>
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
            <el-option label="회의실" value="meeting" />
            <el-option label="차량" value="vehicle" />
            <el-option label="기타" value="other" />
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
              <div class="resource-equipment" v-if="resource.equipment">
                <el-icon><Setting /></el-icon>
                <span>{{ resource.equipment }}</span>
              </div>
              <div class="resource-status" :class="resource.status">
                {{ getStatusText(resource.status) }}
              </div>
            </div>
            <div class="resource-description">{{ resource.description }}</div>
          </div>
          <div class="resource-location">
            <el-tag :type="getResourceType(resource.type)" size="small">
              {{ getResourceTypeName(resource.type) }}
            </el-tag>
            <span class="location-text">{{ resource.location }}</span>
          </div>
          <div class="resource-actions">
            <el-button 
              :type="resource.status === 'occupied' ? 'danger' : 'primary'"
              size="small"
              @click="reserveResource(resource)"
              :disabled="resource.status === 'occupied'"
            >
              <el-icon><Calendar /></el-icon>
              {{ resource.status === 'occupied' ? '이용 중' : '예약' }}
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
      title="예약"
      width="600px"
    >
      <el-form :model="reservationForm" label-width="80px">
        <el-form-item label="자원 선택">
          <el-select v-model="reservationForm.resourceId" placeholder="자원을 선택하세요">
            <el-option
              v-for="resource in availableResources"
              :key="resource.id"
              :label="resource.name"
              :value="resource.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="예약 날짜">
          <el-date-picker
            v-model="reservationForm.date"
            type="date"
            placeholder="날짜 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="시작 시간">
          <el-time-picker
            v-model="reservationForm.startTime"
            placeholder="시작 시간"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="종료 시간">
          <el-time-picker
            v-model="reservationForm.endTime"
            placeholder="종료 시간"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="사용 목적">
          <el-input
            v-model="reservationForm.purpose"
            placeholder="사용 목적을 입력하세요"
          />
        </el-form-item>
        <el-form-item label="참석자">
          <el-input
            v-model="reservationForm.attendees"
            placeholder="참석자 수를 입력하세요"
            type="number"
          />
        </el-form-item>
        <el-form-item label="비고">
          <el-input
            v-model="reservationForm.notes"
            type="textarea"
            placeholder="추가 사항을 입력하세요"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="공동 사용자">
          <el-input
            v-model="reservationForm.sharedUsers"
            placeholder="공동 사용자 이름을 입력하세요"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReservation = false">취소</el-button>
        <el-button type="primary" @click="submitReservation">예약</el-button>
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
                <div class="reservation-meta">
                  <el-tag :type="getReservationStatusType(reservation.status)" size="small">
                    {{ reservation.status }}
                  </el-tag>
                  <span class="reservation-date">{{ reservation.date }}</span>
                </div>
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

export default {
  name: 'ResourcePage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      selectedType: '',
      selectedDate: '',
      showReservation: false,
      showMyReservations: false,
      showStatistics: false,
      showUsageCompletion: false,
      monthlyChartInstance: null,
      resourceChartInstance: null,
      reservationForm: {
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
        notes: '',
        sharedUsers: ''
      },
      todayReservations: 8,
      activeUsers: 15,
      meetingRooms: [
        { id: 1, name: '대회의실', capacity: 20, location: '3층' },
        { id: 2, name: '소회의실 A', capacity: 8, location: '2층' },
        { id: 3, name: '소회의실 B', capacity: 6, location: '2층' }
      ],
      vehicles: [
        { id: 4, name: '법인 차량 1', capacity: 4, location: '지하주차장' },
        { id: 5, name: '법인 차량 2', capacity: 7, location: '지하주차장' }
      ],
      resources: [
        {
          id: 1,
          name: '대회의실',
          type: 'meeting',
          location: '3층',
          capacity: 20,
          equipment: '프로젝터, 화이트보드, 음향시설',
          status: 'available',
          description: '대규모 회의 및 프레젠테이션용 회의실',
          maxHours: 8,
          requiresApproval: false
        },
        {
          id: 2,
          name: '소회의실 A',
          type: 'meeting',
          location: '2층',
          capacity: 8,
          equipment: '프로젝터, 화이트보드',
          status: 'occupied',
          description: '소규모 팀 미팅용 회의실',
          maxHours: 4,
          requiresApproval: false
        },
        {
          id: 3,
          name: '소회의실 B',
          type: 'meeting',
          location: '2층',
          capacity: 6,
          equipment: '화이트보드',
          status: 'available',
          description: '소규모 팀 미팅용 회의실',
          maxHours: 4,
          requiresApproval: false
        },
        {
          id: 4,
          name: '법인 차량 1',
          type: 'vehicle',
          location: '지하주차장',
          capacity: 4,
          equipment: 'GPS, 블랙박스',
          status: 'available',
          description: '출장 및 외부 미팅용 법인 차량',
          maxHours: 12,
          requiresApproval: true
        },
        {
          id: 5,
          name: '법인 차량 2',
          type: 'vehicle',
          location: '지하주차장',
          capacity: 7,
          equipment: 'GPS, 블랙박스',
          status: 'occupied',
          description: '단체 출장용 법인 차량',
          maxHours: 12,
          requiresApproval: true
        }
      ],
      myReservations: [
        {
          id: 1,
          resourceName: '대회의실',
          date: '2024-01-20',
          startTime: '14:00',
          endTime: '16:00',
          purpose: '월간 보고서 검토',
          attendees: 8,
          status: '이용 중'
        },
        {
          id: 2,
          resourceName: '법인 차량 1',
          date: '2024-01-22',
          startTime: '09:00',
          endTime: '18:00',
          purpose: '고객사 방문',
          attendees: 2,
          status: '이용 중'
        }
      ],
      statistics: {
        usageRate: 75,
        peakTime: '14:00-16:00',
        noShow: 3,
        totalReservations: 156
      },
      monthlyData: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        datasets: [{
          label: '예약 건수',
          data: [12, 19, 15, 25, 22, 18, 30, 28, 35, 32, 28, 24],
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      resourceData: {
        labels: ['대회의실', '소회의실 A', '소회의실 B', '법인 차량 1', '법인 차량 2'],
        datasets: [{
          label: '이용률 (%)',
          data: [85, 72, 68, 45, 38],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
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
  beforeUnmount() {
    // 컴포넌트 파괴 시 차트 인스턴스 정리
    if (this.monthlyChartInstance) {
      this.monthlyChartInstance.destroy()
    }
    if (this.resourceChartInstance) {
      this.resourceChartInstance.destroy()
    }
  },
  computed: {
    filteredResources() {
      let filtered = this.resources
      
      if (this.selectedType) {
        filtered = filtered.filter(resource => resource.type === this.selectedType)
      }
      
      return filtered
    },
    availableResources() {
      return this.resources.filter(resource => resource.status === 'available')
    }
  },
  methods: {
    getResourceType(type) {
      const typeMap = {
        'meeting': 'primary',
        'vehicle': 'success',
        'other': 'info'
      }
      return typeMap[type] || 'info'
    },
    getResourceTypeName(type) {
      const typeMap = {
        'meeting': '회의실',
        'vehicle': '차량',
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
        '이용 중': 'danger',
        '취소됨': 'danger',
        '완료됨': 'info'
      }
      return statusMap[status] || 'info'
    },
    reserveResource(resource) {
      this.reservationForm.resourceId = resource.id
      this.showReservation = true
    },
    viewResourceDetails(resource) {
      this.info(`${resource.name} 상세 정보`)
    },
    submitReservation() {
      // 중복 예약 방지 검증
      if (this.checkDuplicateReservation()) {
        this.error('해당 시간대에 이미 예약이 있습니다.')
        return
      }

      // 예약 시간 검증
      if (!this.validateReservationTime()) {
        this.error('예약 시간을 확인해주세요.')
        return
      }

      // 승인이 필요한 자원인지 확인
      const resource = this.resources.find(r => r.id == this.reservationForm.resourceId)
      if (resource && resource.requiresApproval) {
        this.info('승인이 필요한 자원입니다. 결재함으로 이동합니다.')
        this.$router.push('/approval')
      } else {
        this.success('예약이 완료되었습니다.')
      }
      this.showReservation = false
      this.reservationForm = {
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
        notes: ''
      }
    },
    checkDuplicateReservation() {
      const { resourceId, date, startTime, endTime } = this.reservationForm
      
      // 실제 구현에서는 서버에서 검증해야 하지만, 
      // 여기서는 간단한 클라이언트 검증만 수행
      const existingReservations = this.myReservations.filter(reservation => 
        reservation.resourceName === this.getResourceName(resourceId) &&
        reservation.date === date &&
        ((reservation.startTime <= startTime && reservation.endTime > startTime) ||
         (reservation.startTime < endTime && reservation.endTime >= endTime) ||
         (reservation.startTime >= startTime && reservation.endTime <= endTime))
      )
      
      return existingReservations.length > 0
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

      return true
    },
    getResourceName(resourceId) {
      const resource = this.resources.find(r => r.id == resourceId)
      return resource ? resource.name : ''
    },
    editReservation(reservation) {
      // 예약 수정 모달 표시
      this.reservationForm = {
        resourceId: this.getResourceIdByName(reservation.resourceName),
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        purpose: reservation.purpose,
        attendees: reservation.attendees,
        notes: '',
        sharedUsers: ''
      }
      this.showReservation = true
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
        this.createMonthlyChart()
        this.createResourceChart()
      })
    },
    createMonthlyChart() {
      const ctx = this.$refs.monthlyChart
      if (!ctx) return
      
      // 기존 차트가 있다면 파괴
      if (this.monthlyChartInstance) {
        this.monthlyChartInstance.destroy()
      }
      
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
    },
    createResourceChart() {
      const ctx = this.$refs.resourceChart
      if (!ctx) return
      
      // 기존 차트가 있다면 파괴
      if (this.resourceChartInstance) {
        this.resourceChartInstance.destroy()
      }
      
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
    }
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
  align-items: flex-start;
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

.reservation-date {
  font-size: 12px;
  color: #909399;
}

.reservation-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.reservation-details > div {
  display: flex;
  align-items: center;
  gap: 4px;
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
</style>
