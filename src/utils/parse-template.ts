import { AttributeNode, DirectiveNode, parse, RootNode } from '@vue/compiler-dom';

// AST 节点接口定义
interface ASTNode {
    tag: string;
    props: Record<string, any>;
    events: Record<string, string>;
    children: ASTNode[];
    text?: string; // 处理文本插值
    slots?: Record<string, ASTNode>; // 处理插槽
}

export class parseTemplate {
    private ast: RootNode;
    constructor(private source: string) {
        this.ast = parse(source, { comments: true });
    }

    /**
     * 递归转换 Vue AST 为自定义 AST
     * @param node Vue 解析的 AST 节点
     * @returns 自定义 AST 结构
     */
    private transformAST(node: any): ASTNode | string | null {
        if (node.type === 2) {
            // 纯文本节点
            return node.content.trim() ? node.content : null;
        }

        if (node.type === 5) {
            // 插值节点（如 {{ name }}）
            return `{{ ${node.content.content} }}`;
        }

        if (node.type !== 1) return null; // 只处理元素节点

        let astNode: ASTNode = {
            tag: node.tag,
            props: {},
            events: {},
            children: [],
            slots: {}, // 存储插槽
        };

        let slotName = "";

        node.props.forEach((prop: AttributeNode | DirectiveNode) => {
            if (prop.type === 6) {
                // 静态属性，如 placeholder="Select"
                astNode.props[prop.name] = prop.value?.content || true;
            } else if (prop.type === 7) {
                if (prop.name === "bind") {
                    //@ts-ignore
                    astNode.props[`:${prop.arg.content}`] = prop.exp?.content || "";
                } else if (prop.name === "on") {
                    //@ts-ignore
                    astNode.events[`@${prop.arg.content}`] = prop.exp?.content || "";
                } else if (prop.name === "slot") {
                    console.log(prop); 
                    //@ts-ignore
                    slotName = prop.arg?.content || "default";
                    //@ts-ignore
                } else if (prop.name === "bind" && prop.arg?.content === "slot") {
                    //@ts-ignore
                    slotName = prop.exp?.content || "default";
                } else {
                    //@ts-ignore
                    astNode.props[prop.name] = prop.exp?.content || "";
                }
            }
        });

        node.children.forEach((child: any) => {
            const childAst = this.transformAST(child);
            if (childAst) {
                if (slotName) {
                    astNode.slots![slotName] = astNode.slots![slotName] || { tag: "template", children: [] };
                    //@ts-ignore
                    astNode.slots![slotName].children.push(childAst);
                } else {
                    //@ts-ignore
                    astNode.children.push(childAst);
                }
            }
        });

        return astNode;
    }

    public customAst() {
        //@ts-ignore
        return this.ast.children.map((node) => this.transformAST(node)).filter(Boolean);
    }
} 
