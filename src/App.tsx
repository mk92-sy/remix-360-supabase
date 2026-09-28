import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useToast } from './hooks/useToast'
import { initialSessions } from './data/mock'
import type { FeedbackSession, Member } from './types'

import Toast from './components/Toast'
import P0_Login from './pages/P0_Login'
import P0_1_CodeChange from './pages/P0_1_CodeChange'
import P1_Category from './pages/P1_Category'
import P2_1_Intro from './pages/P2_1_Intro'
import P2_2_MemberList from './pages/P2_2_MemberList'
import P2_3_MemberWrite from './pages/P2_3_MemberWrite'
import P3_1_InsightIntro from './pages/P3_1_InsightIntro'
import P3_2_InsightWrite from './pages/P3_2_InsightWrite'
import P4_AdminDashboard from './pages/P4_AdminDashboard'
import P4_1_AdminPasswordChange from './pages/P4_1_AdminPasswordChange'
import P5_AdminDashboard from './pages/P5_AdminDashboard'
import P5_1_AdminMemberList from './pages/P5_1_AdminMemberList'
import P5_2_AdminMemberDetail from './pages/P5_2_AdminMemberDetail'
import P6_AdminInsightList from './pages/P6_AdminInsightList'
import P7_AdminFeedbackList from './pages/P7_AdminFeedbackList'
import P7_AdminFeedbackSessionCreate from './pages/P7_AdminFeedbackSessionCreate'
import P7_2_AdminMemberManagement from './pages/P7_2_AdminMemberManagement'
import P7_3_AdminMemberRegister from './pages/P7_3_AdminMemberRegister'
import P7_4_AdminFeedbackDetail from './pages/P7_4_AdminFeedbackDetail'
import P7_5_AdminFeedbackEdit from './pages/P7_5_AdminFeedbackEdit'

const T360 = '360도 다면 피드백'
const TINSIGHT = '인사이트 피드백'

function Page({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full animate-page">{children}</div>
}

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toastMessage, toastType, showToast } = useToast()

  // TODO(supabase): 아래 상태들은 Supabase 쿼리/세션(auth)으로 대체하세요.
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [me, setMe] = useState<Member | null>(null)
  const [sessions, setSessions] = useState<FeedbackSession[]>(initialSessions)
  const [activeSession, setActiveSession] = useState<FeedbackSession | null>(null)
  const [selectedSession, setSelectedSession] = useState<FeedbackSession | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedYear, setSelectedYear] = useState('2025')
  const [adminPassword, setAdminPassword] = useState('0000')
  const [tempSession, setTempSession] = useState<Partial<FeedbackSession>>({})
  const [tempMembers, setTempMembers] = useState<Member[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const patch = (id: string, fn: (s: FeedbackSession) => FeedbackSession) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? fn(s) : s)))

  const liveActive = sessions.find((s) => s.id === activeSession?.id) ?? null
  const todo = (label: string) => showToast(`${label}은(는) Supabase 연동 후 제공됩니다.`, 'warning')

  /* ---------- user flow ---------- */
  const handleLogin = (name: string, code: string) => {
    const found = sessions.flatMap((s) => s.members).find((m) => m.name === name && m.loginCode === code)
    if (!found) return showToast('이름 또는 코드가 일치하지 않습니다.', 'warning')
    setMe(found)
    navigate(found.isFirstLogin ? '/code-change' : '/category')
  }

  const handleAdminLogin = () => navigate('/admin')

  const handleFeedbackComplete = (memberId: string, good: string, suggestions: string, rehire: boolean) => {
    if (!liveActive || !me) return
    patch(liveActive.id, (s) => {
      const others = (s.feedbacks?.[memberId] ?? []).filter((f) => f.authorHash !== me.id)
      return { ...s, feedbacks: { ...s.feedbacks, [memberId]: [...others, { good, suggestions, rehire, authorHash: me.id }] } }
    })
    showToast('피드백이 저장되었습니다.', 'success')
    navigate('/members')
  }

  const handleInsightComplete = (content: string) => {
    if (!liveActive || !me) return
    patch(liveActive.id, (s) => ({
      ...s,
      insights: [...(s.insights ?? []).filter((i) => i.authorHash !== me.id), { content, authorHash: me.id }],
    }))
    showToast('완료되었습니다.', 'success')
    navigate('/category')
  }

  const pickSession = (type: string) => sessions.find((s) => s.type === type && s.members.some((m) => m.id === me?.id))

  /* ---------- admin flow ---------- */
  const handleRegisterSession = () => {
    const { year, type, code, period } = tempSession
    if (!year || !type) return
    const s: FeedbackSession = {
      id: Math.random().toString(36).slice(2, 11),
      year, type, period: period ?? '', code: code ?? `DND${year}`, members: tempMembers,
      ...(type === T360 ? { feedbacks: {} } : { insights: [] }),
    }
    setSessions((prev) => [...prev, s])
    setSelectedSession(null)
    setTempMembers([])
    navigate('/admin/sessions')
  }

  return (
    <div className="flex justify-center min-h-screen bg-neutral-900 transition-colors duration-300">
      <div className="w-full max-w-md h-screen bg-background-dark relative flex flex-col shadow-2xl overflow-hidden border-x border-white/5">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><P0_Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} adminPassword={adminPassword} showToast={showToast} theme={theme} onThemeChange={setTheme} /></Page>} />
          <Route path="/code-change" element={<Page><P0_1_CodeChange currentName={me?.name || ''} showToast={showToast} onBack={() => navigate('/')} onComplete={(newCode) => {
            if (me) setMe({ ...me, loginCode: newCode, isFirstLogin: false })
            showToast('코드가 성공적으로 변경되었습니다.', 'success')
            navigate('/category')
          }} /></Page>} />

          <Route path="/category" element={<Page><P1_Category
            availableTypes={Array.from(new Set(sessions.filter((s) => s.members.some((m) => m.id === me?.id)).map((s) => s.type)))}
            onSelect360={() => { const s = pickSession(T360); if (s) { setActiveSession(s); navigate('/intro') } }}
            onSelectInsight={() => { const s = pickSession(TINSIGHT); if (s) { setActiveSession(s); navigate('/insight-intro') } }}
            onBack={() => { setMe(null); navigate('/') }}
          /></Page>} />
          <Route path="/intro" element={<Page><P2_1_Intro onNext={() => navigate('/members')} onBack={() => navigate('/category')} /></Page>} />
          <Route path="/members" element={<Page><P2_2_MemberList
            members={(liveActive?.members || []).filter((m) => m.id !== me?.id).map((m) => ({ ...m, isAvailable: !liveActive?.feedbacks?.[m.id]?.some((f) => f.authorHash === me?.id) }))}
            initialOpenTeam={selectedMember?.team || null}
            onMemberSelect={(m) => { setSelectedMember(m); navigate('/write') }}
            onBackToStart={() => navigate('/category')}
            onBack={() => navigate('/intro')}
          /></Page>} />
          <Route path="/write" element={<Page>{selectedMember && <P2_3_MemberWrite
            member={selectedMember}
            initialData={liveActive?.feedbacks?.[selectedMember.id]?.find((f) => f.authorHash === me?.id)}
            onComplete={(g, s, r) => handleFeedbackComplete(selectedMember.id, g, s, r)}
            onBack={() => navigate('/members')}
          />}</Page>} />
          <Route path="/insight-intro" element={<Page><P3_1_InsightIntro onParticipate={() => navigate('/insight-write')} onBack={() => navigate('/category')} /></Page>} />
          <Route path="/insight-write" element={<Page><P3_2_InsightWrite
            initialData={liveActive?.insights?.find((i) => i.authorHash === me?.id)?.content}
            onComplete={handleInsightComplete}
            onBack={() => navigate('/insight-intro')}
          /></Page>} />

          <Route path="/admin" element={<Page><P4_AdminDashboard onGoToDashboard={() => navigate('/admin/results')} onGoToAddFeedback={() => navigate('/admin/sessions')} onGoToPasswordChange={() => navigate('/admin/password')} onBack={() => navigate('/')} /></Page>} />
          <Route path="/admin/password" element={<Page><P4_1_AdminPasswordChange currentAdminPassword={adminPassword} showToast={showToast} onBack={() => navigate('/admin')} onPasswordChanged={(pw) => { setAdminPassword(pw); navigate('/admin') }} /></Page>} />
          <Route path="/admin/results" element={<Page><P5_AdminDashboard onSelect360={() => navigate('/admin/results/360')} onSelectInsight={() => navigate('/admin/results/insight')} onBack={() => navigate('/admin')} /></Page>} />
          <Route path="/admin/results/360" element={<Page><P5_1_AdminMemberList
            sessions={sessions.filter((s) => s.type === T360)}
            onMemberSelect={(m, y) => { setSelectedMember(m); setSelectedYear(y); navigate('/admin/results/360/detail') }}
            onDownload={() => todo('엑셀 다운로드')}
            onBack={() => navigate('/admin/results')}
          /></Page>} />
          <Route path="/admin/results/360/detail" element={<Page>{selectedMember && <P5_2_AdminMemberDetail
            member={selectedMember}
            year={selectedYear}
            feedbackData={sessions.find((s) => s.year === selectedYear && s.type === T360)?.feedbacks?.[selectedMember.id] || null}
            onExport={(f) => todo(`${f.toUpperCase()} 내보내기`)}
            onBack={() => navigate('/admin/results/360')}
          />}</Page>} />
          <Route path="/admin/results/insight" element={<Page><P6_AdminInsightList sessions={sessions.filter((s) => s.type === TINSIGHT)} onDownload={() => todo('엑셀 다운로드')} onBack={() => navigate('/admin/results')} /></Page>} />

          <Route path="/admin/sessions" element={<Page><P7_AdminFeedbackList
            sessions={sessions}
            onSelectSession={(s) => { setSelectedSession(s); navigate('/admin/sessions/detail') }}
            onRegister={() => { setSelectedSession(null); setTempSession({}); setTempMembers([]); navigate('/admin/sessions/create') }}
            onBack={() => navigate('/admin')}
          /></Page>} />
          <Route path="/admin/sessions/create" element={<Page><P7_AdminFeedbackSessionCreate
            sessions={sessions} showToast={showToast}
            onNext={(year, type, period, code) => {
              setTempSession({ year, type: type as FeedbackSession['type'], period, code })
              setTempMembers(sessions.find((s) => s.year === year)?.members ?? [])
              navigate('/admin/sessions/members')
            }}
            onBack={() => navigate('/admin/sessions')}
          /></Page>} />
          <Route path="/admin/sessions/members" element={<Page><P7_2_AdminMemberManagement
            members={tempMembers} allSessions={sessions}
            sessionYear={tempSession.year || ''} sessionType={tempSession.type || ''}
            onDeleteMember={(id) => setTempMembers((p) => p.filter((m) => m.id !== id))}
            onAddMember={() => navigate('/admin/sessions/members/add')}
            onMembersLoaded={setTempMembers}
            onRegisterComplete={handleRegisterSession}
            onBack={() => navigate('/admin/sessions/create')}
          /></Page>} />
          <Route path="/admin/sessions/members/add" element={<Page><P7_3_AdminMemberRegister
            showToast={showToast}
            onBack={() => navigate(selectedSession ? '/admin/sessions/edit' : '/admin/sessions/members')}
            onRegister={(data) => {
              const code = selectedSession?.code || tempSession.code || `DND${selectedSession?.year || tempSession.year || new Date().getFullYear()}`
              const nm: Member = { ...data, id: Math.random().toString(36).slice(2, 11), isAvailable: true, loginCode: code, isFirstLogin: true }
              if (selectedSession) { setSelectedSession({ ...selectedSession, members: [...selectedSession.members, nm] }); navigate('/admin/sessions/edit') }
              else { setTempMembers((p) => [...p, nm]); navigate('/admin/sessions/members') }
            }}
          /></Page>} />
          <Route path="/admin/sessions/detail" element={<Page>{selectedSession && <P7_4_AdminFeedbackDetail
            session={selectedSession}
            onEdit={() => navigate('/admin/sessions/edit')}
            onDelete={(id) => { setSessions((p) => p.filter((s) => s.id !== id)); setSelectedSession(null); showToast('삭제되었습니다.', 'success'); navigate('/admin/sessions') }}
            onResetCode={() => showToast('비밀번호가 초기화되었습니다.', 'success')}
            onBack={() => navigate('/admin/sessions')}
          />}</Page>} />
          <Route path="/admin/sessions/edit" element={<Page>{selectedSession && <P7_5_AdminFeedbackEdit
            key={selectedSession.id + selectedSession.members.length}
            session={selectedSession} showToast={showToast}
            onSave={(u) => { setSessions((p) => p.map((s) => (s.id === u.id ? { ...s, ...u } : s))); setSelectedSession(u); navigate('/admin/sessions/detail') }}
            onAddMember={(period, members) => { setSelectedSession({ ...selectedSession, period, members }); navigate('/admin/sessions/members/add') }}
            onDeleteMember={(id) => patch(selectedSession.id, (s) => ({ ...s, members: s.members.filter((m) => m.id !== id) }))}
            onBack={() => navigate('/admin/sessions/detail')}
          />}</Page>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {toastMessage && <Toast message={toastMessage} type={toastType} />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
