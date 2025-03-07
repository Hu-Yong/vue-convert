import { AttributeMap, ComponentMap } from "../types"

export const componentMap: ComponentMap = {
    'el-button': {
      name: 'van-button',
      props: {
        size: 'size',
        type: (val: string) => val === 'text' ? 'default' : val,
        round: 'round'
      },
      events: {
        click: 'click'
      }
    },
    'el-input': {
      name: 'van-field',
      props: {
        modelValue: 'model-value',
        placeholder: 'placeholder',
        clearable: 'clearable'
      }
    },
    // 其他组件配置...
  }
  
  export const attributeMap: AttributeMap = {
    'el-button': {
      'icon': 'icon',
      'loading': 'loading',
      'native-type': 'native-type'
    },
    // 其他属性配置...
  }