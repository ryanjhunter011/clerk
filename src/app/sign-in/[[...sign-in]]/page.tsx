'use client'

import * as React from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [ emailAddress, setEmailAddress ] = React.useState('')
  const [ password, setPassword ] = React.useState('')
  const [ error, setError ] = React.useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        console.error('Unexpected result:', result)
      }
    } catch (err: any) {
      setError('Invalid credentials. Please try again.')
    }
  }

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: any) {
      setError(err);
    }
  }

  return (
    <div className="min-w-screen min-h-screen bg-gray-100 text-gray-900 flex justify-center">
        <div className=" bg-white flex justify-center flex-1">
			<div className="flex justify-center items-center lg:w-1/2 xl:w-6/12">
				<div className="p-[15px] flex flex-col items-center">
					<h1 className="text-3xl xl:text-4xl font-extrabold mb-8 text-gray-700">
						Sign In
					</h1>
					{error && <p className='text-red-500 mb-5'>{error}</p>}
					<div className="w-full flex-1">
						<div className="mx-auto max-w-xs">
							<button 
								className="mb-5 tracking-wide font-semibold bg-white text-gray-900 w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
								onClick={handleGoogleSignIn}
							>
								<Image 
									className="w-6 h-6 mr-2" 
									src="https://img.icons8.com/color/48/google-logo.png" 
									alt="Google Logo" 
									width={24}
									height={24}
								/>
								Sign in with Google
							</button>
							<div className="flex items-center my-5">
								<hr className="flex-1 border-t border-gray-300" />
								<span className="mx-4 text-gray-500">or</span>
								<hr className="flex-1 border-t border-gray-300" />
							</div>
							<form onSubmit={handleSubmit}>
								<input 
									className="w-full px-4 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white" 
									id='email'
									type='email'
									name='email'
									value={emailAddress}
									onChange={(e) => setEmailAddress(e.target.value)}
									placeholder='Email'
								/>
								<input 
									className="w-full px-4 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5" 
									id='password'
									type='password'
									name='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder='Password'
								/>
								<button 
									className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
									type='submit' 
								>
									Sign In
								</button>
							</form>
						</div>
					</div>
					<div className="flex flex-wrap w-full justify-between mt-5">
						<Link href='/reset-password' className='text-indigo-500 font-bold'>Reset Password</Link>
						<Link href='/sign-up' className='text-indigo-500 font-bold'>Sign Up</Link>
					</div>
				</div>
			</div>
			<div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
				<div className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')` }}></div>
			</div>
        </div>
    </div>
  )
}
