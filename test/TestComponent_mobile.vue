
<template>
<div  class="el-container"><van-button  type="primary"  round  icon="el-icon-search"  on> Search </van-button><el-form  bind  label-width="80px"><el-form-item  label="Username"><van-field  model  placeholder="Enter username"  clearable></van-field></el-form-item><el-form-item  label="City"><el-select  model><el-option  for  bind  bind  bind></el-option></el-select></el-form-item></el-form><el-dialog  model  title="Tips"><p>{{ dialogContent }}</p></el-dialog></div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
  import { ElMessage } from "vant";
  
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
  