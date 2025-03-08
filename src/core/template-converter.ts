import { parse, ElementNode, AttributeNode, DirectiveNode, NodeTypes, RootNode } from '@vue/compiler-dom';
import { ComponentMap, AttributeMap, ConversionConfig } from '../types';

// TemplateConverter 类用于将 Vue 3 + Element Plus 代码转换为 Vant 代码
export class TemplateConverter {
  private ast: RootNode;
  private config: ConversionConfig;

  constructor(private source: string, config: ConversionConfig) {
    this.config = config;
    this.ast = parse(source, { comments: true });
  }

  // 解析并转换模板
  convert(): string {
    this.traverseNodes(this.ast.children);
    return this.generate();
  }

  // 遍历 AST 节点
  private traverseNodes(nodes: any[]) {
    nodes.forEach(node => {
      if (node.type === NodeTypes.ELEMENT) {
        this.convertElement(node);
        if (node.children) {
          this.traverseNodes(node.children);
        }
      }
    });
  }

  // 转换组件标签（Element Plus -> Vant）
  private convertElement(node: ElementNode) {
    const originalTag = node.tag;
    const componentConfig = this.config.componentMap[originalTag];

    if (componentConfig) {
      node.tag = typeof componentConfig === 'string' ? componentConfig : componentConfig.name;
      console.log(`Converting <${originalTag}> to <${node.tag}>`);
      this.convertAttributes(node, componentConfig);
    }
  }

  // 处理属性转换（Element Plus -> Vant）
  private convertAttributes(node: ElementNode, config: ComponentMap[string]) {
    node.props.forEach(prop => {
      if (prop.type === NodeTypes.ATTRIBUTE) {
        this.convertAttribute(prop, config);
      } else if (prop.type === NodeTypes.DIRECTIVE) {
        this.convertDirective(prop, config);
      }
    });
  }

  // 单个属性转换
  private convertAttribute(attr: AttributeNode, config: any) {
    const attrMap = typeof config === 'object' ? config.props : {};
    const newName = attrMap?.[attr.name] || this.config.attributeMap[attr.name];

    if (typeof newName === 'function') {
      if ('value' in attr && attr.value) {
        attr.value.content = newName(attr.value.content);
        console.log(`Converting attribute ${attr.name} to ${attr.value.content}`);
      }
    } else if (newName) {
      console.log(`Renaming attribute ${attr.name} to ${newName}`);
      attr.name = newName;
    }
  }

  // 处理 Vue 指令转换（如 `v-on`、`v-model`、`v-bind`）
  private convertDirective(dir: DirectiveNode, config: any) {
    if (dir.name === 'on') {
      // 事件绑定转换
      const eventMap = typeof config === 'object' ? config.events : {};
      const originalEvent = dir.arg?.type === NodeTypes.SIMPLE_EXPRESSION ? dir.arg.content : '';
      const newEvent = eventMap?.[originalEvent];

      if (newEvent) {
        if (dir.arg?.type === NodeTypes.SIMPLE_EXPRESSION) {
          console.log(`Converting event ${originalEvent} to ${newEvent}`);
          dir.arg.content = newEvent;
        }
      }
    } else if (dir.name === 'model') {
      // 处理 `v-model` 语法
      if (dir.exp?.type === NodeTypes.SIMPLE_EXPRESSION) {
        console.log(`Processing v-model for ${dir.exp.content}`);
      } else {
        console.log('Processing v-model');
      }
    } else if (dir.name === 'bind') {
      // 处理 `v-bind` 语法
      if (dir.arg?.type === NodeTypes.SIMPLE_EXPRESSION) {
        console.log(`Processing v-bind:${dir.arg.content}`);
      }
    }
  }

  // **生成新的 Vue 模板**
  private generate(): string {
    return this.rebuildTemplate(this.ast);
  }

  // **递归重建 Vue 模板**
  private rebuildTemplate(node: any): string {
    if (!node) return '';

    switch (node.type) {
      case NodeTypes.ROOT:
        return node.children.map(this.rebuildTemplate.bind(this)).join('');

      case NodeTypes.ELEMENT:
        const tag = node.tag;
        const attributes = node.props.map(this.rebuildAttribute.bind(this)).join(' ');
        const children = node.children.map(this.rebuildTemplate.bind(this)).join('');

        return `<${tag}${attributes ? ' ' + attributes : ''}>${children}</${tag}>`;

      case NodeTypes.TEXT:
        return node.content;

      case NodeTypes.INTERPOLATION:
        return `{{ ${node.content.content} }}`;

      case NodeTypes.COMPOUND_EXPRESSION:
        return node.children.map((child: any) =>
          typeof child === 'string' ? child : this.rebuildTemplate(child)
        ).join('');

      default:
        return '';
    }
  }

  // **转换属性节点**
  private rebuildAttribute(attr: AttributeNode | DirectiveNode): string {
    if ('name' in attr) {
      if ('value' in attr && attr.value) {
        return ` ${attr.name}="${attr.value.content}"`;
      }
      return ` ${attr.name}`;
    } else if ((attr as DirectiveNode).type === NodeTypes.DIRECTIVE) {
      const directive = attr as DirectiveNode; // 这里明确转换类型
      if (directive.arg) {
        const expContent = directive.exp?.type === NodeTypes.SIMPLE_EXPRESSION ? directive.exp.content : '';
        const argContent = directive.arg.type === NodeTypes.SIMPLE_EXPRESSION ? directive.arg.content : '';
        return ` :${argContent}="${expContent}"`;
      }
    }
    return '';
  }



  // **生成属性字符串**
  private genProps(props: any[]): string {
    return props.map(prop => {
      if (prop.type === NodeTypes.ATTRIBUTE) {
        return ` ${prop.name}="${prop.value?.content}"`;
      } else if (prop.type === NodeTypes.DIRECTIVE) {
        // 处理 `v-bind`、`v-model`、`v-if` 等指令
        const arg = prop.arg ? `:${prop.arg.content}` : '';
        const exp = prop.exp ? `="${prop.exp.content}"` : '';
        return ` v-${prop.name}${arg}${exp}`;
      }
      return '';
    }).join('');
  }
}
