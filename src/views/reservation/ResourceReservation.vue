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
      title="예약하기"
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
                  <div 
                    v-for="hour in timeSlots" 
                    :key="`${date.date}-${hour.value}`"
                    class="time-cell"
                    :class="{
                      'selected': isTimeCellSelected(date.date, hour.value),
                      'reserved': isTimeCellReserved(date.date, hour.value),
                      'selecting': isTimeCellInSelection(date.date, hour.value)
                    }"
                    @mousedown="startTimeCellSelection(date.date, hour.value)"
                    @mouseenter="updateTimeCellSelection(date.date, hour.value)"
                    @mouseup="endTimeCellSelection"
                  >
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 선택 정보 -->
            <div class="selection-info">
              <div class="selected-info">
                <span v-if="reservationForm.startTime && reservationForm.endTime && reservationForm.date">
                  선택된 예약: {{ reservationForm.date }} {{ reservationForm.startTime }} - {{ reservationForm.endTime }}
                </span>
                <span v-else-if="!reservationForm.resourceId" class="selection-hint">
                  먼저 자원을 선택하면 예약 현황을 확인할 수 있습니다
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
            <el-form-item label="사용 목적">
              <el-input
                v-model="reservationForm.purpose"
                placeholder="사용 목적을 입력하세요"
              />
            </el-form-item>
            <el-form-item label="참석자 수">
              <el-input-number
                v-model="reservationForm.attendees"
                :min="1"
                :max="getMaxCapacity()"
                placeholder="참석자 수"
              />
            </el-form-item>
            <el-form-item label="비고">
              <el-input
                v-model="reservationForm.notes"
                type="textarea"
                placeholder="추가 사항을 입력하세요"
                :rows="2"
              />
            </el-form-item>
            <el-form-item label="공동 사용자">
              <el-input
                v-model="reservationForm.sharedUsers"
                placeholder="공동 사용자 이름을 입력하세요"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="showReservation = false">취소</el-button>
        <el-button type="primary" @click="submitReservation" :disabled="!canSubmitReservation">예약</el-button>
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
                    {{ reservation.status }}
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
        attendees: 1,
        notes: '',
        sharedUsers: ''
      },
      // 시간대 선택 관련
      timeSlots: [],
      weekDates: [],
      isSelecting: false,
      selectionStartDate: null,
      selectionStartHour: null,
      selectionEndDate: null,
      selectionEndHour: null,
      // 예약 데이터 (실제로는 서버에서 가져와야 함)
      reservations: [
        // 대회의실 (resourceId: 1) 예약들
        {
          id: 1,
          resourceId: 1,
          date: '2024-01-20',
          startTime: '09:00',
          endTime: '11:00',
          purpose: '팀 미팅',
          attendees: 5,
          userId: 'user1'
        },
        {
          id: 2,
          resourceId: 1,
          date: '2024-01-20',
          startTime: '14:00',
          endTime: '16:00',
          purpose: '프레젠테이션',
          attendees: 8,
          userId: 'user2'
        },
        {
          id: 3,
          resourceId: 1,
          date: '2024-01-21',
          startTime: '10:00',
          endTime: '12:00',
          purpose: '고객 미팅',
          attendees: 12,
          userId: 'user3'
        },
        {
          id: 4,
          resourceId: 1,
          date: '2024-01-21',
          startTime: '15:00',
          endTime: '17:00',
          purpose: '월간 보고서 검토',
          attendees: 6,
          userId: 'user4'
        },
        {
          id: 5,
          resourceId: 1,
          date: '2024-01-22',
          startTime: '09:00',
          endTime: '10:00',
          purpose: '일일 스탠드업',
          attendees: 15,
          userId: 'user5'
        },
        {
          id: 6,
          resourceId: 1,
          date: '2024-01-22',
          startTime: '11:00',
          endTime: '13:00',
          purpose: '신제품 기획 회의',
          attendees: 8,
          userId: 'user6'
        },
        
        // 소회의실 A (resourceId: 2) 예약들
        {
          id: 7,
          resourceId: 2,
          date: '2024-01-20',
          startTime: '10:00',
          endTime: '12:00',
          purpose: '개발팀 미팅',
          attendees: 4,
          userId: 'user7'
        },
        {
          id: 8,
          resourceId: 2,
          date: '2024-01-20',
          startTime: '16:00',
          endTime: '18:00',
          purpose: '코드 리뷰',
          attendees: 3,
          userId: 'user8'
        },
        {
          id: 9,
          resourceId: 2,
          date: '2024-01-21',
          startTime: '09:00',
          endTime: '11:00',
          purpose: '디자인 검토',
          attendees: 5,
          userId: 'user9'
        },
        {
          id: 10,
          resourceId: 2,
          date: '2024-01-22',
          startTime: '14:00',
          endTime: '16:00',
          purpose: '마케팅 전략 회의',
          attendees: 6,
          userId: 'user10'
        },
        
        // 소회의실 B (resourceId: 3) 예약들
        {
          id: 11,
          resourceId: 3,
          date: '2024-01-20',
          startTime: '13:00',
          endTime: '15:00',
          purpose: 'HR 미팅',
          attendees: 4,
          userId: 'user11'
        },
        {
          id: 12,
          resourceId: 3,
          date: '2024-01-21',
          startTime: '10:00',
          endTime: '12:00',
          purpose: '재무 보고서 검토',
          attendees: 3,
          userId: 'user12'
        },
        {
          id: 13,
          resourceId: 3,
          date: '2024-01-22',
          startTime: '09:00',
          endTime: '10:30',
          purpose: '프로젝트 킥오프',
          attendees: 5,
          userId: 'user13'
        },
        
        // 법인 차량 1 (resourceId: 4) 예약들
        {
          id: 14,
          resourceId: 4,
          date: '2024-01-20',
          startTime: '09:00',
          endTime: '18:00',
          purpose: '고객사 방문',
          attendees: 2,
          userId: 'user14'
        },
        {
          id: 15,
          resourceId: 4,
          date: '2024-01-21',
          startTime: '10:00',
          endTime: '16:00',
          purpose: '출장',
          attendees: 3,
          userId: 'user15'
        },
        {
          id: 16,
          resourceId: 4,
          date: '2024-01-22',
          startTime: '14:00',
          endTime: '17:00',
          purpose: '공급업체 미팅',
          attendees: 2,
          userId: 'user16'
        },
        
        // 법인 차량 2 (resourceId: 5) 예약들
        {
          id: 17,
          resourceId: 5,
          date: '2024-01-20',
          startTime: '08:00',
          endTime: '20:00',
          purpose: '단체 출장',
          attendees: 6,
          userId: 'user17'
        },
        {
          id: 18,
          resourceId: 5,
          date: '2024-01-21',
          startTime: '11:00',
          endTime: '15:00',
          purpose: '현장 점검',
          attendees: 4,
          userId: 'user18'
        },
        
        // 오늘 날짜 예약들 (동적으로 생성되는 날짜에 맞춰 추가)
        {
          id: 19,
          resourceId: 1,
          date: this.formatDate(new Date()),
          startTime: '09:00',
          endTime: '10:00',
          purpose: '오늘 일일 미팅',
          attendees: 8,
          userId: 'user19'
        },
        {
          id: 20,
          resourceId: 2,
          date: this.formatDate(new Date()),
          startTime: '14:00',
          endTime: '16:00',
          purpose: '오늘 프로젝트 검토',
          attendees: 5,
          userId: 'user20'
        },
        {
          id: 21,
          resourceId: 4,
          date: this.formatDate(new Date()),
          startTime: '10:00',
          endTime: '17:00',
          purpose: '오늘 고객사 방문',
          attendees: 2,
          userId: 'user21'
        },
        
        // 내일 날짜 예약들
        {
          id: 22,
          resourceId: 1,
          date: this.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
          startTime: '10:00',
          endTime: '12:00',
          purpose: '내일 주간 계획 회의',
          attendees: 10,
          userId: 'user22'
        },
        {
          id: 23,
          resourceId: 3,
          date: this.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
          startTime: '14:00',
          endTime: '16:00',
          purpose: '내일 예산 검토',
          attendees: 4,
          userId: 'user23'
        },
        {
          id: 24,
          resourceId: 5,
          date: this.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
          startTime: '09:00',
          endTime: '18:00',
          purpose: '내일 현장 점검',
          attendees: 5,
          userId: 'user24'
        },
        
        // 모레 날짜 예약들
        {
          id: 25,
          resourceId: 2,
          date: this.formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
          startTime: '09:00',
          endTime: '11:00',
          purpose: '모레 기술 세미나',
          attendees: 6,
          userId: 'user25'
        },
        {
          id: 26,
          resourceId: 4,
          date: this.formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
          startTime: '13:00',
          endTime: '17:00',
          purpose: '모레 협력사 방문',
          attendees: 3,
          userId: 'user26'
        },
        
        // 3일 후 예약들
        {
          id: 27,
          resourceId: 1,
          date: this.formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
          startTime: '15:00',
          endTime: '17:00',
          purpose: '3일 후 전체 회의',
          attendees: 18,
          userId: 'user27'
        },
        {
          id: 28,
          resourceId: 3,
          date: this.formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
          startTime: '10:00',
          endTime: '12:00',
          purpose: '3일 후 인사 평가',
          attendees: 3,
          userId: 'user28'
        },
        
        // 4일 후 예약들
        {
          id: 29,
          resourceId: 2,
          date: this.formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
          startTime: '11:00',
          endTime: '13:00',
          purpose: '4일 후 마케팅 브레인스토밍',
          attendees: 7,
          userId: 'user29'
        },
        {
          id: 30,
          resourceId: 5,
          date: this.formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
          startTime: '08:00',
          endTime: '20:00',
          purpose: '4일 후 장거리 출장',
          attendees: 6,
          userId: 'user30'
        },
        
        // 5일 후 예약들
        {
          id: 31,
          resourceId: 1,
          date: this.formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
          startTime: '09:00',
          endTime: '10:30',
          purpose: '5일 후 주간 리뷰',
          attendees: 12,
          userId: 'user31'
        },
        {
          id: 32,
          resourceId: 4,
          date: this.formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
          startTime: '14:00',
          endTime: '16:00',
          purpose: '5일 후 고객 만족도 조사',
          attendees: 2,
          userId: 'user32'
        },
        
        // 6일 후 예약들
        {
          id: 33,
          resourceId: 3,
          date: this.formatDate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),
          startTime: '10:00',
          endTime: '12:00',
          purpose: '6일 후 팀 빌딩',
          attendees: 5,
          userId: 'user33'
        },
        {
          id: 34,
          resourceId: 2,
          date: this.formatDate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),
          startTime: '15:00',
          endTime: '17:00',
          purpose: '6일 후 프로젝트 마일스톤',
          attendees: 8,
          userId: 'user34'
        }
      ],
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
          status: 'available',
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
          status: 'available',
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
    },
    canSubmitReservation() {
      return this.reservationForm.resourceId && 
             this.reservationForm.date && 
             this.reservationForm.startTime && 
             this.reservationForm.endTime && 
             this.reservationForm.purpose
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
    openReservationModal() {
      this.reservationForm.resourceId = ''
      this.reservationForm.date = ''
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.reservationForm.purpose = ''
      this.reservationForm.attendees = 1
      this.reservationForm.notes = ''
      this.reservationForm.sharedUsers = ''
      this.showReservation = true
      this.generateTimeSlots()
      this.generateWeekDates()
    },
    reserveResource(resource) {
      this.reservationForm.resourceId = resource.id
      this.reservationForm.date = ''
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.reservationForm.purpose = ''
      this.reservationForm.attendees = 1
      this.reservationForm.notes = ''
      this.reservationForm.sharedUsers = ''
      this.showReservation = true
      this.generateTimeSlots()
      this.generateWeekDates()
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
      const today = new Date()
      
      // 오늘부터 7일간의 날짜 생성
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
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
    // 새로운 시간 셀 선택 메서드들
    startTimeCellSelection(date, hour) {
      this.isSelecting = true
      this.selectionStartDate = date
      this.selectionStartHour = hour
      this.selectionEndDate = date
      this.selectionEndHour = hour
      this.updateReservationTimesFromCells()
    },
    updateTimeCellSelection(date, hour) {
      if (this.isSelecting) {
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
      // 자원이 선택되지 않았으면 예약된 시간으로 표시하지 않음
      if (!this.reservationForm.resourceId) return false
      
      return this.reservations.some(reservation => {
        if (reservation.resourceId !== this.reservationForm.resourceId || 
            reservation.date !== date) {
          return false
        }
        
        const startHour = parseInt(reservation.startTime.split(':')[0])
        const endHour = parseInt(reservation.endTime.split(':')[0])
        
        return hour >= startHour && hour < endHour
      })
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
      this.resetReservationForm()
      if (done) done()
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
        sharedUsers: ''
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

.reservation-date-large {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 6px;
}

.reservation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
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

.time-cell.reserved {
  background: #ffebee;
  cursor: not-allowed;
}

.time-cell.reserved:hover {
  background: #ffebee;
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

.reservation-details {
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .reservation-form-header {
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
