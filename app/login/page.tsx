"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email o password non corretti")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md border border-stone-200 p-8">

        {/* Intestazione */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-slate-800">
            Gestionale Sartoria
          </h1>
          <p className="text-sm text-slate-500 mt-1">Laboratorio sartoriale</p>
        </div>

        <div className="border-t border-stone-100 mb-6" />

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gestionale.it"
              className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? "Accesso in corso…" : "Accedi"}
          </button>
        </div>
      </div>
    </div>
  )
}
