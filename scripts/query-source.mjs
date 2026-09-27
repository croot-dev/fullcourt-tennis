import { readFileSync } from 'node:fs'
import ts from 'typescript'

// Read the application's actual SQL template so evaluation does not drift from code.
export function readQuery(file, functionName, values) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const fn = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === functionName)
  if (!fn) throw new Error(`Query function missing: ${functionName}`)
  let template
  function visit(node) {
    if (ts.isTaggedTemplateExpression(node) && node.tag.getText(source) === 'sql') template = node.template
    ts.forEachChild(node, visit)
  }
  visit(fn)
  if (!template || !ts.isTemplateExpression(template)) throw new Error('Expected a parameterized SQL template')
  const params = []
  let text = template.head.text
  for (const span of template.templateSpans) {
    const key = span.expression.getText(source)
    if (!Object.hasOwn(values, key)) throw new Error(`Missing query parameter: ${key}`)
    params.push(values[key])
    text += `$${params.length}${span.literal.text}`
  }
  return { text, params }
}
