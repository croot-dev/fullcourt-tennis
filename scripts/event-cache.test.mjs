import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

function loadModule(file, dependencies) {
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`)
      return dependencies[name]
    },
    console: { error() {} },
    URL,
  }, { filename: file })
  return exports
}

for (const method of ['POST', 'PUT', 'DELETE']) {
  for (const fails of [false, true]) {
    test(`${method}: ${fails ? 'failed save preserves cache' : 'successful save invalidates home and schedule'}`, async () => {
      const calls = []
      const mutation = async () => {
        calls.push('save')
        if (fails) throw new Error('save failed')
        return { id: 1 }
      }
      const routes = loadModule(method === 'POST' ? 'src/app/api/event/route.ts' : 'src/app/api/event/[id]/route.ts', {
        'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
        'next/cache': { revalidatePath: path => calls.push(path) },
        '@/lib/auth.server': { withAuth: (req, handler) => handler(req, { memberId: '1', roleCode: 'ADMIN' }) },
        '@/lib/api.error': { handleApiError: () => ({ status: 500 }) },
        '@/domains/event': { writeEvent: mutation, modifyEvent: mutation, removeEvent: mutation },
        '@/domains/member': { getMemberById: async () => ({ seq: 1 }) },
        '@/lib/query.utils': {},
        '@/constants': { MEMBER_ROLE: { ADMIN: 'ADMIN', OPER: 'OPER' } },
      })
      const response = await routes[method]({ json: async () => ({ title: 'fixture' }) }, { params: Promise.resolve({ id: '1' }) })
      assert.equal(response.status, fails ? 500 : method === 'POST' ? 201 : 200)
      assert.deepEqual(calls, fails ? ['save'] : ['save', '/', '/schedule'])
    })
  }
}

for (const hook of ['useCreateEvent', 'useUpdateEvent', 'useDeleteEvent']) {
  test(`${hook}: refreshes server-rendered home after a successful mutation`, () => {
    const invalidations = []
    let refreshCount = 0
    const hooks = loadModule('src/hooks/useEvent.ts', {
      '@tanstack/react-query': {
        useQueryClient: () => ({ invalidateQueries: ({ queryKey }) => invalidations.push(Array.from(queryKey)) }),
        useMutation: options => options,
      },
      '@/lib/api.client': {},
      'next/navigation': { useRouter: () => ({ refresh: () => refreshCount++ }) },
    })
    hooks[hook]().onSuccess({}, { id: 1 })
    assert.equal(refreshCount, 1)
    assert.ok(invalidations.some(key => key.join('/') === 'events/list'))
  })
}
