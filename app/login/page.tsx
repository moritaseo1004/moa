import Image from 'next/image'
import { AuthForm } from './_components/auth-form'

export const metadata = { title: 'Sign in — Tracker' }

export default function LoginPage() {
  return (
    <div className="login-stage relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="login-signal-wrap pointer-events-none">
        <svg
          viewBox="0 0 1600 520"
          aria-hidden="true"
          className="login-signal-svg login-signal-svg-back"
        >
          {Array.from({ length: 26 }).map((_, index) => (
            <path
              key={`back-${index}`}
              d={`M -260 ${220 + index * 4} C 40 ${120 + index * 3}, 250 ${360 + index * 3}, 430 ${260 + index * 4} S 760 ${120 + index * 3}, 980 ${250 + index * 4} S 1320 ${360 + index * 3}, 1860 ${180 + index * 4}`}
              stroke="rgba(168, 22, 46, 0.34)"
              strokeWidth="1.3"
            />
          ))}
        </svg>

        <svg
          viewBox="0 0 1600 520"
          aria-hidden="true"
          className="login-signal-svg login-signal-svg-mid"
        >
          {Array.from({ length: 28 }).map((_, index) => (
            <path
              key={`mid-${index}`}
              d={`M -280 ${180 + index * 5} C 20 ${320 + index * 3}, 260 ${120 + index * 4}, 520 ${300 + index * 3} S 860 ${420 - index * 2}, 1080 ${210 + index * 4} S 1420 ${120 + index * 3}, 1880 ${300 + index * 2}`}
              stroke="rgba(243, 45, 255, 0.68)"
              strokeWidth="1.45"
            />
          ))}
        </svg>

        <svg
          viewBox="0 0 1600 520"
          aria-hidden="true"
          className="login-signal-svg login-signal-svg-front"
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <path
              key={`front-${index}`}
              d={`M -240 ${320 + index * 4} C 120 ${500 - index * 4}, 340 ${120 + index * 2}, 620 ${300 + index * 3} S 960 ${500 - index * 4}, 1180 ${280 + index * 3} S 1480 ${80 + index * 3}, 1860 ${340 + index * 4}`}
              stroke="rgba(47, 231, 255, 0.78)"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Image
            src="/brand/logo-login.svg"
            alt="MoA"
            width={220}
            height={64}
            className="h-auto w-[220px] object-contain drop-shadow-[0_18px_48px_rgba(66,150,255,0.22)]"
            unoptimized
            priority
          />
        </div>
        <div className="rounded-2xl border border-white/12 bg-[#0f1115]/72 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.52),0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
