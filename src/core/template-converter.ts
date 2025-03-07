import { parse, ElementNode, AttributeNode, DirectiveNode, NodeTypes } from '@vue/compiler-dom'
import { ComponentMap, AttributeMap, ConversionConfig } from '../types'

// TemplateConverter 类用于将模板转换为目标组件库的模板
export class TemplateConverter {
  private ast: any
  private config: ConversionConfig

  // 构造函数，接受源模板字符串和转换配置
  constructor(private source: string, config: ConversionConfig) {
    this.config = config
  }

  // 解析模板字符串为 AST
  parse() {
    this.ast = parse(this.source, { comments: true })
    //打印抽象语法树
    //console.dir(this.ast, { depth: null })
  }

  // 转换模板并生成新的模板字符串
  convert() {
    this.traverseNodes(this.ast.children)
    return this.generate()
  }

  // 遍历 AST 节点
  private traverseNodes(nodes: any[]) {
    nodes.forEach(node => {
      if (node.type === 1) { // Element
        this.convertElement(node)
        if (node.children) {
          this.traverseNodes(node.children)
        }
      }
    })
  }

  // 转换元素节点
  private convertElement(node: ElementNode) {
    const originalTag = node.tag
    const componentConfig = this.config.componentMap[originalTag]

    if (componentConfig) {
      const newTag = typeof componentConfig === 'string' 
        ? componentConfig 
        : componentConfig.name
      
      node.tag = newTag
      console.log(`Converting <${originalTag}> to <${newTag}>`)
      this.convertAttributes(node, componentConfig)
    }
  }

  // 转换属性节点
  private convertAttributes(node: ElementNode, config: ComponentMap[string]) {
    node.props.forEach(prop => {
      if (prop.type === NodeTypes.ATTRIBUTE) {
        this.convertAttribute(prop, config)
      } else if (prop.type === NodeTypes.DIRECTIVE) {
        this.convertDirective(prop, config)
      }
    })
  }

  // 转换单个属性
  private convertAttribute(attr: AttributeNode, config: any) {
    // 获取属性映射表
    const attrMap = typeof config === 'object' ? config.props : {}
    // 查找属性的新名称
    const newName = attrMap?.[attr.name] || this.config.attributeMap[attr.name]

    // 如果是转换函数
    if (typeof newName === 'function') {
      if (attr.value) {
        attr.value.content = newName(attr.value.content)
        console.log(`Converting attribute ${attr.name} value to ${attr.value.content}`)
      }
    } else if (newName) {
      attr.name = newName
      console.log(`Converting attribute ${attr.name}`)
    }
  }

  // 转换指令节点
  private convertDirective(dir: DirectiveNode, config: any) {
    if (dir.name === 'on') {
      const eventMap = typeof config === 'object' ? config.events : {}
      const originalEvent = dir.arg?.type === NodeTypes.SIMPLE_EXPRESSION ? dir.arg.content : ''
      const newEvent = eventMap?.[originalEvent]

      if (newEvent) {
        if (dir.arg?.type === NodeTypes.SIMPLE_EXPRESSION) {
          dir.arg.content = newEvent
          console.log(`Converting event ${originalEvent} to ${newEvent}`)
        }
      }
    }
  }

  // 生成新的模板字符串
  private generate(): string {
    // 实现AST到字符串的转换（简化示例）
    return this.rebuildTemplate(this.ast)
  }

  // 递归重建模板字符串
  private rebuildTemplate(node: any): string {
     // 实际需要完整实现AST序列化
     if (node.type === NodeTypes.ELEMENT) {
        return `<${node.tag}${this.genProps(node.props)}>${node.children.map((child: any) => this.rebuildTemplate(child)).join('')}</${node.tag}>`
      } else if (node.type === NodeTypes.TEXT) {
        return node.content
      } else if (node.type === NodeTypes.COMMENT) {
        return `<!--${node.content}-->`
      }
      return ''
  }

  // 生成属性字符串
  private genProps(props: any[]): string {
    return props.map(prop => {
      if (prop.type === NodeTypes.ATTRIBUTE) {
        return ` ${prop.name}="${prop.value?.content}"`
      } else if (prop.type === NodeTypes.DIRECTIVE) {
        // 处理指令属性
        const arg = prop.arg ? `:${prop.arg.content}` : ''
        const exp = prop.exp ? `="${prop.exp.content}"` : ''
        return ` v-${prop.name}${arg}${exp}`
      }
      return ''
    }).join('')
  }
}