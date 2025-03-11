import { parse, RootNode } from '@vue/compiler-dom';

// AST 节点接口定义
interface ASTNode {
    tag: string;
    props: Record<string, any>;
    events: Record<string, string>;
    children: ASTNode[];
    text?: string; // 处理文本插值
}

export class parseTemplate {
    private ast: RootNode;
    constructor(private source: string) {
        this.ast = parse(source, { comments: true });
    }

    /**
   * 递归转换 Vue AST 为自定义 AST
   * @param {Object} node Vue 解析的 AST 节点
   * @returns {Object} 自定义 AST 结构
   */
    private transformAST(node: {
        content: any; type: number; tag: any; props: any[]; children: any[];
    }) {
        if (node.type === 2) {
            // 纯文本节点
            return node.content;
        }
        if (node.type === 5) {
            // 插值节点（如 {{ name }}）
            return `{{ ${node.content.content} }}`;
        }
        if (node.type !== 1) return null; // 只处理元素节点

        let astNode: ASTNode = {
            tag: node.tag,
            props: {},
            children: [],
            events: {}
        };

        // 解析属性
        node.props.forEach((prop: { type: number; name: string; value: { content: boolean; }; arg: { content: any; }; exp: { content: string; }; }) => {

            if (prop.type === 6) {
                // 静态属性，如 label="City"
                astNode.props[prop.name] = prop.value?.content || true;
            } else if (prop.type === 7) {
                // 动态绑定，如 v-model、:key、v-for
                const directive = prop.name === "bind" ? `:${prop.arg.content}` : prop.name;
                astNode.props[directive] = prop.exp?.content || "";
            }
        });

        // 递归解析子节点
        node.children.forEach((child: any) => {
            const childAst = this.transformAST(child);
            if (childAst) {
                astNode.children.push(childAst);
            }
        });
        return astNode;
    }

    public customAst() {
        //@ts-ignore
        return this.ast.children.map((node) => this.transformAST(node)).filter(Boolean);
    }
} 
