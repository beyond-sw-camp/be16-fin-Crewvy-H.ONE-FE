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
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-title">이번 주 예약</div>
          <div class="card-value">{{ thisWeekReservations }}</div>
          <div class="card-subtitle">건</div>
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
      
      <div v-if="loadingResources" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>자원 목록을 불러오는 중...</span>
      </div>
      <div v-else-if="filteredResources.length === 0" class="empty-state">
        <el-icon><OfficeBuilding /></el-icon>
        <span v-if="selectedType">선택한 유형의 자원이 없습니다.</span>
        <span v-else>등록된 자원이 없습니다.</span>
        <p>관리자에게 문의하세요.</p>
      </div>
      <div v-else class="resource-list">
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
          <div class="resource-type-selection">
            <el-form-item label="자원 유형">
              <el-select v-model="reservationForm.resourceType" placeholder="자원 유형을 선택하세요" @change="onResourceTypeChange">
                <el-option label="전체" value="" />
                <el-option 
                  v-for="category in categories" 
                  :key="category.id" 
                  :label="category.name" 
                  :value="category.name" 
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="resource-selection">
            <el-form-item label="자원 선택">
              <el-select v-model="reservationForm.resourceId" placeholder="자원을 선택하세요" @change="onResourceChange">
                <el-option label="전체" value="" />
                <el-option
                  v-for="resource in filteredAvailableResources"
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
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 예약 캘린더 영역 -->
        <div class="reservation-calendar">
          <h4>예약 현황 및 시간 선택</h4>
          <div class="calendar-container">
            <div class="calendar-scroll-wrapper">
              <!-- 시간 헤더 -->
              <div class="time-header">
                <div class="date-label">{{ showResourceView ? '자원' : '날짜' }}</div>
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
              
              <!-- 날짜별 또는 자원별 시간 슬롯 -->
              <div class="calendar-grid">
              <!-- 날짜별 보기 -->
              <template v-if="!showResourceView">
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
                      popper-class="reservation-tooltip"
                      raw-content
                    >
                      <div 
                        class="time-cell"
                        :class="[
                          {
                            'selected': isTimeCellSelected(date.date, hour.value),
                            'selecting': isTimeCellInSelection(date.date, hour.value),
                            'past-time': isPastTime(date.date, hour.value)
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
              </template>
              
              <!-- 자원별 보기 -->
              <template v-else>
                <div 
                  v-for="resource in filteredAvailableResources" 
                  :key="resource.id"
                  class="date-row"
                >
                  <div class="date-cell">
                    <div class="date-text">{{ resource.name }}</div>
                    <div class="day-text">{{ resource.location }}</div>
                  </div>
                  <div class="time-row">
                    <el-tooltip
                      v-for="hour in timeSlots" 
                      :key="`${resource.id}-${hour.value}`"
                      :content="getReservationTooltipForResource(resource.id, hour.value)"
                      placement="top"
                      :disabled="!getReservationTooltipForResource(resource.id, hour.value)"
                      effect="dark"
                      :show-after="300"
                      popper-class="reservation-tooltip"
                      raw-content
                    >
                      <div 
                        class="time-cell"
                        :class="[
                          {
                            'selected': isTimeCellSelectedForResource(resource.id, hour.value),
                            'selecting': isTimeCellInSelectionForResource(resource.id, hour.value),
                            'past-time': isPastTimeForResource(resource.id, hour.value)
                          },
                          getTimeCellClassForResource(resource.id, hour.value)
                        ]"
                        @mousedown="startTimeCellSelectionForResource(resource.id, hour.value)"
                        @mouseenter="updateTimeCellSelectionForResource(resource.id, hour.value)"
                        @mouseup="endTimeCellSelection"
                      >
                      </div>
                    </el-tooltip>
                  </div>
                </div>
              </template>
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
                <span v-else-if="reservationForm.date && !reservationForm.resourceId" class="selection-hint">
                  {{ reservationForm.date }}의 모든 자원 예약 현황을 확인할 수 있습니다. 자원을 선택하거나 드래그하여 시간을 선택하세요
                </span>
                <span v-else-if="!reservationForm.date" class="selection-hint">
                  예약 날짜를 선택하면 해당 날짜의 예약 현황을 확인할 수 있습니다
                </span>
                <span v-else class="selection-hint">드래그하여 시간을 선택하세요</span>
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
                  v-model="reservationForm.note"
                  type="textarea"
                  placeholder="추가 사항을 입력하세요."
                  :rows="2"
                />
              </el-form-item>
              <el-form-item label="반복 설정">
                <el-checkbox v-model="reservationForm.isRecurring" @change="onRecurrenceToggle">
                  정기 예약으로 설정
                </el-checkbox>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- 반복 설정 옵션 섹션 (체크 시 나타나는 상세 설정) -->
        <div v-if="reservationForm.isRecurring" class="recurrence-section">
          <div class="recurrence-options">
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
                  style="width: 100px;"
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
                  :disabled-date="(date) => date < new Date(reservationForm.date)"
                />
              </div>
          </div>
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
        <!-- 필터 옵션 -->
        <div class="reservation-filter">
          <el-radio-group v-model="reservationFilter" size="default">
            <el-radio-button label="all">전체</el-radio-button>
            <el-radio-button label="BEFORE">이용 전</el-radio-button>
            <el-radio-button label="USED">이용 완료</el-radio-button>
          </el-radio-group>
        </div>
        
        <div v-if="loadingMyReservations" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>예약 목록을 불러오는 중...</span>
        </div>
        <div v-else-if="filteredMyReservations.length === 0" class="empty-state">
          <el-icon><Calendar /></el-icon>
          <span v-if="reservationFilter === 'all'">예약된 자원이 없습니다.</span>
          <span v-else-if="reservationFilter === 'BEFORE'">이용 전 예약이 없습니다.</span>
          <span v-else-if="reservationFilter === 'USED'">이용 완료된 예약이 없습니다.</span>
          <p v-if="reservationFilter === 'all'">새로운 예약을 만들어보세요!</p>
        </div>
        <div v-else class="reservation-list">
          <div class="reservation-item" v-for="reservation in filteredMyReservations" :key="reservation.id">
            <div class="reservation-info">
              <div class="reservation-header">
                <div class="reservation-title">
                  <template v-if="reservation.isRepeated">
                    <el-icon style="margin-right: 4px"><RefreshRight /></el-icon>
                  </template>
                  {{ reservation.resourceName }}
                </div>
                <div class="reservation-date-large">{{ reservation.date }}</div>
              </div>
              <div class="reservation-details">
                <!-- 첫 번째 줄: 시간, 상태 -->
                <div class="reservation-detail-row">
                  <div class="reservation-time">
                    <el-icon><Clock /></el-icon>
                    <span>{{ reservation.startTime }} - {{ reservation.endTime }}</span>
                  </div>
                  <div class="reservation-status">
                    <el-tag :type="getReservationStatusType(reservation.status)" size="small">
                      {{ getReservationStatusLabel(reservation.status) }}
                    </el-tag>
                    <el-tag v-if="reservation.isRepeated" size="small" type="primary" style="margin-left: 6px;">
                      <el-icon style="margin-right: 4px"><RefreshRight /></el-icon>정기
                    </el-tag>
                  </div>
                </div>
                
                <!-- 두 번째 줄: 인원, 설명 -->
                <div class="reservation-detail-row">
                  <div class="reservation-attendees">
                    <el-icon><User /></el-icon>
                    <span>{{ reservation.attendees }}명</span>
                  </div>
                  <div class="reservation-purpose">
                    <el-icon><Document /></el-icon>
                    <span>{{ reservation.purpose }}</span>
                  </div>
                </div>
                
              </div>
            </div>
            <div class="reservation-actions">
              <!-- 이용 전: 수정, 취소, 이용완료 가능 -->
              <template v-if="reservation.status === 'BEFORE'">
                <el-button @click="editReservation(reservation)">
                  <el-icon><Edit /></el-icon>
                  수정
                </el-button>
                <el-button @click="cancelReservation(reservation)">
                  <el-icon><Close /></el-icon>
                  취소
                </el-button>
                <el-button type="success" @click="completeUsage(reservation)">
                  <el-icon><Check /></el-icon>
                  이용 완료
                </el-button>
              </template>
              
              <!-- 이용 완료: 삭제만 가능 -->
              <template v-else-if="reservation.status === 'USED'">
                <el-button type="danger" @click="cancelReservation(reservation)">
                  <el-icon><Close /></el-icon>
                  삭제
                </el-button>
              </template>
              
              <!-- 기타 상태 (IN_USE, CANCELLED 등) -->
              <template v-else>
                <el-button 
                  @click="cancelReservation(reservation)"
                  :disabled="reservation.status === 'IN_USE'"
                >
                  <el-icon><Close /></el-icon>
                  취소
                </el-button>
                <el-button 
                  v-if="reservation.status === 'IN_USE'" 
                  type="success" 
                  @click="completeUsage(reservation)"
                >
                  <el-icon><Check /></el-icon>
                  이용 완료
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 자원 상세 정보 모달 -->
    <el-dialog
      v-model="showResourceDetail"
      title="자원 상세 정보"
      width="800px"
    >
      <div class="resource-detail-modal" v-if="selectedResource">
        <!-- 자원 기본 정보 -->
        <div class="detail-section">
          <h4>기본 정보</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>자원명</label>
              <span>{{ selectedResource.name }}</span>
            </div>
            <div class="detail-item">
              <label>위치</label>
              <span>{{ selectedResource.location || '위치 정보 없음' }}</span>
            </div>
            <div class="detail-item">
              <label>수용 인원</label>
              <span>{{ selectedResource.capacity }}명</span>
            </div>
            <div class="detail-row-half">
              <div class="detail-item">
                <label>자원 유형</label>
                <el-tag :type="getResourceType(selectedResource.type)" size="small">
                  {{ selectedResource.categoryName || '기타' }}
                </el-tag>
              </div>
              <div class="detail-item">
                <label>자원 상태</label>
                <el-tag :type="getStatusType(selectedResource.status)" size="small">
                  {{ getStatusText(selectedResource.status) }}
                </el-tag>
              </div>
            </div>
            <div class="detail-item full-width">
              <label>시설/장비 정보</label>
              <span>{{ selectedResource.equipment || '시설 정보 없음' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>설명</label>
              <span>{{ selectedResource.description || '자세한 설명이 없습니다.' }}</span>
            </div>
          </div>
        </div>

        <!-- 예약 현황 -->
        <div class="detail-section">
          <h4>예약 현황</h4>
          <div class="reservation-status">
            <div class="status-item">
              <label>오늘 예약 현황</label>
              <div class="today-reservations">
                <div v-if="getTodayReservations(selectedResource.id).length === 0" class="no-reservation">
                  오늘 예약이 없습니다
                </div>
                <div v-else class="reservation-list">
                  <div v-for="reservation in getTodayReservations(selectedResource.id)" :key="reservation.id" class="reservation-item">
                    <div class="reservation-info">
                      <span class="time">{{ reservation.startTime }} - {{ reservation.endTime }}</span>
                      <span class="member">{{ reservation.memberName }}</span>
                      <span v-if="reservation.purpose" class="purpose">{{ reservation.purpose }}</span>
                    </div>
                    <div class="reservation-tags">
                      <el-tag :type="getReservationStatusType(reservation.status)" size="small">
                        {{ getReservationStatusLabel(reservation.status) }}
                      </el-tag>
                      <el-tag v-if="reservation.isRepeated" size="small" type="primary">
                        <el-icon style="margin-right: 4px"><RefreshRight /></el-icon>정기
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <label>이번 주 예약 현황</label>
              <div class="week-reservations">
                <div v-if="getWeekReservations(selectedResource.id).length === 0" class="no-reservation">
                  이번 주 예약이 없습니다
                </div>
                <div v-else class="reservation-list">
                  <div v-for="reservation in getWeekReservations(selectedResource.id)" :key="reservation.id" class="reservation-item">
                    <div class="reservation-info">
                      <span class="date">{{ reservation.date }}</span>
                      <span class="time">{{ reservation.startTime }} - {{ reservation.endTime }}</span>
                      <span class="member">{{ reservation.memberName }}</span>
                      <span v-if="reservation.purpose" class="purpose">{{ reservation.purpose }}</span>
                    </div>
                    <div class="reservation-tags">
                      <el-tag :type="getReservationStatusType(reservation.status)" size="small">
                        {{ getReservationStatusLabel(reservation.status) }}
                      </el-tag>
                      <el-tag v-if="reservation.isRepeated" size="small" type="primary">
                        <el-icon style="margin-right: 4px"><RefreshRight /></el-icon>정기
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <label>다음 예약</label>
              <div class="next-reservation">
                <div v-if="getNextReservation(selectedResource.id)" class="next-reservation-info">
                  <span class="date">{{ formatDateWithDay(getNextReservation(selectedResource.id).date) }}</span>
                  <span class="time">{{ getNextReservation(selectedResource.id).startTime }} - {{ getNextReservation(selectedResource.id).endTime }}</span>
                </div>
                <div v-else class="no-reservation">
                  예정된 예약이 없습니다
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 이용 규칙/주의사항 -->
        <div class="detail-section">
          <h4>이용 규칙 및 주의사항</h4>
          <div class="rules-grid">
            <div class="rule-item">
              <label>예약 가능 시간</label>
              <span>09:00 - 22:00</span>
            </div>
            <div class="rule-item">
              <label>최대 예약 시간</label>
              <span>{{ selectedResource.maxHours || 8 }}시간</span>
            </div>
            <div class="rule-item">
              <label>승인 필요</label>
              <span>{{ selectedResource.requiresApproval ? '예' : '아니오' }}</span>
            </div>
            <div class="rule-item full-width">
              <label>특별 사용 규칙</label>
              <div class="special-rules">
                <ul>
                  <li>예약 시간 10분 전까지 도착해주세요</li>
                  <li>사용 후 정리정돈을 부탁드립니다</li>
                  <li>음식물 반입 금지</li>
                  <li>시설 파손 시 즉시 신고해주세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showResourceDetail = false">닫기</el-button>
        <el-button type="primary" @click="reserveFromDetail">예약하기</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import axios from 'axios'
import { getAuthHeadersFromToken } from '@/utils/authUtils'

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
      reservationFilter: 'all', // 'all', 'BEFORE', 'USED'
      showStatistics: false,
      showResourceDetail: false,
      selectedResource: null,
      isEditingMode: false,
      loadingResources: false,
      loadingMyReservations: false,
      editingReservationId: null,
      monthlyChartInstance: null,
      resourceChartInstance: null,
      showResourceView: false, // true: 자원별 보기, false: 날짜별 보기
      reservationForm: {
        resourceType: '', // 자원 유형 선택
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        note: '',
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
      selectionStartResourceId: null,
      selectionEndResourceId: null,
      reservations: [],
      todayReservations: 0,
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
  watch: {
    // 모달이 열릴 때 필터 초기화 (선택사항 - 원하지 않으면 제거 가능)
    showMyReservations(newVal) {
      if (newVal) {
        // 모달이 열릴 때 '전체'로 초기화 (선택사항)
        // this.reservationFilter = 'all'
      }
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
    
    thisWeekReservations() {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // 이번 주 월요일
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // 이번 주 일요일
      endOfWeek.setHours(23, 59, 59, 999)
      
      return this.allReservations.filter(reservation => {
        const reservationDate = new Date(reservation.date)
        return reservationDate >= startOfWeek && reservationDate <= endOfWeek
      }).length
    },
    
    filteredAvailableResources() {
      let filtered = this.availableResources
      
      // 자원 유형이 선택된 경우 해당 유형의 자원만 필터링
      if (this.reservationForm.resourceType) {
        filtered = filtered.filter(resource => resource.categoryName === this.reservationForm.resourceType)
      }
      
      // 자원명으로 사전 순 정렬
      return filtered.sort((a, b) => a.name.localeCompare(b.name))
    },
    canSubmitReservation() {
      return this.reservationForm.resourceId && 
             this.reservationForm.date && 
             this.reservationForm.startTime && 
             this.reservationForm.endTime && 
             this.reservationForm.purpose
    },
    
    sortedMyReservations() {
      // 상태별 우선순위: IN_USE(이용 중) > BEFORE(이용 전) > USED(이용 완료)
      const statusPriority = {
        'IN_USE': 1,
        'BEFORE': 2,
        'USED': 3
      }
      
      return [...this.myReservations].sort((a, b) => {
        const priorityA = statusPriority[a.status] || 999
        const priorityB = statusPriority[b.status] || 999
        
        // 상태별로 먼저 정렬
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        
        // 같은 상태 내에서는 날짜순으로 정렬 (오름차순)
        return new Date(a.date) - new Date(b.date)
      })
    },
    
    filteredMyReservations() {
      let filtered = this.sortedMyReservations
      
      // 필터 적용
      if (this.reservationFilter === 'BEFORE') {
        filtered = filtered.filter(reservation => reservation.status === 'BEFORE')
      } else if (this.reservationFilter === 'USED') {
        filtered = filtered.filter(reservation => reservation.status === 'USED')
      }
      // 'all'일 때는 필터링하지 않음
      
      return filtered
    },
    safeMeetingRooms() {
      // 회의실 카테고리의 자원 중 오늘 예약 가능한 자원만 반환
      const meetingRoomResources = this.resources.filter(resource => 
        resource.categoryName && resource.categoryName.includes('회의실')
      )
      
      const today = this.formatDate(new Date())
      const todayReservedResourceIds = this.allReservations
        .filter(reservation => 
          reservation.date === today && 
          reservation.status !== 'CANCELLED'
        )
        .map(reservation => reservation.reservationTypeId)
      
      return meetingRoomResources.filter(resource => 
        !todayReservedResourceIds.includes(resource.id)
      )
    },
    safeVehicles() {
      // 차량 카테고리의 자원 중 오늘 예약 가능한 자원만 반환
      const vehicleResources = this.resources.filter(resource => 
        resource.categoryName && resource.categoryName.includes('차량')
      )
      
      const today = this.formatDate(new Date())
      const todayReservedResourceIds = this.allReservations
        .filter(reservation => 
          reservation.date === today && 
          reservation.status !== 'CANCELLED'
        )
        .map(reservation => reservation.reservationTypeId)
      
      return vehicleResources.filter(resource => 
        !todayReservedResourceIds.includes(resource.id)
      )
    }
  },
  methods: {
    async loadResources() {
      this.loadingResources = true
      try {
        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/type/list-available`, {
          params: { companyId: 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0' },
          headers: authHeaders ? {
            'Authorization': authHeaders['Authorization'],
            'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
          } : {}
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
      } finally {
        this.loadingResources = false
      }
    },
    
    // 카테고리 목록 로드
    async loadCategories() {
      try {
        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        
        const { data } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/category/list`, {
          params: { companyId: 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0' },
          headers: authHeaders ? {
            'Authorization': authHeaders['Authorization'],
            'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
          } : {}
        })
        const list = Array.isArray(data) ? data : (data?.data || [])
        this.categories = list.map(cat => ({
          id: cat.id || cat.categoryId || cat.uuid,
          name: cat.name,
          value: (cat.name || '').toLowerCase().replace(/\s+/g, '_')
        })).sort((a, b) => a.name.localeCompare(b.name)) // 카테고리명으로 사전 순 정렬
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
      this.loadingMyReservations = true
      try {
        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        
        const memberId = localStorage.getItem('memberId')
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/myList`, {
          params: { 
            memberId: memberId,
            companyId: 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0' 
          },
          headers: authHeaders ? {
            'Authorization': authHeaders['Authorization'],
            'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
          } : {}
        })
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        
        this.myReservations = list.map(item => {
          const startDateTime = new Date(item.startDateTime)
          const endDateTime = new Date(item.endDateTime)
          
          // 현재 시간이 예약 시간 내에 있는지 확인하여 상태 업데이트
          let status = item.status
          const now = new Date()
          
          // 예약 시간 내에 현재 시간이 포함되어 있고, 상태가 'BEFORE'인 경우 'IN_USE'로 변경
          if (item.status === 'BEFORE' && now >= startDateTime && now <= endDateTime) {
            status = 'IN_USE'
          }
          // 예약 종료 시간이 현재 시간을 지났고, 상태가 'BEFORE' 또는 'IN_USE'인 경우 'USED'로 변경
          else if ((item.status === 'BEFORE' || item.status === 'IN_USE') && now > endDateTime) {
            status = 'USED'
          }
          
          // 자원 정보 찾기
          const resource = this.resources.find(r => r.id === item.reservationTypeId)
          
          return {
            id: item.id,
            reservationTypeId: item.reservationTypeId,
            memberId: item.memberId,
            companyId: item.companyId,
            status: status,
            startDateTime: item.startDateTime,
            endDateTime: item.endDateTime,
            resourceName: resource ? resource.name : '알 수 없는 자원',
            date: startDateTime.toISOString().split('T')[0],
            startTime: startDateTime.toTimeString().split(' ')[0].substring(0, 5),
            endTime: endDateTime.toTimeString().split(' ')[0].substring(0, 5),
            // 예약 상세 정보
            purpose: item.title || '사용 목적 없음',
            attendees: item.number || 1,
            note: item.note || '',
            participant: item.participant || 0,
            // 정기 예약 정보
            isRepeated: item.isRepeated === true || item.isRepeated === 'TRUE',
            recurringSetting: item.recurringSettingRes || null
          }
        })
      } catch (error) {
        console.error('내 예약 목록 로드 실패:', error)
        this.error('예약 목록을 불러오는데 실패했습니다.')
      } finally {
        this.loadingMyReservations = false
      }
    },
    
    async loadAllReservations() {
      try {
        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/list`, {
          params: { 
            companyId: 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0' 
          },
          headers: authHeaders ? {
            'Authorization': authHeaders['Authorization'],
            'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
          } : {}
        })
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        
        // 전체 예약 목록을 저장 (예약 가능 시간 확인용)
        this.allReservations = list.map(item => {
          const startDateTime = new Date(item.startDateTime)
          const endDateTime = new Date(item.endDateTime)
          
          // 현재 시간이 예약 시간 내에 있는지 확인하여 상태 업데이트
          let status = item.status
          const now = new Date()
          
          // 예약 시간 내에 현재 시간이 포함되어 있고, 상태가 'BEFORE'인 경우 'IN_USE'로 변경
          if (item.status === 'BEFORE' && now >= startDateTime && now <= endDateTime) {
            status = 'IN_USE'
          }
          // 예약 종료 시간이 현재 시간을 지났고, 상태가 'BEFORE' 또는 'IN_USE'인 경우 'USED'로 변경
          else if ((item.status === 'BEFORE' || item.status === 'IN_USE') && now > endDateTime) {
            status = 'USED'
          }
          
          return {
            id: item.id,
            reservationTypeId: item.reservationTypeId,
            memberId: item.memberId,
            companyId: item.companyId,
            status: status,
            startDateTime: item.startDateTime,
            endDateTime: item.endDateTime,
            date: startDateTime.toISOString().split('T')[0],
            startTime: startDateTime.toTimeString().split(' ')[0].substring(0, 5),
            endTime: endDateTime.toTimeString().split(' ')[0].substring(0, 5),
            memberName: item.name || item.memberName || '알 수 없음',
            // 예약 상세 정보
            purpose: item.title || '사용 목적 없음',
            attendees: item.number || 1,
            note: item.note || '',
            participant: item.participant || 0,
            // 정기 예약 정보
            isRepeated: item.isRepeated === true || item.isRepeated === 'TRUE',
            recurringSetting: item.recurringSettingRes || null
          }
        })
        
        // 오늘 날짜의 예약 건수 계산
        const today = this.formatDate(new Date())
        this.todayReservations = this.allReservations.filter(reservation => 
          reservation.date === today && reservation.status !== 'CANCELLED'
        ).length
        
      } catch (error) {
        console.error('전체 예약 목록 로드 실패:', error)
        this.error('예약 현황을 불러오는데 실패했습니다.')
      }
    },
    
    async submitReservationToServer(reservationData, reservationId = null) {
      try {
        const memberId = localStorage.getItem('memberId')
        const requestData = {
          reservationTypeId: reservationData.resourceId,
          memberId: memberId,
          companyId: 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0',
          startDateTime: `${reservationData.date}T${reservationData.startTime}:00`,
          endDateTime: `${reservationData.date}T${reservationData.endTime}:00`,
          // reservation-details 확장 필드
          title: reservationData.purpose || '',
          number: reservationData.attendees || 1,
          note: reservationData.note || '',
          participant: Array.isArray(reservationData.sharedUsers) ? reservationData.sharedUsers.length : 0,
          isRepeated: reservationData.isRecurring ? 'TRUE' : 'FALSE',
          repeatCreateReq: reservationData.isRecurring
            ? {
                // 백엔드 스키마: RepeatCycle cycle, int repeatInterval, List<DayOfWeek> dayOfWeek, LocalDate endDate
                cycle: (() => {
                  const t = (reservationData.recurrenceType || '').toString().toLowerCase()
                  const map = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }
                  return map[t]
                })(),
                repeatInterval: reservationData.recurrenceInterval,
                dayOfWeek: (() => {
                  // 선택된 요일들을 List<DayOfWeek> 형태로 전송
                  if (!Array.isArray(reservationData.recurrenceDays) || reservationData.recurrenceDays.length === 0) return []
                  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
                  return reservationData.recurrenceDays.map(day => {
                    const idx = typeof day === 'string' ? parseInt(day, 10) : Number(day)
                    return days[idx]
                  })
                })(),
                endDate: reservationData.recurrenceEndDate
              }
            : null
        }
        
        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        const requestHeaders = authHeaders ? {
          'Authorization': authHeaders['Authorization'],
          'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
        } : {}
        
        let response
        if (reservationId) {
          response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/${reservationId}`, requestData, {
            headers: requestHeaders
          })
        } else {
          response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/register`, requestData, {
            headers: requestHeaders
          })
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
        'BEFORE': 'warning',      // 이용 전 (노란색)
        'IN_USE': 'danger',       // 이용 중 (빨간색)
        'USED': 'success'         // 이용 완료 (초록색)
      }
      return statusMap[status] || 'info'
    },
    getReservationStatusLabel(status) {
      const statusMap = {
        'BEFORE': '이용 전',
        'IN_USE': '이용 중',
        'USED': '이용 완료'
      }
      return statusMap[status] || status
    },
    
    getRecurringPatternLabel(recurringSetting) {
      if (!recurringSetting) return ''
      
      const cycleMap = {
        'DAILY': '매일',
        'WEEKLY': '매주',
        'MONTHLY': '매월',
        'YEARLY': '매년'
      }
      
      const cycle = cycleMap[recurringSetting.cycle] || recurringSetting.cycle
      const interval = recurringSetting.repeatInterval || 1
      
      if (interval === 1) {
        return cycle
      } else {
        return `${interval}${cycle.replace('매', '')}마다`
      }
    },
    
    // 정기 예약 cycle을 폼의 recurrenceType으로 매핑
    mapRecurringCycleToType(cycle) {
      const cycleMap = {
        'DAILY': 'daily',
        'WEEKLY': 'weekly', 
        'MONTHLY': 'monthly',
        'YEARLY': 'yearly'
      }
      return cycleMap[cycle] || 'weekly'
    },
    
    // 정기 예약 요일 정보를 폼의 recurrenceDays로 매핑
    // dayOrList는 'MONDAY' 같은 문자열 또는 ['MONDAY','WEDNESDAY'] 같은 배열을 허용
    mapRecurringDays(dayOrList) {
      if (!dayOrList) return []
      const dayMap = {
        'MONDAY': '1',
        'TUESDAY': '2',
        'WEDNESDAY': '3',
        'THURSDAY': '4',
        'FRIDAY': '5',
        'SATURDAY': '6',
        'SUNDAY': '0'
      }
      if (Array.isArray(dayOrList)) {
        return dayOrList
          .map(d => dayMap[d])
          .filter(v => v !== undefined)
          .sort((a, b) => Number(a) - Number(b))
      }
      const dayNumber = dayMap[dayOrList]
      return dayNumber !== undefined ? [dayNumber] : []
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
    onResourceTypeChange() {
      // 자원 유형이 변경되면 자원 선택과 시간을 초기화하지만 날짜는 유지
      this.reservationForm.resourceId = ''
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
      this.generateWeekDates()
    },
    
    onResourceChange() {
      // 자원이 변경되면 선택된 시간만 초기화하고 캘린더를 다시 렌더링
      // 날짜는 유지하여 날짜 먼저 선택 후 자원 선택도 가능하도록 함
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
      this.generateWeekDates()
    },
    onDateChange() {
      // 날짜가 변경되면 선택된 시간만 초기화하고 캘린더를 다시 렌더링
      // 자원 선택은 유지하여 날짜 먼저 선택 후 자원 선택도 가능하도록 함
      this.reservationForm.startTime = ''
      this.reservationForm.endTime = ''
      this.isSelecting = false
      this.selectionStartDate = null
      this.selectionStartHour = null
      this.selectionEndDate = null
      this.selectionEndHour = null
      this.generateWeekDates()
    },
    
    // 과거 날짜 비활성화
    disabledDate(time) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return time.getTime() < today.getTime()
    },
    
    // 과거 시간인지 확인
    isPastTime(date, hour) {
      const today = new Date()
      const selectedDate = new Date(date)
      const currentHour = today.getHours()
      
      // 오늘 날짜인 경우에만 시간 체크
      if (selectedDate.toDateString() === today.toDateString()) {
        // 현재 시간 이전만 과거로 판단 (현재 시간은 포함하지 않음)
        return hour < currentHour
      }
      
      return false
    },
    
    // 자원별 보기를 위한 메서드들
    startTimeCellSelectionForResource(resourceId, hour) {
      // 과거 시간 선택 방지
      if (this.isPastTimeForResource(resourceId, hour)) {
        this.warning('현재 시간 이전으로는 예약할 수 없습니다.')
        return
      }
      
      // 날짜가 선택되지 않은 상태에서는 시간 선택 불가
      if (!this.reservationForm.date) {
        this.warning('먼저 예약 날짜를 선택해주세요.')
        return
      }
      
      // 예약된 시간대는 선택할 수 없음
      if (this.isTimeCellReservedForResource(resourceId, hour)) {
        return
      }
      
      this.isSelecting = true
      this.selectionStartResourceId = resourceId
      this.selectionStartHour = hour
      this.selectionEndResourceId = resourceId
      this.selectionEndHour = hour
      this.updateReservationTimesFromCellsForResource()
    },
    updateTimeCellSelectionForResource(resourceId, hour) {
      if (this.isSelecting) {
        // 자원이 변경된 경우 선택 종료
        if (this.selectionStartResourceId !== resourceId) {
          this.endTimeCellSelection()
          this.error('다른 자원으로는 연속 선택할 수 없습니다.')
          return
        }
        
        // 예약된 시간대 선택을 제한
        if (this.isTimeCellReservedForResource(resourceId, hour)) {
          this.endTimeCellSelection()
          this.error('예약된 시간대는 선택할 수 없습니다.')
          return
        }
        
        this.selectionEndHour = hour
        this.updateReservationTimesFromCellsForResource()
      }
    },
    isTimeCellSelectedForResource(resourceId, hour) {
      if (!this.reservationForm.startTime || !this.reservationForm.endTime || 
          !this.reservationForm.date || !this.reservationForm.resourceId || 
          this.reservationForm.resourceId !== resourceId) {
        return false
      }
      
      const startHour = parseInt(this.reservationForm.startTime.split(':')[0])
      const endHour = parseInt(this.reservationForm.endTime.split(':')[0])
      
      return hour >= startHour && hour < endHour
    },
    isTimeCellInSelectionForResource(resourceId, hour) {
      if (!this.isSelecting || this.selectionStartResourceId !== resourceId || !this.selectionStartHour) {
        return false
      }
      
      const startHour = Math.min(this.selectionStartHour, this.selectionEndHour)
      const endHour = Math.max(this.selectionStartHour, this.selectionEndHour)
      
      return hour >= startHour && hour <= endHour
    },
    isPastTimeForResource(resourceId, hour) {
      // 날짜가 선택되지 않았으면 과거가 아님
      if (!this.reservationForm.date) {
        return false
      }
      
      return this.isPastTime(this.reservationForm.date, hour)
    },
    isTimeCellReservedForResource(resourceId, hour) {
      // 날짜가 선택되지 않았으면 예약 현황을 표시하지 않음
      if (!this.reservationForm.date) {
        return false
      }
      
      // 특정 자원의 예약만 확인
      return this.allReservations.some(reservation => {
        if (reservation.reservationTypeId !== resourceId || 
            reservation.date !== this.reservationForm.date ||
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
    getTimeCellClassForResource(resourceId, hour) {
      // 예약된 시간대에 클래스 추가
      if (!this.isTimeCellReservedForResource(resourceId, hour)) return ''
      
      const reservation = this.allReservations.find(r => 
        r.reservationTypeId === resourceId && 
        r.date === this.reservationForm.date &&
        r.status !== 'CANCELLED' &&
        parseInt(r.startTime.split(':')[0]) <= hour &&
        parseInt(r.endTime.split(':')[0]) > hour
      )
      
      if (reservation) {
        const resource = this.resources.find(r => r.id === resourceId)
        if (resource) {
          return `reserved-${resource.type}`
        }
      }
      
      return 'reserved'
    },
    getReservationTooltipForResource(resourceId, hour) {
      // 예약된 시간대에 대한 툴팁 정보 반환
      if (!this.isTimeCellReservedForResource(resourceId, hour)) return ''
      
      const reservation = this.allReservations.find(r => 
        r.reservationTypeId === resourceId && 
        r.date === this.reservationForm.date &&
        r.status !== 'CANCELLED' &&
        parseInt(r.startTime.split(':')[0]) <= hour &&
        parseInt(r.endTime.split(':')[0]) > hour
      )
      
      if (reservation) {
        return `<div>${reservation.memberName}</div><div>${reservation.startTime} - ${reservation.endTime}</div>`
      }
      
      return ''
    },
    updateReservationTimesFromCellsForResource() {
      if (this.selectionStartResourceId && this.selectionStartHour !== null && 
          this.selectionEndResourceId && this.selectionEndHour !== null) {
        
        const startHour = Math.min(this.selectionStartHour, this.selectionEndHour)
        const endHour = Math.max(this.selectionStartHour, this.selectionEndHour)
        
        // 예약된 시간대 검사
        let hasReservedTime = false
        for (let hour = startHour; hour <= endHour; hour++) {
          if (this.isTimeCellReservedForResource(this.selectionStartResourceId, hour)) {
            hasReservedTime = true
            break
          }
        }
        
        if (hasReservedTime) {
          this.endTimeCellSelection()
          this.error('선택 범위에 예약된 시간대가 포함되어 있습니다.')
          return
        }
        
        this.reservationForm.resourceId = this.selectionStartResourceId
        this.reservationForm.startTime = `${startHour.toString().padStart(2, '0')}:00`
        this.reservationForm.endTime = `${(endHour + 1).toString().padStart(2, '0')}:00`
      }
    },
    
    // 새로운 시간 셀 선택 메서드들
    startTimeCellSelection(date, hour) {
      // 과거 시간 선택 방지
      if (this.isPastTime(date, hour)) {
        this.warning('현재 시간 이전으로는 예약할 수 없습니다.')
        return
      }
      
      // 날짜가 선택되지 않은 상태에서는 시간 선택 불가
      if (!this.reservationForm.date) {
        this.warning('먼저 예약 날짜를 선택해주세요.')
        return
      }
      
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
      // 날짜가 선택되지 않았으면 예약 현황을 표시하지 않음
      if (!this.reservationForm.date) {
        return false
      }
      
      // 자원이 선택되지 않았으면 필터링된 자원들의 예약을 확인
      if (!this.reservationForm.resourceId) {
        // 필터링된 자원들의 예약 확인 (수정 중인 예약은 제외)
        return this.allReservations.some(reservation => {
          if (reservation.date !== date || reservation.status === 'CANCELLED') {
            return false
          }
          
          // 수정 모드에서는 현재 수정 중인 예약을 제외
          if (this.isEditingMode && reservation.id === this.editingReservationId) {
            return false
          }
          
          // 자원 유형이 선택된 경우 해당 유형의 자원만 필터링
          if (this.reservationForm.resourceType) {
            const resource = this.resources.find(r => r.id === reservation.reservationTypeId)
            if (!resource || resource.categoryName !== this.reservationForm.resourceType) {
              return false
            }
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
      // 날짜가 선택되지 않았으면 예약 정보를 반환하지 않음
      if (!this.reservationForm.date) {
        return null
      }
      
      // 특정 시간대의 예약 정보 반환
      if (!this.reservationForm.resourceId) {
        // 자원이 선택되지 않았으면 필터링된 자원들의 예약 확인 (수정 중인 예약은 제외)
        return this.allReservations.filter(reservation => {
          if (reservation.date !== date || reservation.status === 'CANCELLED') {
            return false
          }
          
          // 수정 모드에서는 현재 수정 중인 예약을 제외
          if (this.isEditingMode && reservation.id === this.editingReservationId) {
            return false
          }
          
          // 자원 유형이 선택된 경우 해당 유형의 자원만 필터링
          if (this.reservationForm.resourceType) {
            const resource = this.resources.find(r => r.id === reservation.reservationTypeId)
            if (!resource || resource.categoryName !== this.reservationForm.resourceType) {
              return false
            }
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
        
        // 툴팁 내용 구성 - '자원명 : 예약 시간 (예약자명)' 형태
        const tooltipLines = []
        Object.keys(groupedReservations).forEach(resourceName => {
          const group = groupedReservations[resourceName]
          group.reservations.forEach(reservation => {
            const timeRange = `${reservation.startTime}-${reservation.endTime}`
            const reserverName = reservation.memberName || '알 수 없음'
            tooltipLines.push(`${resourceName}: ${timeRange} (${reserverName})`)
          })
        })
        
        return tooltipLines.join('<br>')
      }
      
      // 특정 자원이 선택된 경우 (단일 객체 반환) - '예약자 : {memberName}' 형태
      if (reservationInfo) {
        const reserverName = reservationInfo.memberName || '알 수 없음'
        return `예약자: ${reserverName}`
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
      this.showResourceView = true // 자원별 보기로 설정
      this.reservationForm.resourceType = '' // 자원 유형을 선택하지 않은 상태로 시작
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
      this.showResourceView = false // 날짜별 보기로 설정
      this.reservationForm.resourceType = resource.categoryName // 자원 유형 설정
      this.reservationForm.resourceId = resource.id
      // 자원 목록에서 날짜가 선택된 경우 해당 날짜 사용, 아니면 오늘 날짜 사용
      this.reservationForm.date = this.selectedDate || this.formatDate(new Date())
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
        resourceType: '',
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        note: '',
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
      this.selectedResource = resource
      this.showResourceDetail = true
    },
    
    reserveFromDetail() {
      this.showResourceDetail = false
      this.reserveResource(this.selectedResource)
    },
    
    getStatusType(status) {
      const statusMap = {
        'available': 'success',
        'occupied': 'danger',
        'maintenance': 'warning'
      }
      return statusMap[status] || 'info'
    },
    
    getTodayReservations(resourceId) {
      const today = this.formatDate(new Date())
      return this.allReservations.filter(reservation => 
        reservation.reservationTypeId === resourceId && 
        reservation.date === today &&
        reservation.status !== 'CANCELLED'
      ).sort((a, b) => {
        // 시간순으로 정렬
        return a.startTime.localeCompare(b.startTime)
      })
    },
    
    getWeekReservations(resourceId) {
      const today = new Date()
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      return this.allReservations.filter(reservation => {
        const reservationDate = new Date(reservation.date)
        return reservation.reservationTypeId === resourceId && 
               reservationDate >= weekStart && 
               reservationDate <= weekEnd &&
               reservation.status !== 'CANCELLED'
      }).sort((a, b) => {
        // 날짜순으로 먼저 정렬, 같은 날짜면 시간순으로 정렬
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) {
          return dateCompare
        }
        return a.startTime.localeCompare(b.startTime)
      })
    },
    
    getNextReservation(resourceId) {
      const today = this.formatDate(new Date())
      const futureReservations = this.allReservations.filter(reservation => 
        reservation.reservationTypeId === resourceId && 
        reservation.date > today &&
        reservation.status !== 'CANCELLED'
      ).sort((a, b) => new Date(a.date) - new Date(b.date))
      
      return futureReservations.length > 0 ? futureReservations[0] : null
    },
    
    formatDateWithDay(dateStr) {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dayName = this.getDayName(date.getDay())
      
      return `${year}-${month}-${day} (${dayName})`
    },
    async submitReservation() {
      // 자원이 선택되지 않은 경우 에러 메시지
      if (!this.reservationForm.resourceId) {
        this.error('예약할 자원을 선택해주세요.')
        return
      }
      
      // 예약 시간 검증 (validateReservationTime 내부에서 이미 구체적인 에러 메시지를 표시함)
      if (!this.validateReservationTime()) {
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
        await this.submitReservationToServer(this.reservationForm, this.isEditingMode ? this.editingReservationId : null);
        
        if (this.isEditingMode) {
          this.success('예약이 수정되었습니다.')
        } else if (this.reservationForm.isRecurring) {
          this.success(`정기 예약이 완료되었습니다.`)
        } else {
          this.success('예약이 완료되었습니다.')
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
      const { startTime, endTime } = this.reservationForm
      
      // 시작 시간과 종료 시간이 모두 입력되었는지 확인
      if (!startTime || !endTime) {
        this.error('시작 시간과 종료 시간을 모두 선택해주세요.')
        return false
      }

      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      
      // 시작 시간이 종료 시간보다 빠른지 확인
      if (start >= end) {
        this.error('종료 시간은 시작 시간보다 늦어야 합니다.')
        return false
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
      // 이용 전 상태만 수정 가능
      if (reservation.status !== 'BEFORE') {
        this.warning('이용 전 상태의 예약만 수정할 수 있습니다.')
        return
      }
      
      // 예약 수정 모달 표시
      this.isEditingMode = true
      this.editingReservationId = reservation.id // 수정할 예약 ID 저장
      
      // 자원 정보 찾기
      const resource = this.resources.find(r => r.name === reservation.resourceName)
      
      // 정기 예약 정보 처리
      const isRepeated = reservation.isRepeated === true || reservation.isRepeated === 'TRUE'
      const recurringSetting = reservation.recurringSetting || {}
      
      this.reservationForm = {
        resourceType: resource ? resource.categoryName : '',
        resourceId: this.getResourceIdByName(reservation.resourceName),
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        purpose: reservation.purpose === '사용 목적 없음' ? '' : reservation.purpose,
        attendees: reservation.attendees,
        note: reservation.note || '',
        sharedUsers: [],
        sharedUserInput: '',
        isRecurring: isRepeated,
        recurrenceType: this.mapRecurringCycleToType(recurringSetting.cycle) || 'weekly',
        recurrenceInterval: recurringSetting.repeatInterval || 1,
        recurrenceEndDate: recurringSetting.endDate || '',
        // repeatDayList(배열)이 있으면 우선 사용, 없으면 단일 dayOfWeek 사용
        recurrenceDays: this.mapRecurringDays(recurringSetting.repeatDayList || recurringSetting.dayOfWeek) || []
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
    async cancelReservation(reservation) {
      // 이용 중 상태일 때는 취소/삭제 불가
      if (reservation.status === 'IN_USE') {
        this.warning('이용 중인 예약은 취소할 수 없습니다.')
        return
      }
      
      const actionText = reservation.status === 'USED' ? '삭제' : '취소'
      
      try {
        await this.$confirm(`정말로 예약을 ${actionText}하시겠습니까?`, '확인', {
          confirmButtonText: actionText,
          cancelButtonText: '돌아가기',
          type: 'warning'
        })

        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        
        // API 요청으로 예약 삭제
        const response = await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/${reservation.id}`,
          {
            headers: authHeaders ? {
              'Authorization': authHeaders['Authorization'],
              'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
            } : {}
          }
        )

        if (response.data && response.data.success) {
          // 로컬에서 예약 제거
          const index = this.myReservations.findIndex(r => r.id === reservation.id)
          if (index > -1) {
            this.myReservations.splice(index, 1)
          }
          
          // 전체 예약 목록에서도 제거
          const allIndex = this.allReservations.findIndex(r => r.id === reservation.id)
          if (allIndex > -1) {
            this.allReservations.splice(allIndex, 1)
          }
          
          this.success(`예약이 ${actionText}되었습니다.`)
        } else {
          throw new Error(response.data?.message || `예약 ${actionText}에 실패했습니다.`)
        }
      } catch (error) {
        if (error !== 'cancel') { // 사용자가 확인을 취소한 경우가 아닐 때만 에러 처리
          console.error('예약 취소 실패:', error)
          this.error(`예약 ${actionText} 중 오류가 발생했습니다: ${error.message}`)
        }
      }
    },
    async completeUsage(reservation) {
      try {
        // 확인 창 표시
        await this.$confirm(
          `"${reservation.resourceName}" 자원의 이용을 완료하시겠습니까?`,
          '이용 완료 확인',
          {
            confirmButtonText: '완료',
            cancelButtonText: '취소',
            type: 'warning'
          }
        )

        // 헤더 설정
        const authHeaders = getAuthHeadersFromToken()
        
        // API 요청으로 예약 상태를 USED로 변경
        const response = await axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/workforce-service/reservation/status/${reservation.id}`,
          {
            reservationStatus: 'USED'
          },
          {
            headers: authHeaders ? {
              'Authorization': authHeaders['Authorization'],
              'X-User-MemberPositionId': authHeaders['X-User-MemberPositionId']
            } : {}
          }
        )

        if (response.data && response.data.success) {
          // 로컬 상태 업데이트
          const index = this.myReservations.findIndex(r => r.id === reservation.id)
          if (index > -1) {
            this.myReservations[index].status = 'USED'
          }
          
          this.success('이용 완료가 처리되었습니다.')
        } else {
          throw new Error(response.data?.message || '이용 완료 처리에 실패했습니다.')
        }
      } catch (error) {
        if (error.message !== 'cancel') { // 사용자가 취소한 경우가 아닌 경우
          console.error('이용 완료 처리 실패:', error)
          this.error(`이용 완료 처리 중 오류가 발생했습니다: ${error.message}`)
        }
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
        note: this.reservationForm.note,
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
  justify-content: center;
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
  margin-top: 10px;
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
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
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
  margin-top: 4px;
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

.reservation-filter {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

.reservation-filter :deep(.el-radio-group) {
  width: 100%;
}

.reservation-filter :deep(.el-radio-button) {
  flex: 1;
}

.reservation-filter :deep(.el-radio-button__inner) {
  width: 100%;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #606266;
  gap: 12px;
}

.loading-state .el-icon {
  font-size: 32px;
  color: #4f46e5;
}

.loading-state span {
  font-size: 16px;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
  gap: 12px;
}

.empty-state .el-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.empty-state span {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.empty-state p {
  font-size: 14px;
  color: #909399;
  margin: 0;
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

/* 내 예약 현황의 두 줄 레이아웃 */
.reservation-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 16px;
}

.reservation-detail-row:last-child {
  margin-bottom: 0;
}

.reservation-detail-row > div {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
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

.resource-type-selection,
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
  max-height: 600px;
  overflow-y: auto;
}

/* 스크롤바 스타일 */
.reservation-calendar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.reservation-calendar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.reservation-calendar::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 4px;
}

.reservation-calendar::-webkit-scrollbar-thumb:hover {
  background: #c0c0c0;
}

/* Firefox */
.reservation-calendar {
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f1f1f1;
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
  display: flex;
  flex-direction: column;
}

.calendar-scroll-wrapper {
  overflow-x: hidden;
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
  flex-shrink: 0;
}

.time-labels {
  display: flex;
  flex: 1;
}

.time-header-cell {
  flex: 1;
  min-width: 50px;
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
  flex-shrink: 0;
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
  min-width: 50px;
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

.time-cell.past-time {
  background: #e0e0e0 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
  position: relative;
}

/* 예약된 시간대가 과거 시간보다 우선순위 높음 */
.time-cell.past-time.reserved,
.time-cell.past-time.reserved-meeting,
.time-cell.past-time.reserved-vehicle,
.time-cell.past-time.reserved-equipment,
.time-cell.past-time.reserved-other,
.time-cell.past-time.reserved-multiple {
  background: #ffebee !important;
  opacity: 1 !important;
}

.time-cell.past-time::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
}

/* 예약된 시간대에는 대각선 패턴 제거 */
.time-cell.past-time.reserved::after,
.time-cell.past-time.reserved-meeting::after,
.time-cell.past-time.reserved-vehicle::after,
.time-cell.past-time.reserved-equipment::after,
.time-cell.past-time.reserved-other::after,
.time-cell.past-time.reserved-multiple::after {
  display: none;
}

.time-cell.past-time:hover {
  background: #e0e0e0 !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 예약된 시간대 호버 효과는 유지 */
.time-cell.past-time.reserved:hover,
.time-cell.past-time.reserved-meeting:hover,
.time-cell.past-time.reserved-vehicle:hover,
.time-cell.past-time.reserved-equipment:hover,
.time-cell.past-time.reserved-other:hover,
.time-cell.past-time.reserved-multiple:hover {
  background: #ffcdd2 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* 반복 설정 섹션 */
.recurrence-section {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.recurrence-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recurrence-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recurrence-type-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recurrence-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.recurrence-days {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recurrence-days :deep(.el-checkbox-group) {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.recurrence-end {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 자원 상세 정보 모달 스타일 */

.detail-section {
  margin-bottom: 30px;
}

/* 자원 상세 모달 footer 패딩 제거 */
.resource-detail-modal + .el-dialog__footer {
  padding-top: 0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 0 5px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item.half-width {
  grid-column: span 1;
}

.detail-row-half {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.reservation-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 0 5px;
}

.status-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.status-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reservation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.reservation-item .date {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.reservation-item .time {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 600;
}

/* 정기 예약 관련 스타일 */
.reservation-recurring {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.reservation-end-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.reservation-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.reservation-tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.reservation-item .member {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.reservation-item .purpose {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.no-reservation {
  text-align: center;
  color: #909399;
  font-size: 14px;
  font-style: italic;
  padding: 20px;
}

.next-reservation-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.next-reservation-info .date {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}

.next-reservation-info .time {
  font-size: 13px;
  color: #606266;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 0 5px;
}

.rule-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-item.full-width {
  grid-column: 1 / -1;
}

.rule-item label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rule-item span {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.special-rules ul {
  margin: 0;
  padding-left: 20px;
}

.special-rules li {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.5;
}

.special-rules li:last-child {
  margin-bottom: 0;
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

/* 예약 툴팁 스타일 */
:deep(.reservation-tooltip) {
  max-width: 300px;
}
</style>
