'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  FolderKanban,
  House,
  Inbox,
  Keyboard,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

type HelpCenterButtonProps = {
  isAdmin?: boolean
}

type HelpSection = {
  title: string
  description: string
  bullets: string[]
}

type ShortcutItem = {
  keys: string[]
  description: string
}

type PreviewCard = {
  title: string
  subtitle: string
  accent: string
  lines: string[]
}

const baseSections: HelpSection[] = [
  {
    title: '서비스 소개',
    description:
      'MoA는 내부 프로젝트와 이슈를 한곳에서 관리하기 위한 초기 업무용 서비스예요.',
    bullets: [
      '프로젝트와 이슈를 생성하고 상태 흐름을 추적할 수 있어요.',
      '댓글, 담당자, 우선순위, 일정, 첨부파일까지 한 화면에서 관리할 수 있어요.',
      '초기 버전이라 일부 화면과 정책은 내부 피드백을 받아 계속 다듬는 중이에요.',
    ],
  },
  {
    title: 'Dashboard',
    description: '오늘 확인할 이슈와 개인 메모를 빠르게 보는 홈 화면이에요.',
    bullets: [
      '마감일이 잡힌 이슈를 우선 확인할 수 있어요.',
      '오늘 메모를 남기고 개인 작업 정리를 할 수 있어요.',
    ],
  },
  {
    title: 'Calendar',
    description: '시작일과 마감일을 기준으로 전체 일정 흐름을 보는 화면이에요.',
    bullets: [
      '일정이 있는 이슈를 달력 형태로 확인할 수 있어요.',
      '회사 캘린더 연동은 아직 다음 단계 작업으로 남아 있어요.',
    ],
  },
  {
    title: 'Inbox',
    description: '외부 채널이나 초기 수집 이슈가 먼저 모이는 기본 수신함이에요.',
    bullets: [
      '아직 프로젝트가 확정되지 않은 이슈를 먼저 모아둘 수 있어요.',
      '이후 프로젝트를 지정하고 담당자를 배정해 정식 트래킹으로 넘길 수 있어요.',
    ],
  },
  {
    title: 'Project',
    description: '프로젝트별 칸반 보드와 상세 이슈 관리를 하는 메인 작업 공간이에요.',
    bullets: [
      '프로젝트 안에서 상태별 이슈를 보드로 확인할 수 있어요.',
      '이슈 상세에서 댓글, 상태, 일정, 담당자, 첨부파일을 관리할 수 있어요.',
      '새 이슈 생성은 상단 전역 생성 또는 프로젝트 내부 생성 둘 다 가능해요.',
    ],
  },
  {
    title: 'Search',
    description: '이슈 제목, 설명, 프로젝트 기준으로 빠르게 찾는 화면이에요.',
    bullets: [
      '프로젝트, 상태, 담당자 조건으로 결과를 좁힐 수 있어요.',
      '검색 결과에서 바로 이슈 상세로 이동할 수 있어요.',
    ],
  },
]

const adminSection: HelpSection = {
  title: 'Users',
  description: '관리자 전용 사용자 관리 화면이에요.',
  bullets: [
    '사용자 승인 여부와 역할을 관리할 수 있어요.',
    '신규 가입자는 승인 전까지 서비스 사용이 제한될 수 있어요.',
  ],
}

const quickStartChecklist = [
  '로그인 또는 회원가입 후 워크스페이스에 진입하기',
  'Dashboard에서 오늘 확인할 이슈와 메모 흐름 파악하기',
  'Project 또는 Inbox에서 현재 이슈 상태 확인하기',
  '새 이슈를 만들고 담당자, 일정, 우선순위 지정하기',
  '댓글과 첨부파일로 협업 맥락 남기기',
]

const shortcuts: ShortcutItem[] = [
  {
    keys: ['Ctrl', 'K'],
    description: '전역 검색 열기',
  },
  {
    keys: ['Shift', 'N'],
    description: '전역 새 이슈 모달 열기',
  },
  {
    keys: ['Ctrl', 'Enter'],
    description: '이슈 상세 화면에서 현재 이슈 완료 처리',
  },
  {
    keys: ['Esc'],
    description: '열려 있는 모달, 시트, 검색창 닫기',
  },
]

const previewCards: PreviewCard[] = [
  {
    title: 'Dashboard',
    subtitle: '오늘의 작업 개요',
    accent: 'from-[#68d28c]/30 to-transparent',
    lines: ['Due issues', 'Today notes', 'Workspace overview'],
  },
  {
    title: 'Project Board',
    subtitle: '상태별 칸반 보드',
    accent: 'from-[#4296ff]/30 to-transparent',
    lines: ['Backlog', 'Doing', 'Review'],
  },
  {
    title: 'Search',
    subtitle: '빠른 이슈 탐색',
    accent: 'from-[#f32dff]/25 to-transparent',
    lines: ['Keyword', 'Project filter', 'Assignee filter'],
  },
]

function SectionCard({
  title,
  description,
  bullets,
}: HelpSection) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-5">
      <h3 className="text-base font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <ul className="mt-4 space-y-2">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-2 text-sm text-foreground/90"
          >
            <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#68d28c]" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HelpCenterButton({ isAdmin }: HelpCenterButtonProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const sections = isAdmin ? [...baseSections, adminSection] : baseSections

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
        title="Help"
        aria-label="Open help"
        onClick={() => setOpen(true)}
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      {!open || typeof document === 'undefined' ? null : createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Close help"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-[min(920px,96vw)] overflow-hidden rounded-2xl border border-border bg-[#111317] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#68d28c]">
                  Help Center
                </p>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  MoA 사용 안내
                </h2>
                <p className="text-sm text-muted-foreground">
                  현재 구현된 초기 서비스 기준으로 주요 화면과 기능을 빠르게 확인할 수 있어요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-[#1a1d22] text-muted-foreground transition-colors hover:bg-[#232831] hover:text-foreground"
                aria-label="Close help"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="dashboard-scroll max-h-[calc(88vh-88px)] overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                <section className="rounded-2xl border border-border bg-[linear-gradient(135deg,rgba(104,210,140,0.14),rgba(17,19,23,0.94)_42%)] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#68d28c]/30 bg-[#68d28c]/10 px-3 py-1 text-xs font-medium text-[#8be2a7]">
                        <Sparkles className="h-3.5 w-3.5" />
                        처음 시작하기
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        내부 테스트 전에 이 순서로 둘러보면 좋아요
                      </h3>
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        초기 버전 기준으로 핵심 흐름을 빠르게 확인할 수 있는 체크리스트예요.
                      </p>
                    </div>

                    <Image
                      src="/brand/logo-mark.svg"
                      alt="MoA"
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain opacity-90"
                      unoptimized
                    />
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {quickStartChecklist.map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/8 bg-black/20 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#68d28c]" />
                          <p className="text-sm text-foreground/90">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
                  <section className="rounded-2xl border border-border bg-card/50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-[#68d28c]" />
                      <h3 className="text-base font-semibold tracking-tight text-white">
                        주요 화면 미리보기
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {previewCards.map((card) => (
                        <div
                          key={card.title}
                          className="overflow-hidden rounded-2xl border border-border bg-[#0d1014]"
                        >
                          <div className={`h-24 bg-gradient-to-br ${card.accent} px-4 py-3`}>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                              {card.title}
                            </p>
                            <p className="mt-2 text-sm font-medium text-white">
                              {card.subtitle}
                            </p>
                          </div>
                          <div className="space-y-2 p-4">
                            {card.lines.map((line) => (
                              <div
                                key={line}
                                className="rounded-md border border-white/6 bg-white/[0.03] px-3 py-2 text-xs text-foreground/80"
                              >
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-card/50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Keyboard className="h-4 w-4 text-[#68d28c]" />
                      <h3 className="text-base font-semibold tracking-tight text-white">
                        단축키 안내
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {shortcuts.map((shortcut) => (
                        <div
                          key={`${shortcut.keys.join('+')}-${shortcut.description}`}
                          className="rounded-xl border border-white/8 bg-black/20 p-3"
                        >
                          <div className="flex items-center gap-2">
                            {shortcut.keys.map((key) => (
                              <kbd
                                key={key}
                                className="rounded-md border border-border bg-[#1b1f25] px-2 py-1 text-[11px] font-medium text-white"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-foreground/90">
                            {shortcut.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-border bg-card/50 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#68d28c]" />
                    <h3 className="text-base font-semibold tracking-tight text-white">
                      메뉴별 세부 기능
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="mb-3 flex items-center gap-2 text-white">
                        <House className="h-4 w-4 text-[#68d28c]" />
                        <span className="font-medium">Dashboard</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        오늘 처리할 이슈와 개인 메모를 빠르게 확인하는 시작 화면이에요.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="mb-3 flex items-center gap-2 text-white">
                        <CalendarDays className="h-4 w-4 text-[#68d28c]" />
                        <span className="font-medium">Calendar</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        시작일과 마감일 중심으로 일정 흐름을 확인할 수 있어요.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="mb-3 flex items-center gap-2 text-white">
                        <Inbox className="h-4 w-4 text-[#68d28c]" />
                        <span className="font-medium">Inbox</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        외부 채널 또는 미분류 이슈를 먼저 모아두고 정리하는 공간이에요.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="mb-3 flex items-center gap-2 text-white">
                        <FolderKanban className="h-4 w-4 text-[#68d28c]" />
                        <span className="font-medium">Project</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        칸반 보드, 이슈 생성, 상세 편집, 댓글, 첨부파일 관리가 핵심이에요.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="mb-3 flex items-center gap-2 text-white">
                        <Search className="h-4 w-4 text-[#68d28c]" />
                        <span className="font-medium">Search</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        키워드와 필터를 조합해 원하는 이슈를 빠르게 찾을 수 있어요.
                      </p>
                    </div>

                    {isAdmin ? (
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="mb-3 flex items-center gap-2 text-white">
                          <Users className="h-4 w-4 text-[#68d28c]" />
                          <span className="font-medium">Users</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          승인 상태, 역할, 사용자 접근 권한을 관리하는 관리자 전용 화면이에요.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  {sections.map((section) => (
                    <SectionCard key={section.title} {...section} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
