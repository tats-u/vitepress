import { generateAlternateLinks } from 'shared/shared'
import type { SiteData } from 'shared/shared'

function createSiteData(overrides: Partial<SiteData> = {}): SiteData {
  return {
    base: '/',
    lang: 'en-US',
    dir: 'ltr',
    title: 'Test',
    description: '',
    head: [],
    appearance: true,
    themeConfig: {},
    scrollOffset: 0,
    locales: {},
    router: { prefetchLinks: true },
    ...overrides
  } as SiteData
}

describe('generateAlternateLinks', () => {
  test('returns empty array when no locales are configured', () => {
    const siteData = createSiteData({ locales: {} })
    expect(generateAlternateLinks(siteData, 'guide.md')).toEqual([])
  })

  test('returns empty array when only one locale is configured', () => {
    const siteData = createSiteData({
      locales: {
        root: { label: 'English', lang: 'en-US' }
      }
    })
    expect(generateAlternateLinks(siteData, 'guide.md')).toEqual([])
  })

  test('generates alternate links for other locales (root page)', () => {
    const siteData = createSiteData({
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' },
        ja: { label: '日本語', lang: 'ja-JP' }
      }
    })
    const result = generateAlternateLinks(siteData, 'guide.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/fr/guide.html' }],
      ['link', { rel: 'alternate', hreflang: 'ja-JP', href: '/ja/guide.html' }]
    ])
  })

  test('generates alternate links from non-root locale', () => {
    const siteData = createSiteData({
      localeIndex: 'fr',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' },
        ja: { label: '日本語', lang: 'ja-JP' }
      }
    })
    const result = generateAlternateLinks(siteData, 'fr/guide.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'en-US', href: '/guide.html' }],
      ['link', { rel: 'alternate', hreflang: 'ja-JP', href: '/ja/guide.html' }]
    ])
  })

  test('handles index pages correctly', () => {
    const siteData = createSiteData({
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' }
      }
    })
    const result = generateAlternateLinks(siteData, 'index.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/fr/' }]
    ])
  })

  test('handles nested index pages correctly', () => {
    const siteData = createSiteData({
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' }
      }
    })
    const result = generateAlternateLinks(siteData, 'guide/index.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/fr/guide/' }]
    ])
  })

  test('respects cleanUrls option', () => {
    const siteData = createSiteData({
      cleanUrls: true,
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' }
      }
    })
    const result = generateAlternateLinks(siteData, 'guide.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/fr/guide' }]
    ])
  })

  test('includes base path in href', () => {
    const siteData = createSiteData({
      base: '/docs/',
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' }
      }
    })
    const result = generateAlternateLinks(siteData, 'guide.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/docs/fr/guide.html' }]
    ])
  })

  test('skips locales without lang defined', () => {
    const siteData = createSiteData({
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français' } as any
      }
    })
    const result = generateAlternateLinks(siteData, 'guide.md')
    expect(result).toEqual([])
  })

  test('uses custom locale link paths', () => {
    const siteData = createSiteData({
      localeIndex: 'root',
      locales: {
        root: { label: 'English', lang: 'en-US', link: '/' },
        fr: { label: 'Français', lang: 'fr-FR', link: '/french/' }
      }
    })
    const result = generateAlternateLinks(siteData, 'guide.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/french/guide.html' }]
    ])
  })

  test('falls back to getLocaleForPath when localeIndex is not set', () => {
    const siteData = createSiteData({
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR' }
      }
    })
    const result = generateAlternateLinks(siteData, 'guide.md')
    expect(result).toEqual([
      ['link', { rel: 'alternate', hreflang: 'fr-FR', href: '/fr/guide.html' }]
    ])
  })
})
