<template>
  <div class="rule-block">
    <div v-for="(method, index) in rule.methods" :key="index" class="auth-method-item">
      <el-form-item :label="'인증 방법 #' + (index + 1)">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-select v-model="method.deviceType" placeholder="기기 타입">
              <el-option label="모바일" value="MOBILE"></el-option>
              <el-option label="PC/노트북" value="LAPTOP"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="method.authMethod" placeholder="인증 방식">
              <el-option label="GPS" value="GPS" :disabled="method.deviceType !== 'MOBILE'"></el-option>
              <el-option label="IP" value="NETWORK_IP" :disabled="method.deviceType !== 'LAPTOP'"></el-option>
            </el-select>
          </el-col>
          <el-col :span="10">
            <!-- 상세 설정 (추후 구현) -->
          </el-col>
          <el-col :span="2">
            <el-button type="danger" @click="removeMethod(index)" circle><el-icon><Delete /></el-icon></el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </div>
    <el-button @click="addMethod" style="width: 100%;">+ 인증 방법 추가</el-button>
  </div>
</template>

<script>
export default {
  name: 'AuthRuleBlock',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    rule: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    addMethod() {
      if (!this.rule.methods) {
        this.rule.methods = [];
      }
      this.rule.methods.push({
        deviceType: 'MOBILE',
        authMethod: 'GPS',
        details: {}
      });
    },
    removeMethod(index) {
      this.rule.methods.splice(index, 1);
    }
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
</style>
