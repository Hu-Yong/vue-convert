<template>
  <div class="el-container"><van-button type="primary" round icon="el-icon-search" @click="showMessage"> Search
    </van-button><van-form :model="form" label-width="80px"><van-field label="Username" v-model="form.username"
        placeholder="Enter username" clearable></van-field><van-field label="City"><van-field
          v-model="form.city"><el-option v-for="item in cities" :key="item.value" :label="item.label"
            :value="item.value"></el-option></van-field></van-field></van-form><el-dialog v-model="dialogVisible"
      title="Tips">
      <p>{{ dialogContent }}</p>
    </el-dialog></div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

interface CityOption {
  value: string
  label: string
}

const form = reactive({
  username: '',
  city: ''
})

const cities = ref<CityOption[]>([
  { value: 'sh', label: 'Shanghai' },
  { value: 'bj', label: 'Beijing' }
])

const dialogVisible = ref(false)
const dialogContent = ref('Sample dialog content')

const showMessage = () => {
  ElMessage.success('Operation successful')
  dialogVisible.value = true
}
</script>

<style scoped>
.el-container {
  padding: 20px;
}

.el-button {
  margin-bottom: 15px;
}

.el-form {
  width: 500px;
  border: 1px solid #ebeef5;
  padding: 20px;
  border-radius: 4px;
}

.el-input__inner {
  height: 40px;
}
</style>