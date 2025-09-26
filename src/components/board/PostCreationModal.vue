<template>
  <el-dialog
    :model-value="visible"
    title="새 게시글 작성"
    width="600px"
    @update:modelValue="$emit('update:visible', false)"
    @closed="resetForm"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="제목">
        <el-input v-model="form.title" placeholder="게시글 제목을 입력하세요" />
      </el-form-item>
      <el-form-item label="카테고리">
        <el-select v-model="form.category" placeholder="카테고리 선택" style="width: 100%;">
          <el-option label="공지사항" value="notice" />
          <el-option label="자유게시판" value="free" />
          <el-option label="자료실" value="data" />
        </el-select>
      </el-form-item>
      <el-form-item label="내용">
        <el-input 
          v-model="form.content" 
          type="textarea" 
          :rows="8"
          placeholder="게시글 내용을 입력하세요."
        />
      </el-form-item>
      <el-form-item label="첨부파일">
        <el-upload
          action="#"
          :auto-upload="false"
          multiple
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          list-type="text"
        >
          <el-button type="primary">파일 선택</el-button>
          <template #tip>
            <div class="el-upload__tip">최대 5개 파일, 각 파일당 10MB 이하</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="submitPost">작성</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible', 'submit']);

const form = ref({
  title: '',
  category: '',
  content: '',
});

const fileList = ref([]);

const handleFileChange = (file, files) => {
  fileList.value = files;
};

const handleFileRemove = (file, files) => {
  fileList.value = files;
};

const submitPost = () => {
  emit('submit', {
    ...form.value,
    attachments: fileList.value.map(file => file.raw) // Pass raw file objects
  });
  emit('update:visible', false);
};

const resetForm = () => {
  form.value = {
    title: '',
    category: '',
    content: '',
  };
  fileList.value = [];
};

</script>

<style scoped>
/* No specific styles needed for now, Element Plus handles most of it */
</style>
