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
  'el-form': {
    name: 'van-form'
  },
  // 表单字段合并转换
  'el-form-item': {
    name: 'van-field',
    children: [
      {
        selector: 'el-input',
        props: {
          modelValue: 'model-value',
          clearable: 'clearable',
          type: (val) => val === 'textarea' ? 'textarea' : 'text'
        },
        handler: 'merge' // 合并子组件属性到父组件
      }
    ],
    props: {
      label: 'label',       // 保留标签属性
      prop: ''              // 删除验证属性
    }
  },

  // 选择器组件转换
  'el-select': {
    name: 'van-field',
    props: {
      modelValue: 'model-value'
    },
    siblings: [
      {
        component: 'van-popup',
        props: { position: 'bottom' },
        children: (originalChildren) => [
          {
            component: 'van-picker',
            props: {
              columns: originalChildren
                .filter(child => child.tag === 'el-option')
                .map(option => ({
                  text: option.props?.label,
                  value: option.props?.value
                }))
            }
          }
        ]
      }
    ],
    children: [
      {
        selector: 'el-option',
        handler: 'transform' // 转换子组件为 picker 数据
      }
    ]
  },

  // 单选组转换
  'el-radio-group': {
    name: 'van-radio-group',
    children: [
      {
        selector: 'el-radio',
        props: {
          label: 'name',
          disabled: 'disabled'
        },
        handler: 'wrap' // 包裹为 van-radio
      }
    ]
  },

  // 复选框组转换
  'el-checkbox-group': {
    name: 'van-checkbox-group',
    children: [
      {
        selector: 'el-checkbox',
        props: {
          label: 'name',
          disabled: 'disabled'
        },
        handler: 'wrap' // 包裹为 van-checkbox
      }
    ]
  }
};
  
  export const attributeMap: AttributeMap = {
    'el-button': {
      'icon': 'icon',
      'loading': 'loading',
      'native-type': 'native-type'
    },
    // 其他属性配置...
  }