import Header from '@/components/layout/Header'
import PublicAnalytics from '@/components/analytics/PublicAnalytics'

/**
 * /claire layout — public site Header at the top so visitors can still
 * navigate elsewhere on the site, then the immersive chat below it.
 * Footer, "Ready to Get Started?" CTA strip, and FloatingCTA all stay
 * out — they fight the chat for attention and push the composer off
 * screen on mobile.
 *
 * Lives outside the (public) route group so we can keep just the
 * Header (navigation) without inheriting the rest of the public chrome.
 */
export default function ClaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicAnalytics />
      <Header />
      <main className="flex-1">{children}</main>
    </>
  )
}
