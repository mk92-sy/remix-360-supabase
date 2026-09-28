export interface Member {
  id: string
  name: string
  team: string
  isAvailable: boolean
  loginCode?: string
  isFirstLogin?: boolean
}

export type SessionType = '360도 다면 피드백' | '인사이트 피드백'

export interface Feedback {
  good: string
  suggestions: string
  rehire?: boolean
  authorHash?: string
}

export interface FeedbackSession {
  id: string
  year: string
  type: SessionType
  period: string
  code: string
  members: Member[]
  feedbacks?: Record<string, Feedback[]>
  insights?: { content: string; authorHash: string }[]
}

export type ToastType = 'success' | 'warning'
export type ShowToast = (message: string, type?: ToastType) => void
