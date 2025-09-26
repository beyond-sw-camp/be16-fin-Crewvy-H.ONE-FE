<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'approve' ? '승인 코멘트' : '반려 사유 입력'"
    width="500px"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <el-form-item :label="mode === 'reject' ? '반려 사유' : '코멘트 (선택)'">
      <el-input
        type="textarea"
        v-model="localComment"
        :rows="4"
        :placeholder="mode === 'reject' ? '반려 사유를 입력해주세요.' : '승인 코멘트를 입력하세요 (선택 사항)'"
      ></el-input>
    </el-form-item>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="submitComment">확인</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'ApprovalCommentModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'approve', // 'approve' or 'reject'
    },
  },
  emits: ['update:visible', 'submit'],
  setup(props, { emit }) {
    const localComment = ref('');

    watch(() => props.visible, (newVal) => {
      if (newVal) {
        localComment.value = '';
      }
    });

    const submitComment = () => {
      emit('submit', localComment.value);
    };

    return { localComment, submitComment };
  },
};
</script>
