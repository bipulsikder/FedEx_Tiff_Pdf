'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.push('/')
        return
      }
      setCheckingAuth(false)
    }
    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push('/')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const { data: exists, error: checkError } = await supabase
        .rpc('check_email_exists', { user_email: email })

      if (checkError) throw checkError

      if (!exists) {
        setIsError(true)
        setMessage('No account found with this email. Please sign up first.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      setMessage('Magic link sent! Check your email to sign in.')
    } catch (error) {
      setIsError(true)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-slate-700">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="mb-8 text-center">
          <img 
            src="/fedex-logo-local.png" 
            alt="FedEx Logo" 
            className="h-14 mx-auto mb-6" 
          />
          <h1 className="text-3xl font-extrabold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500 mt-3 text-lg">Sign in to convert your TIFF files</p>
        </div>

        {message && (
          <div className={`mb-8 p-5 rounded-2xl flex items-start gap-4 ${
            isError 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <svg className="w-7 h-7 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isError ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-lg"
              placeholder="you@example.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-white text-lg shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-lg">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-purple-600 font-bold hover:text-purple-700 transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
