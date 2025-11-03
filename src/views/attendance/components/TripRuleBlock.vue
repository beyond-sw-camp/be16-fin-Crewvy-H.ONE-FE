<template>
  <div class="rule-block">
    <el-form-item label="출장 종류">
      <el-input v-model="rule.type" placeholder="예: 국내, 해외"></el-input>
    </el-form-item>
    <el-form-item label="일비 (Per Diem)">
      <el-input-number v-model="rule.perDiemAmount" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="숙박비 한도">
      <el-input-number v-model="rule.accommodationLimit" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="교통비 한도">
      <el-input-number v-model="rule.transportationLimit" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="허용 출장지">
      <el-select v-model="rule.allowedWorkLocations" multiple placeholder="출장지를 선택하세요 (선택하지 않으면 모든 출장지 허용)" style="width: 100%;">
        <el-option v-for="location in workLocations" :key="location.workLocationId" :label="location.name" :value="location.name" />
      </el-select>
      <div class="help-text">특정 출장지만 허용하려면 선택하세요. 선택하지 않으면 모든 출장지가 허용됩니다.</div>
    </el-form-item>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getActiveWorkLocations } from '@/api/attendance';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'TripRuleBlock',
  props: { modelValue: { type: Object, required: true } },
  emits: ['update:modelValue'],
  setup() {
    const workLocations = ref([]);
    const { error } = useSnackbar();

    const fetchWorkLocations = async () => {
      try {
        workLocations.value = await getActiveWorkLocations();
      } catch (err) {
        error(err.message || '근무지 목록을 불러오는 데 실패했습니다.');
      }
    };

    onMounted(() => {
      fetchWorkLocations();
    });

    return {
      workLocations,
    };
  },
  computed: {
    rule: {
      get() { return this.modelValue; },
      set(value) { this.$emit('update:modelValue', value); }
    }
  }
};
</script>

<style scoped>
.rule-block { padding: 16px; border: 1px solid #e4e7ed; border-radius: 4px; margin-top: 10px; }
.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
