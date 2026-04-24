import type { Metadata } from 'next'
import QuestionnaireForm from './QuestionnaireForm'

export const metadata: Metadata = {
  title: 'Agent Training — TZ Electric',
  description: 'Internal questionnaire for AI agent knowledge base.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function AgentTrainingPage() {
  return <QuestionnaireForm />
}
