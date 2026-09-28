import { useState } from 'react'
import { MdGroupAdd, MdSentimentSatisfied, MdSentimentDissatisfied, MdThumbUp, MdLightbulb, MdImage, MdPictureAsPdf, MdTableView } from 'react-icons/md'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import type { Feedback, Member } from '../types'

interface Props {
  member: Member | null
  year: string
  feedbackData: Feedback[] | null
  onExport: (format: 'png' | 'pdf' | 'excel') => void
  onBack: () => void
}

const empty = <div className="p-10 rounded-2xl bg-surface-dark/50 border border-dashed border-theme text-center text-theme-sub text-sm">피드백 내용이 없습니다.</div>
const textCard = 'p-6 rounded-[20px] bg-surface-dark border border-theme text-[15px] leading-relaxed text-theme-main opacity-90 shadow-sm animate-slide'

export default function P5_2_AdminMemberDetail({ member, year, feedbackData, onExport, onBack }: Props) {
  const [showExport, setShowExport] = useState(false)
  const good = feedbackData?.map((f) => f.good).filter(Boolean) ?? []
  const sug = feedbackData?.map((f) => f.suggestions).filter(Boolean) ?? []
  const rehire = feedbackData?.filter((f) => f.rehire !== undefined) ?? []
  const likes = rehire.filter((f) => f.rehire === true).length
  const dislikes = rehire.filter((f) => f.rehire === false).length

  const pick = (f: 'png' | 'pdf' | 'excel') => { setShowExport(false); onExport(f) }

  return (
    <Layout
      title="360º 피드백"
      onBack={onBack}
      footer={
        <div className="flex gap-3 w-full">
          <button onClick={onBack} className="flex-1 py-4 bg-surface-dark text-theme-main font-bold border border-theme rounded-2xl active:scale-95 transition-all">뒤로가기</button>
          <button onClick={() => setShowExport(true)} className="flex-1 py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all shadow-xl">공유하기</button>
        </div>
      }
    >
      <div className="bg-background-dark min-h-full">
        <div className="flex flex-col items-center px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-dark border border-theme mb-6 shadow-sm"><span className="text-[14px] font-bold text-theme-main">{member?.name}</span></div>
          <div className="text-[20px] font-black text-theme-main mb-2 tracking-tight opacity-80">{year}년</div>
          <h2 className="text-[28px] font-bold leading-tight text-theme-main mb-2">직원 역량 향상을 위한<br />360º 피드백</h2>
        </div>
        <div className="px-5 space-y-10 pb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-accent/10 flex items-center justify-center"><MdGroupAdd className="text-[18px] text-accent" /></div>
              <p className="text-[20px] font-bold text-theme-main">재협업 희망 여부</p>
            </div>
            <div className="p-6 rounded-[20px] bg-surface-dark border border-theme flex items-center gap-8 shadow-sm">
              <div className="flex items-center gap-3">
                <MdSentimentSatisfied className="text-accent text-[24px]" />
                <div className="flex flex-col"><span className="text-[12px] text-theme-sub font-medium">좋아요</span><span className="text-[18px] font-bold text-accent">{likes}명</span></div>
              </div>
              <div className="w-[1px] h-8 bg-theme-highlight" />
              <div className="flex items-center gap-3">
                <MdSentimentDissatisfied className="text-theme-sub text-[24px]" />
                <div className="flex flex-col"><span className="text-[12px] text-theme-sub font-medium">아니요</span><span className="text-[18px] font-bold text-theme-main">{dislikes}명</span></div>
              </div>
            </div>
          </div>

          {[
            { label: '좋은점', list: good, bg: 'bg-blue-500/10', icon: <MdThumbUp className="text-[18px] text-blue-500" /> },
            { label: '바라는점', list: sug, bg: 'bg-orange-500/10', icon: <MdLightbulb className="text-[18px] text-orange-500" /> },
          ].map((sec) => (
            <div key={sec.label} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-[34px] h-[34px] rounded-full ${sec.bg} flex items-center justify-center`}>{sec.icon}</div>
                <p className="text-[20px] font-bold text-theme-main">{sec.label}</p>
                <div className="px-2 py-0.5 rounded-md bg-theme-highlight text-[13px] text-theme-sub font-medium">{sec.list.length}개</div>
              </div>
              <div className="space-y-3">
                {sec.list.length > 0 ? sec.list.map((t, i) => <div key={i} className={textCard}>{t}</div>) : empty}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showExport && (
        <Modal title="공유 형식 선택" onClose={() => setShowExport(false)}>
          <div className="grid grid-cols-3 gap-3 mb-8 mt-5">
            {([['png', 'PNG', MdImage], ['pdf', 'PDF', MdPictureAsPdf], ['excel', 'Excel', MdTableView]] as const).map(([k, l, Icon]) => (
              <button key={k} onClick={() => pick(k)} className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-theme-highlight border border-theme hover:bg-accent hover:text-white active:scale-95 transition-all text-theme-main">
                <Icon className="text-[28px]" />
                <span className="text-[12px] font-bold">{l}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowExport(false)} className="w-full py-4 bg-background-dark text-theme-sub border border-theme font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소</button>
        </Modal>
      )}
    </Layout>
  )
}
