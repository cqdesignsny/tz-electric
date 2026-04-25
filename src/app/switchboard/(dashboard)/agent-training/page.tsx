import type { Metadata } from 'next'
import QuestionnaireForm from './QuestionnaireForm'

export const metadata: Metadata = {
  title: 'Agent Training',
  description: 'Internal questionnaire for AI agent knowledge base.',
}

export default function AgentTrainingPage() {
  return <QuestionnaireForm />
}
