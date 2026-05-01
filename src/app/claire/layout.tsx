import PublicAnalytics from '@/components/analytics/PublicAnalytics'

/**
 * /claire layout — fully immersive chat surface. No public Header,
 * Footer, "Ready to Get Started?" CTA strip, or FloatingCTA. Just the
 * chat. Analytics still load so we track visits to this surface.
 *
 * Lives outside the (public) route group on purpose: the public layout
 * wraps every page in chrome that competes with the chat for attention
 * and pushes the composer below the fold on mobile.
 */
export default function ClaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicAnalytics />
      <main className="flex-1">{children}</main>
    </>
  )
}
