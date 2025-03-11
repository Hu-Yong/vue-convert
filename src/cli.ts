import fs from 'fs'
import { glob } from 'glob'
import { TemplateConverter } from './core/template-converter'
import jscodeshift from 'jscodeshift'
import { createScriptConverter } from './core/script-converter'
import { StyleConverter } from './core/style-converter'
import { componentMap, attributeMap } from './config/component-map'
import { parse } from 'path'
import { parseTemplate } from './utils/parse-template'

// 配置转换规则
const config = {
    componentMap,
    attributeMap,
    styleRules: [
        { pattern: /el-/g, replacement: 'van-' }, // 将 el- 前缀替换为 van-
        { pattern: /(\d+)px/g, replacement: (_: any, p1: number) => `${p1 / 2}px` } // 将 px 单位的值减半
    ]
}

// 处理单个文件
async function processFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const [template, script, style] = extractSections(content);

    const  customAst = new parseTemplate(template).customAst();
    console.log(JSON.stringify((customAst[0]), null, 2));

    // 转换模板
    // const templateConverter = new TemplateConverter(template, config)
    // const newTemplate = templateConverter.convert();

    // 转换脚本
    // const scriptConverter = createScriptConverter(config.componentMap)
    // const newScript = scriptConverter(script as any, {
    //     jscodeshift: jscodeshift.withParser('ts'),
    //     j: jscodeshift.withParser('ts'),
    //     stats: (message: string) => console.log(message),
    //     report: (message: string) => console.log(message)
    // }, {})

    // 转换样式
    // const styleConverter = new StyleConverter(config)
    // const newStyle = await styleConverter.convert(style)

    // 生成新文件内容
    const newContent = `
<template>
${template}
</template>

<script setup lang="ts">
${script}
</script>

<style scoped>
${style}
</style>
  `

    // 写入新文件
    fs.writeFileSync(filePath.replace('.vue', '_mobile.vue'), newContent)
}

// 提取模板、脚本和样式部分
function extractSections(content: string): [string, string, string] {
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)

    return [
        templateMatch?.[1]?.trim() || '',
        scriptMatch?.[1]?.trim() || '',
        styleMatch?.[1]?.trim() || ''
    ]
}

// 运行转换
glob.sync(process.argv[2]).forEach(file => {
    console.log(`Processing ${file}...`)
    processFile(file)
})