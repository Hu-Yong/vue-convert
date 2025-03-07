export type PropConverter = 
  // PropConverter 类型可以是字符串或一个接受字符串并返回字符串的函数
  | string 
  | ((value: string) => string)

// ComponentMap 接口定义了组件的映射关系
export interface ComponentMap {
    // 键是组件名称，值可以是字符串或一个对象
    [key: string]: string | {
      // 组件的名称
      name: string
      // 可选的属性映射，键是属性名称，值是 PropConverter 类型
      props?: Record<string, PropConverter>
      // 可选的事件映射，键是事件名称，值是字符串
      events?: Record<string, string>
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