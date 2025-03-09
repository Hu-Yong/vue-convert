export type ValueConverter = (value: string) => string

export interface ComponentMap {
  [key: string]: {
    /** 目标组件名称 */
    name: string
    /** 属性转换规则 */
    props?: Record<string, string | ValueConverter>
    // 可选的事件映射，键是事件名称，值是字符串
    events?: Record<string, string>
    /** 子组件处理规则 */
    children?: {
      /** 需要合并的子组件选择器 */
      selector: string
      /** 子组件属性映射 */
      props?: Record<string, string | ValueConverter>
      /** 如何处理子组件内容 */
      handler: 'merge' | 'wrap' | 'transform'
    }[]
    /** 需要创建的新组件 */
    siblings?: Array<{
      component: string
      condition?: (parentProps: any) => boolean
      props: Record<string, any>
      children?: string | ((originalChildren: any[]) => any[])
    }>
  }
}

// AttributeMap 接口定义了属性的映射关系
export interface AttributeMap {
  // 键是组件名称，值是一个对象
  [component: string]: {
    // 键是属性名称，值可以是字符串或一个接受字符串并返回字符串的函数
    [attr: string]: string | ((value: string) => string)
  }
}

// ConversionConfig 接口定义了转换配置
export interface ConversionConfig {
  // 组件映射，类型为 ComponentMap
  componentMap: ComponentMap
  // 属性映射，类型为 AttributeMap
  attributeMap: AttributeMap
  // 样式规则数组，每个元素是一个对象
  styleRules: Array<{
    // 正则表达式模式，用于匹配样式规则
    pattern: RegExp
    // 替换字符串或函数，接受子字符串和任意数量的参数并返回字符串
    replacement: string | ((substring: string, ...args: any[]) => string)
  }>
}