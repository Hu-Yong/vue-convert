import { Transform } from 'jscodeshift'
import { ComponentMap } from '../types'

// 创建一个脚本转换器，用于将 Element Plus 组件转换为 Vant 组件
export const createScriptConverter = (componentMap: ComponentMap): Transform => {
  return (file: { source: any }, api: { jscodeshift: any }) => {
    const j = api.jscodeshift
    const root = j(file.source)

    // 转换组件导入
    root.find(j.ImportDeclaration)
      .filter((path: { node: { source: { value: string } } }) => path.node.source.value === 'element-plus')
      .replaceWith((path: { node: { specifiers: any[] } }) => {
        return j.importDeclaration(
          path.node.specifiers.map((specifier: { type: string; imported: { name: any }; local: { name: any } }) => {
            if (specifier.type === 'ImportSpecifier') {
              const original = specifier.imported.name
              const mapped = getMappedComponent(original)
              return j.importSpecifier(
                j.identifier(mapped),
                j.identifier(specifier.local?.name || mapped)
              )
            }
            return specifier
          }),
          j.literal('vant')
        )
      })

    // 转换组件引用
    Object.entries(componentMap).forEach(([oldComp, newComp]) => {
      root.find(j.Identifier, { name: oldComp })
        .replaceWith(j.identifier(typeof newComp === 'string' ? newComp : newComp.name))
    })

    return root.toSource()
  }

  // 获取映射组件名称
  function getMappedComponent(original: string): string {
    for (const [key, value] of Object.entries(componentMap)) {
      if (typeof value === 'object' && value.name === original) {
        return value.name
      }
    }
    return original
  }
}
