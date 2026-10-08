import { describe, expect, test } from 'vitest'
import { browserLogs, isBuild, page } from '~utils'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

describe.runIf(isBuild)('build', () => {
  test('dynamic import', async () => {
    await page.waitForSelector('#done')
    expect(await page.textContent('#done')).toBe('ran js')
  })

  // #10781
  test('dynamically imported chunk is fetched once', async () => {
    const helloChunkRequests: string[] = []
    const onRequest = (request: { url(): string }) => {
      if (/\/hello-[-\w]{8}\.js/.test(request.url())) {
        helloChunkRequests.push(request.url())
      }
    }
    page.on('request', onRequest)
    try {
      await page.click('#hello .load')
      await page.waitForSelector('#hello output')
    } finally {
      page.off('request', onRequest)
    }

    expect(helloChunkRequests).toHaveLength(1)

    const html = await page.content()
    // the chunk is preloaded at the URL `import()` resolves to
    expect(html).toMatch(
      /link rel="modulepreload".*?href="http[^"]*?\/assets\/hello-[-\w]{8}\.js"/,
    )
    // other deps still use the URL from `renderBuiltUrl`
    expect(html).toMatch(
      /link rel="stylesheet".*?href="http[^"]*?\/assets\/hello-[-\w]{8}\.css\?render-built-url"/,
    )
  })
})
