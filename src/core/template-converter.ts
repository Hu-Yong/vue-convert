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

  private convertElement(node: ElementNode) {
    const originalTag = node.tag;
    const componentMap = this.config.componentMap[originalTag];

    if (componentMap) {
      // 步骤1：处理组件自身转换
      node.tag = componentMap.name;
      this.convertAttributes(node, componentMap);

      // 步骤2：处理子组件合并
      if (componentMap.children) {
        this.processChildren(node, componentMap);
      }

      // 步骤3：生成兄弟组件
      // if (componentMap.siblings) {
      //   this.generateSiblings(node, componentMap);
      // }
    }
  }

  /** 处理子组件合并逻辑 */
  private processChildren(node: ElementNode, config: ComponentMap[string]) {
    config.children?.forEach(childRule => {
      const childIndex = node.children.findIndex(child =>
        child.type === NodeTypes.ELEMENT &&
        child.tag === childRule.selector
      );

      if (childIndex !== -1) {
        const childNode = node.children[childIndex] as ElementNode;

        // 合并处理策略
        switch (childRule.handler) {
          case 'merge':
            this.mergeChildAttributes(node, childNode, childRule);
            node.children.splice(childIndex, 1); // 移除原子组件
            break;

          case 'wrap':
            // todo 
            //this.wrapChildComponent(childNode, childRule);
            break;

          case 'transform':
            // todo 
            //this.transformChildComponent(childNode, childRule);
            break;
        }
      }
    });
  }

  private mergeChildAttributes(
    parent: ElementNode,
    child: ElementNode,
    //@ts-ignore
    rule: ComponentConfig['children'][0]
  ) {
    // 合并属性和指令
    child.props.forEach(prop => {
      // 同时处理 ATTRIBUTE（属性） 和 DIRECTIVE（指令）类型的属性
      if ([NodeTypes.ATTRIBUTE, NodeTypes.DIRECTIVE].includes(prop.type)) {
        // 根据规则映射属性/指令名称，如将 model 映射为 bind:value
        const mappedName = rule.props?.[prop.name] || prop.name;
        console.log(`Merging ${prop.type} ${prop.name} to ${mappedName}`);
        parent.props.push({
          ...prop, // 保留原属性（包括修饰符、参数等）
          name: mappedName
        });
      }
    });

    // 合并内容
    if (child.children.length > 0) {
      parent.children.push(...child.children);
    }
  }


  /** 生成兄弟组件 */
  // private generateSiblings(node: ElementNode, config: ComponentMap[string]) {
  //   const parent = this.findParentElement(node);

  //   config.siblings?.forEach(siblingConfig => {
  //     const newSibling = this.createSiblingElement(node, siblingConfig);
  //     parent?.children.push(newSibling);
  //   });
  // }

  /** 创建兄弟节点 */
  // private createSiblingElement(
  //   original: ElementNode,
  //   config: ComponentMap['siblings'][0]
  // ): ElementNode {
  //   return {
  //     type: NodeTypes.ELEMENT,
  //     tag: config.component,
  //     props: Object.entries(config.props).map(([name, value]) => ({
  //       type: NodeTypes.ATTRIBUTE,
  //       name,
  //       value: {
  //         type: NodeTypes.TEXT,
  //         content: value
  //       }
  //     })),
  //     children: typeof config.children === 'function'
  //       ? config.children(original.children)
  //       : []
  //   };
  // }

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
        //console.log(`Converting attribute ${attr.name} to ${attr.value.content}`);
      }
    } else if (newName) {
      //console.log(`Renaming attribute ${attr.name} to ${newName}`);
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
          //console.log(`Converting event ${originalEvent} to ${newEvent}`);
          dir.arg.content = newEvent;
        }
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
    if ('name' in attr && attr.type === NodeTypes.ATTRIBUTE) {
      if ('value' in attr && attr.value) {
        return ` ${attr.name}="${attr.value.content}"`;
      }
      return ` ${attr.name}`;
    } else if ((attr as DirectiveNode).type === NodeTypes.DIRECTIVE) {
      const directive = attr as DirectiveNode; // 这里明确转换类型
      const expContent = directive.exp?.type === NodeTypes.SIMPLE_EXPRESSION ? directive.exp.content : '';
      const argContent = directive.arg?.type === NodeTypes.SIMPLE_EXPRESSION ? directive.arg.content : '';

      switch (directive.name) {
        case 'on':  // **事件指令 @click="handler"**
          return ` @${argContent}="${expContent}"`;

        case 'bind':  // **绑定指令 :prop="value"**
          return ` :${argContent}="${expContent}"`;

        case 'for':  // **列表渲染 v-for**
          return ` v-for="${expContent}"`;

        default:  // 其他指令，如 `v-if`
          return ` v-${directive.name}${argContent ? `:${argContent}` : ''}="${expContent}"`;
      }
    }
    return '';
  }
}
