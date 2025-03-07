<template>
    <div class="el-container">
      <!-- 基础组件 -->
      <el-button 
        type="primary" 
        round 
        icon="el-icon-search"
        @click="showMessage"
      >
        Search
      </el-button>
  
      <!-- 表单组件 -->
      <el-form :model="form" label-width="80px">
        <el-form-item label="Username">
          <el-input 
            v-model="form.username" 
            placeholder="Enter username"
            clearable
          />
        </el-form-item>
  
        <el-form-item label="City">
          <el-select v-model="form.city">
            <el-option
              v-for="item in cities"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
  
      <!-- 反馈组件 -->
      <el-dialog v-model="dialogVisible" title="Tips">
        <p>{{ dialogContent }}</p>
      </el-dialog>
    </div>
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