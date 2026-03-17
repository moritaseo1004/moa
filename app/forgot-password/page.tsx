import Image from 'next/image'
import { ForgotPasswordForm } from './_components/forgot-password-form'

export const metadata = { title: 'Forgot Password — Tracker' }

export default function ForgotPasswordPage() {
  return (
    <div className="login-stage relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
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
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
