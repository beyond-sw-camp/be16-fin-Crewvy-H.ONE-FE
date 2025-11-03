<template>
  <div class="work-location-management">
    <div class="content-card">
      <div class="card-header">
        <h3>근무지 관리</h3>
        <el-button type="primary" @click="openLocationDialog()">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">새 근무지 추가</span>
        </el-button>
      </div>
      <div class="location-table">
        <el-table :data="locations" v-loading="isLoading" border style="width: 100%" empty-text="등록된 근무지가 없습니다.">
          <el-table-column prop="name" label="장소명" width="200" />
          <el-table-column prop="address" label="주소" min-width="250" show-overflow-tooltip />
          <el-table-column label="GPS 좌표" width="200">
            <template #default="{ row }">
              <span v-if="row.latitude && row.longitude">
                {{ row.latitude.toFixed(6) }}, {{ row.longitude.toFixed(6) }}
              </span>
              <span v-else style="color: #909399;">미등록</span>
            </template>
          </el-table-column>
          <el-table-column label="GPS 반경" width="120" align="center">
            <template #default="{ row }">
              <span v-if="row.gpsRadius">{{ row.gpsRadius }}m</span>
              <span v-else style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP 주소" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.ipAddress">{{ row.ipAddress }}</span>
              <span v-else style="color: #909399;">미등록</span>
            </template>
          </el-table-column>
          <el-table-column label="상태" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isActive ? 'success' : 'info'">
                {{ row.isActive ? '활성' : '비활성' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="작업" width="280" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="openLocationDialog(row)">수정</el-button>
              <el-button
                size="small"
                :type="row.isActive ? 'warning' : 'success'"
                @click="toggleActive(row.workLocationId)"
              >
                {{ row.isActive ? '비활성화' : '활성화' }}
              </el-button>
              <el-button size="small" type="danger" @click="deleteLocation(row.workLocationId)">삭제</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 페이지네이션 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="pagination.totalElements"
            :page-size="pagination.size"
            :current-page="pagination.page + 1"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 근무지 추가/수정 다이얼로그 -->
    <el-dialog v-model="locationDialogVisible" :title="isEditing ? '근무지 수정' : '새 근무지 추가'" width="700px">
      <el-form :model="locationForm" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="장소명" prop="name">
          <el-input v-model="locationForm.name" placeholder="예: 서울 본사" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="주소" prop="address">
          <div style="display: flex; width: 100%;">
            <el-input v-model="locationForm.address" placeholder="주소 검색 버튼을 클릭하여 입력" readonly />
            <el-button @click="openAddressSearch" style="margin-left: 8px;">주소 검색</el-button>
          </div>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="위도 (Latitude)">
              <el-input-number
                v-model="locationForm.latitude"
                placeholder="자동 입력"
                :precision="6"
                :min="-90"
                :max="90"
                style="width: 100%;"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="경도 (Longitude)">
              <el-input-number
                v-model="locationForm.longitude"
                placeholder="자동 입력"
                :precision="6"
                :min="-180"
                :max="180"
                style="width: 100%;"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="GPS 허용 반경">
          <el-input-number v-model="locationForm.gpsRadius" :min="10" :max="10000" :step="10" controls-position="right" style="width: 200px;" />
          <span style="margin-left: 10px; color: #909399; font-size: 13px;">미터 (예: 100m)</span>
          <p class="form-help-text">해당 GPS 좌표를 중심으로 출퇴근을 인정할 거리를 미터 단위로 입력하세요.</p>
        </el-form-item>
        <el-form-item label="IP 주소">
          <el-input
            v-model="locationForm.ipAddress"
            placeholder="예: 192.168.1.0/24 또는 192.168.1.100"
            maxlength="100"
          />
          <p class="form-help-text">단일 IP 또는 CIDR 표기법 (예: 192.168.1.0/24)</p>
        </el-form-item>
        <el-form-item label="WiFi SSID">
          <el-input
            v-model="locationForm.wifiSsid"
            placeholder="예: HONE-Dev-3F"
            maxlength="100"
          />
          <p class="form-help-text">WiFi 네트워크 이름 (SSID). 모바일 기기 출퇴근 인증에 사용됩니다.</p>
        </el-form-item>
        <el-form-item label="WiFi BSSID (선택)">
          <el-input
            v-model="locationForm.wifiBssid"
            placeholder="예: AA:BB:CC:DD:EE:FF"
            maxlength="100"
          />
          <p class="form-help-text">WiFi MAC 주소 (BSSID). 더 정확한 인증이 필요한 경우 입력하세요.</p>
        </el-form-item>
        <el-form-item label="활성 상태" v-if="!isEditing">
          <el-switch v-model="locationForm.isActive" active-text="활성" inactive-text="비활성" />
        </el-form-item>
        <el-form-item label="설명">
          <el-input
            v-model="locationForm.description"
            type="textarea"
            :rows="3"
            placeholder="근무지에 대한 추가 설명 (선택 사항)"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="locationDialogVisible = false">취소</el-button>
        <el-button type="primary" @click="saveLocation" :loading="isSubmitting">저장</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';
import {
  getWorkLocations,
  createWorkLocation,
  updateWorkLocation,
  toggleWorkLocationActive,
  deleteWorkLocation
} from '@/api/attendance';
import { ElMessageBox } from 'element-plus';

// Promise 기반의 동적 스크립트 로더
const loadScript = (src, id) => {
  return new Promise((resolve, reject) => {
    // ID로 이미 스크립트가 존재하는지 확인
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`${src} 스크립트 로드 실패`));
    document.head.appendChild(script);
  });
};

export default {
  name: 'WorkLocationManagement',
  setup() {
    const { success, error, warning } = useSnackbar();
    const formRef = ref(null);
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const locationDialogVisible = ref(false);
    const isEditing = ref(false);
    const editingId = ref(null);

    const locations = ref([]);
    const pagination = ref({
      page: 0,
      size: 20,
      totalElements: 0,
    });

    const locationForm = reactive({
      name: '',
      address: '',
      latitude: null,
      longitude: null,
      gpsRadius: null,
      ipAddress: '',
      wifiSsid: '',
      wifiBssid: '',
      isActive: true,
      description: '',
    });

    const formRules = {
      name: [{ required: true, message: '장소명은 필수입니다', trigger: 'blur' }],
    };

    // 근무지 목록 조회
    const fetchLocations = async (page = 0) => {
      isLoading.value = true;
      try {
        const response = await getWorkLocations({ page, size: pagination.value.size });
        locations.value = response.content;
        pagination.value = {
          page: response.number,
          size: response.size,
          totalElements: response.totalElements,
        };
      } catch (err) {
        error('근무지 목록을 불러오는데 실패했습니다: ' + err.message);
      } finally {
        isLoading.value = false;
      }
    };

    const openLocationDialog = (location = null) => {
      if (location) {
        isEditing.value = true;
        editingId.value = location.workLocationId;
        Object.assign(locationForm, {
          name: location.name,
          address: location.address || '',
          latitude: location.latitude,
          longitude: location.longitude,
          gpsRadius: location.gpsRadius,
          ipAddress: location.ipAddress || '',
          wifiSsid: location.wifiSsid || '',
          wifiBssid: location.wifiBssid || '',
          description: location.description || '',
        });
      } else {
        isEditing.value = false;
        editingId.value = null;
        resetForm();
      }
      locationDialogVisible.value = true;
    };

    const saveLocation = async () => {
      if (!formRef.value) return;

      await formRef.value.validate(async (valid) => {
        if (!valid) {
          warning('필수 항목을 입력해주세요.');
          return;
        }

        isSubmitting.value = true;
        try {
          const data = {
            name: locationForm.name,
            address: locationForm.address || null,
            latitude: locationForm.latitude,
            longitude: locationForm.longitude,
            gpsRadius: locationForm.gpsRadius,
            ipAddress: locationForm.ipAddress || null,
            wifiSsid: locationForm.wifiSsid || null,
            wifiBssid: locationForm.wifiBssid || null,
            isActive: locationForm.isActive,
            description: locationForm.description || null,
          };

          if (isEditing.value) {
            await updateWorkLocation(editingId.value, data);
            success('근무지가 성공적으로 수정되었습니다.');
          } else {
            await createWorkLocation(data);
            success('새 근무지가 성공적으로 추가되었습니다.');
          }

          locationDialogVisible.value = false;
          fetchLocations(pagination.value.page);
        } catch (err) {
          error('작업 중 오류가 발생했습니다: ' + err.message);
        } finally {
          isSubmitting.value = false;
        }
      });
    };

    const openAddressSearch = async () => {
      try {
        // ✅ Daum 주소 스크립트 로드
        await loadScript(
          '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js',
          'kakao-postcode-script'
        );

        new window.daum.Postcode({
          oncomplete: async (data) => {
            // ✅ 주소 문자열 파싱
            let fullAddress = data.address;
            let extraAddress = '';

            if (data.addressType === 'R') {
              if (data.bname) extraAddress += data.bname;
              if (data.buildingName)
                extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
              if (extraAddress) fullAddress += ` (${extraAddress})`;
            }

            locationForm.address = fullAddress;

            // ✅ 카카오 SDK 로드
            try {
              // autoload=false 파라미터를 추가하여 SDK의 자동 로딩을 막습니다.
              const sdkSrc = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.VUE_APP_KAKAO_APP_KEY}&libraries=services&autoload=false`;
              await loadScript(sdkSrc, 'kakao-sdk-script');

              // kakao.maps.load를 사용하여 라이브러리 로딩이 완료되면 콜백을 실행합니다.
              window.kakao.maps.load(() => {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.addressSearch(data.address, (result, status) => {
                  if (status === window.kakao.maps.services.Status.OK) {
                    locationForm.latitude = parseFloat(result[0].y);
                    locationForm.longitude = parseFloat(result[0].x);
                    success('주소와 GPS 좌표가 자동으로 입력되었습니다.');
                  } else {
                    error('주소로 GPS 좌표를 찾는 데 실패했습니다. 직접 입력해주세요.');
                    locationForm.latitude = null;
                    locationForm.longitude = null;
                  }
                });
              });
            } catch (sdkError) {
              error(sdkError.message);
            }
          },
        }).open();

      } catch (postcodeError) {
        error(postcodeError.message);
      }
};

    
    const toggleActive = async (workLocationId) => {
      try {
        await toggleWorkLocationActive(workLocationId);
        success('상태가 변경되었습니다.');
        fetchLocations(pagination.value.page);
      } catch (err) {
        error('상태 변경에 실패했습니다: ' + err.message);
      }
    };

    const deleteLocation = async (workLocationId) => {
      try {
        await ElMessageBox.confirm(
          '이 근무지를 삭제하시겠습니까? 출장 신청 등에서 참조 중일 경우 문제가 발생할 수 있습니다.',
          '삭제 확인',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
          }
        );

        await deleteWorkLocation(workLocationId);
        success('근무지가 삭제되었습니다.');
        fetchLocations(pagination.value.page);
      } catch (err) {
        if (err !== 'cancel') {
          error('삭제에 실패했습니다: ' + err.message);
        }
      }
    };

    const handlePageChange = (page) => {
      fetchLocations(page - 1);
    };

    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
      Object.assign(locationForm, {
        name: '',
        address: '',
        latitude: null,
        longitude: null,
        gpsRadius: null,
        ipAddress: '',
        wifiSsid: '',
        wifiBssid: '',
        isActive: true,
        description: '',
      });
    };

    onMounted(() => {
      fetchLocations();
    });

    return {
      formRef,
      isLoading,
      isSubmitting,
      locations,
      pagination,
      locationDialogVisible,
      isEditing,
      locationForm,
      formRules,
      openLocationDialog,
      saveLocation,
      openAddressSearch,
      toggleActive,
      deleteLocation,
      handlePageChange,
    };
  },
};
</script>

<style scoped>
.work-location-management {
  max-width: 1400px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.location-table {
  padding: 24px;
}

.form-help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
