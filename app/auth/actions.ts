'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const returnUrl = formData.get('returnUrl') as string

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errorRedirect = returnUrl
      ? `/auth/signin?error=Invalid login credentials&returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth/signin?error=Invalid login credentials'
    redirect(errorRedirect)
  }

  revalidatePath('/', 'layout')

  // Redirect to returnUrl if provided, otherwise to dashboard
  if (returnUrl && returnUrl.startsWith('/')) {
    redirect(returnUrl)
  } else {
    redirect('/user-dashboard')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/auth/signin?message=Check your email to confirm your account')
}

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/auth/signin')
}