import Image from 'next/image'
import { AuthForm } from './_components/auth-form'

export const metadata = { title: 'Sign in — Tracker' }

export default function LoginPage() {
  return (
    <div className="login-stage relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="login-signal-wrap pointer-events-none">
        <svg
          viewBox="0 0 2200 520"
          aria-hidden="true"
          className="login-signal-svg login-signal-svg-back"
        >
          {Array.from({ length: 26 }).map((_, index) => (
            <path
              key={`back-${index}`}
              d={`M -620 ${220 + index * 4} C -160 ${120 + index * 3}, 240 ${360 + index * 3}, 540 ${260 + index * 4} S 1060 ${120 + index * 3}, 1360 ${250 + index * 4} S 1760 ${360 + index * 3}, 2860 ${180 + index * 4}`}
              stroke="rgba(168, 22, 46, 0.34)"
              strokeWidth="1.3"
            />
          ))}
        </svg>

        <svg
          viewBox="0 0 2200 520"
          aria-hidden="true"
          className="login-signal-svg login-signal-svg-mid"
        >
          {Array.from({ length: 28 }).map((_, index) => (
            <path
              key={`mid-${index}`}
              d={`M -700 ${180 + index * 5} C -220 ${320 + index * 3}, 200 ${120 + index * 4}, 620 ${300 + index * 3} S 1220 ${420 - index * 2}, 1520 ${210 + index * 4} S 1960 ${120 + index * 3}, 2940 ${300 + index * 2}`}
              stroke="rgba(66, 150, 255, 0.7)"
              strokeWidth="1.45"
            />
          ))}
        </svg>

        <svg
          viewBox="0 0 2200 520"
          aria-hidden="true"
          className="login-signal-svg login-signal-svg-front"
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <path
              key={`front-${index}`}
              d={`M -720 ${320 + index * 4} C -120 ${500 - index * 4}, 320 ${120 + index * 2}, 760 ${300 + index * 3} S 1360 ${500 - index * 4}, 1720 ${280 + index * 3} S 2140 ${80 + index * 3}, 3040 ${340 + index * 4}`}
              stroke="rgba(104, 210, 140, 0.86)"
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
            className="h-auto w-[220px] object-contain drop-shadow-[0_18px_48px_rgba(104,210,140,0.24)]"
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
