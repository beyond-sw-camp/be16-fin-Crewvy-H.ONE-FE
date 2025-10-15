<template>
  <div class="rule-block">
    <div v-for="(method, index) in rule.methods" :key="index" class="auth-method-item">
      <el-form-item :label="'인증 방법 #' + (index + 1)">
        <div class="auth-method-row">
          <el-select v-model="method.combinedType" placeholder="인증 방법 선택" @change="onTypeChange(method)" class="auth-method-select">
            <el-option label="모바일 (GPS)" value="MOBILE_GPS"></el-option>
            <el-option label="PC/노트북 (IP)" value="LAPTOP_IP"></el-option>
          </el-select>
          <el-button @click="method.showDetails = !method.showDetails" circle><el-icon><Setting /></el-icon></el-button>
          <el-button type="danger" @click="removeMethod(index)" circle><el-icon><Delete /></el-icon></el-button>
        </div>
      </el-form-item>

      <!-- 상세 설정 영역 -->
      <div v-if="method.showDetails" class="details-panel">
        <!-- GPS 상세 설정 -->
        <div v-if="method.authMethod === 'GPS'">
            <el-form-item label="위도/경도">
              <el-row :gutter="10" align="middle">
                <el-col :span="8">
                  <el-input v-model.number="method.details.officeLatitude" type="number" placeholder="위도"></el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model.number="method.details.officeLongitude" type="number" placeholder="경도"></el-input>
                </el-col>
                <el-col :span="8">
                  <el-button @click="openMapModal(method)" style="width: 100%;">지도에서 선택</el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="허용 반경 (미터)">
              <el-input-number v-model="method.details.gpsRadiusMeters" :min="10" />
            </el-form-item>
          </div>
          <!-- IP 상세 설정 -->
          <div v-if="method.authMethod === 'NETWORK_IP'">
            <el-form-item label="허용 IP 주소">
              <el-select
                v-model="method.details.allowedIps"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="IP 주소를 입력하고 Enter"
                style="width: 100%;"
              ></el-select>
            </el-form-item>
          </div>
        </div>
      </div>
    </div>
    <el-button @click="addMethod" style="width: 100%;">+ 인증 방법 추가</el-button>

    <MapSelectorModal
      v-if="mapModalVisible"
      v-model:visible="mapModalVisible"
      :initial-lat="currentMethod?.details.officeLatitude"
      :initial-lng="currentMethod?.details.officeLongitude"
      @location-selected="handleLocationSelected"
    />
</template>

<script>
import { ref, computed } from 'vue';
import MapSelectorModal from './MapSelectorModal.vue';

export default {
  name: 'AuthRuleBlock',
  components: {
    MapSelectorModal
  },
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const mapModalVisible = ref(false);
    const currentMethod = ref(null);

    const rule = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    const addMethod = () => {
      if (!rule.value.methods) {
        rule.value.methods = [];
      }
      rule.value.methods.push({
        combinedType: 'MOBILE_GPS',
        deviceType: 'MOBILE',
        authMethod: 'GPS',
        details: {
          officeLatitude: null,
          officeLongitude: null,
          gpsRadiusMeters: 100,
          allowedIps: []
        },
        showDetails: false
      });
    };

    const removeMethod = (index) => {
      rule.value.methods.splice(index, 1);
    };

    const onTypeChange = (method) => {
      const [deviceType, authMethod] = method.combinedType.split('_');
      method.deviceType = deviceType;
      method.authMethod = authMethod === 'IP' ? 'NETWORK_IP' : authMethod;
      
      method.details = {
        officeLatitude: null,
        officeLongitude: null,
        gpsRadiusMeters: 100,
        allowedIps: []
      };
    };

    const openMapModal = (method) => {
      console.log('openMapModal called');
      currentMethod.value = method;
      mapModalVisible.value = true;
    };

    const handleLocationSelected = (location) => {
      if (currentMethod.value) {
        currentMethod.value.details.officeLatitude = location.lat;
        currentMethod.value.details.officeLongitude = location.lng;
      }
    };

    return {
      rule,
      mapModalVisible,
      currentMethod,
      addMethod,
      removeMethod,
      onTypeChange,
      openMapModal,
      handleLocationSelected,
    };
  }
};
</script>

<style scoped>
.rule-block {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 10px;
}
.auth-method-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e4e7ed;
}
.auth-method-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.auth-method-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.auth-method-select {
  flex-grow: 1; /* 남은 공간을 모두 차지 */
}
.details-panel {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 4px;
  margin-top: 10px;
}
</style>