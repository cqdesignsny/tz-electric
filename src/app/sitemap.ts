import type { MetadataRoute } from 'next'

const BASE_URL = 'https://tzelectricinc.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/about-us', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact-us', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/reviews', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/gallery', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/financing', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/promotions', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/careers', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/signature-plans', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/maintenance', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/service-areas', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/emergency', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms-condition', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/accessibility-statement', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/refund-cancellation-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  // Main service pages
  const servicePages = [
    '/electrical',
    '/hvac',
    '/mitsubishi',
    '/mini-split',
    '/plumbing',
    '/generator',
    '/hot-water-heaters',
  ].map((url) => ({
    url,
    priority: 0.9,
    changeFrequency: 'monthly' as const,
  }))

  // Sub-service pages (electrical)
  const electricalSubs = [
    'ev-chargers',
    'panel-upgrade',
    'house-rewire',
    'home-electrical-services',
    'indoor-electrical',
  ].map((slug) => ({
    url: `/electrical/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  // Sub-service pages (hvac)
  const hvacSubs = [
    'central-air',
    'ducted-systems',
    'installation',
    'repair',
  ].map((slug) => ({
    url: `/hvac/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  // Sub-service pages (mitsubishi)
  const mitsubishiSubs = [
    'installation',
    'heat-pump',
    'ductless-heat-pump',
    'ac-installation',
    'multi-zone',
  ].map((slug) => ({
    url: `/mitsubishi/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  // Sub-service pages (generator)
  const generatorSubs = [
    'whole-home',
    'generac',
    'standby',
    'backup',
    'emergency-service',
  ].map((slug) => ({
    url: `/generator/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  // Sub-service pages (hot-water-heaters)
  const hotWaterSubs = [
    'tankless',
    'traditional',
    'repair',
    'maintenance',
  ].map((slug) => ({
    url: `/hot-water-heaters/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  // Career / job listing pages
  const careerPages = [
    'lead-electrician',
    'hvac-project-manager',
    'hvac-installer',
    'estimator',
    'apprentice',
    'office-assistant',
  ].map((slug) => ({
    url: `/careers/${slug}`,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }))

  // Service area city pages
  const cityPages = [
    'catskill-ny',
    'hudson-ny',
    'woodstock-ny',
    'rhinebeck-ny',
    'hunter-ny',
    'saugerties-ny',
    'kingston-ny',
  ].map((slug) => ({
    url: `/service-areas/${slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }))

  // Service area county pages
  const countyPages = [
    'greene-county',
    'columbia-county',
    'ulster-county',
    'dutchess-county',
    'albany-county',
  ].map((slug) => ({
    url: `/service-areas/county/${slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }))

  const allPages = [
    ...staticPages,
    ...servicePages,
    ...electricalSubs,
    ...hvacSubs,
    ...mitsubishiSubs,
    ...generatorSubs,
    ...hotWaterSubs,
    ...careerPages,
    ...cityPages,
    ...countyPages,
  ]

  return allPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
