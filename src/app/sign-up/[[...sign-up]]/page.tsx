'use client'

import * as React from 'react'
import { useState, useEffect } from "react";
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Page() {
	const [error, setError] = useState("");
	const { isLoaded, signUp, setActive } = useSignUp()
	const [emailAddress, setEmailAddress] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [verifying, setVerifying] = React.useState(false)
	const [code, setCode] = React.useState('')
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!isLoaded) return

		try {
			await signUp.create({
				emailAddress,
				password,
			})

			await signUp.prepareEmailAddressVerification({
				strategy: 'email_code',
			})

			setVerifying(true)
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2))
		}
	}

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!isLoaded) return

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code,
			})

			if (completeSignUp.status === 'complete') {
				await setActive({ session: completeSignUp.createdSessionId })

				const userId = completeSignUp.createdUserId;
				const responsePrivate = await fetch('/private', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						userId,
						role: 'Student Public',
					}),
				});

				const responsePublic = await fetch('/public', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						userId,
						role: 'Student Public',
					}),
				});

				if (responsePrivate.ok && responsePublic.ok) {
					router.push('/sso-callback')
				}
			} else {
				console.error(JSON.stringify(completeSignUp, null, 2))
			}
		} catch (err: any) {
				console.error('Error:', JSON.stringify(err, null, 2))
		}
	}

	const handleGoogleSignUp = async () => {
		if (!isLoaded) return;

		try {
			await signUp.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl: "/sso-callback",
				redirectUrlComplete: "/dashboard",
			});
		} catch (err: any) {
			if (err.code === 'authentication_failed') {
				setError("Authentication with Google failed. Please try again.");
			} else if (err.code === 'form_identifier_exists') {
				setError("An account with this Google email already exists. Please sign in instead.");
			} else {
				setError(err.errors[0]?.message || "An error occurred during Google sign-up. Please try again.");
			}
		}
	};

	if (verifying) {
		return (
			<div className='flex flex-col justify-center items-center w-screen h-screen'>
				<div className='flex flex-col justify-center items-center w-[450px] border border-gray-300 rounded-md p-10'>
					<h1 className='mb-[40px] text-4xl font-extrabold'>Verify your email</h1>
					<form onSubmit={handleVerify}>
						<label id="code" className='mb-2'>Enter your verification code</label>
						<input className='w-full p-2 border border-gray-300 rounded-md mb-5' value={code} id="code" name="code" onChange={(e) => setCode(e.target.value)} />
						<div className='flex justify-center align-center'>
							<button className='px-10 py-2 border bg-black/50 text-white hover:bg-black/70' type="submit">Verify</button>
						</div>
					</form>
				</div>
			</div>
		)
	}

	return (
		<div className="min-w-screen min-h-screen bg-gray-100 text-gray-900 flex justify-center">
			<div className=" bg-white flex justify-center flex-1">
				<div className="flex justify-center items-center lg:w-1/2 xl:w-6/12">
					<div className="p-[15px] flex flex-col items-center">
						<h1 className="text-3xl xl:text-4xl font-extrabold mb-8 text-gray-700">
							Sign Up
						</h1>
						{error && <p className='text-red-500 mb-5'>{error}</p>}
						<div className="w-full flex-1">
							<div className="mx-auto max-w-xs">
								<button 
									className="mb-5 tracking-wide font-semibold bg-white text-gray-900 w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
									onClick={handleGoogleSignUp}
								>
									<img className="w-6 h-6 mr-2" src="https://img.icons8.com/color/48/google-logo.png" alt="Google Logo" />
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
										id="email"
										type="email"
										name="email"
										value={emailAddress}
										onChange={(e) => setEmailAddress(e.target.value)}
										placeholder='Email'
									/>
									<input
										className="w-full px-4 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5" 
										id="password"
										type="password"
										name="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder='Password'
									/>
									<div id="clerk-captcha"></div>
									<div className='flex justify-center align-center'>
										<button 
											className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
											type="submit"
										>
											Next
										</button>
									</div>
								</form>
							</div>
						</div>
						<div className="flex flex-wrap w-full justify-between mt-5">
							<a href='/sign-in' className='text-indigo-500 font-bold'>Sign In</a>
						</div>
					</div>
				</div>
				<div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
					<div className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')` }}></div>
				</div>
			</div>
		</div>
	);
}