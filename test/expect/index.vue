<template>
  <div class="van-container">
    <!-- 转换后的基础组件 -->
    <van-button type="primary" round icon="van-icon-search" @click="showMessage">
      Search
    </van-button>

    <!-- 转换后的表单组件 -->
    <van-form :model="form">
      <van-field v-model="form.username" label="Username" placeholder="Enter username" clearable />

      <van-field v-model="form.city" label="City" is-link readonly @click="showPicker = true" />

      <van-popup v-model="showPicker" position="bottom">
        <van-picker :columns="cities" @confirm="onConfirm" />
      </van-popup>
    </van-form>

    <!-- 转换后的反馈组件 -->
    <van-dialog v-model="dialogVisible" title="Tips">
      <p>{{ dialogContent }}</p>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { showToast } from 'vant'

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
const showPicker = ref(false)
const dialogContent = ref('Sample dialog content')

const showMessage = () => {
  showToast({ message: 'Operation successful' })
  dialogVisible.value = true
}

const onConfirm = (value: CityOption) => {
  form.city = value.value
  showPicker.value = false
}
</script>

<style scoped>
.van-container {
  padding: 10px;
}

.van-button {
  margin-bottom: 7.5px;
}

.van-form {
  width: 250px;
  border: 1px solid #ebedf0;
  padding: 10px;
  border-radius: 2px;
}

.van-field__control {
  height: 20px;
}
</style>