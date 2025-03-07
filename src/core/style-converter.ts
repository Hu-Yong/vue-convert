import postcss from 'postcss'
import { ConversionConfig } from '../types'

export class StyleConverter {
  constructor(private config: ConversionConfig) {}

  async convert(css: string): Promise<string> {
    return postcss([
      this.createProcessor(),
      this.pxToRem(),
      this.applyCustomRules()
    ]).process(css).then(result => result.css)
  }

  private createProcessor() {
    return {
      postcssPlugin: 'component-class-convert',
      Rule(rule: { selector: string }) {
        rule.selector = rule.selector
          .replace(/\.el-/g, '.van-')
          .replace(/\[class~="el-/g, '[class~="van-')
      }
    }
  }

  private pxToRem() {
    return {
      postcssPlugin: 'px-to-rem',
      Declaration(decl: { value: string }) {
        if (/\d+px/.test(decl.value)) {
          decl.value = decl.value.replace(/(\d+)px/g, (_: any, p1: any) => 
            `${Number(p1)/16}rem`
          )
        }
      }
    }
  }

  private applyCustomRules() {
    return {
      postcssPlugin: 'custom-rules',
      Rule: (rule: { selector: string }) => {
        this.config.styleRules.forEach(({ pattern, replacement }) => {
          rule.selector = rule.selector.replace(pattern, (typeof replacement === 'string' ? () => replacement : replacement))
        })
      }
    }
  }
}