import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import ClaireChat from '@/components/chat/ClaireChat'
import { chatThemeInitScript } from '@/components/chat/ChatThemeProvider'

export const metadata = createMetadata({
  title: 'Claire | TZ Electric Smart Assistant',
  description: `Chat with Claire, TZ Electric's smart assistant. Get instant answers about cooling, heating, electrical, plumbing, generators, and EV chargers in the Hudson Valley. Call ${COMPANY.phone}.`,
  path: '/claire',
})

export default function ClairePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Claire', url: '/claire' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Pre-hydrate theme init so first paint matches the user's saved choice */}
      <script
        dangerouslySetInnerHTML={{ __html: chatThemeInitScript }}
      />
      <ClaireChat />
    </>
  )
}
