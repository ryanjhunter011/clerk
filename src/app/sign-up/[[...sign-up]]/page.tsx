'use client'

import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Page() {
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
			router.push('/')
		}
	  } else {
		console.error(JSON.stringify(completeSignUp, null, 2))
	  }
	} catch (err: any) {
	  console.error('Error:', JSON.stringify(err, null, 2))
	}
  }

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
	<div className='flex flex-col justify-center items-center w-screen h-screen'>
		<div className='flex flex-col justify-center items-center w-[450px] border border-gray-300 rounded-md p-10'>
			<h1 className='mb-[40px] text-4xl font-extrabold'>Sign up</h1>
			<form onSubmit={handleSubmit}>
				<div className='mb-5'>
					<label htmlFor="email" className='mb-1'>Enter email address</label>
					<input
						className='w-full p-2 border border-gray-300 rounded-md'
						id="email"
						type="email"
						name="email"
						value={emailAddress}
						onChange={(e) => setEmailAddress(e.target.value)}
					/>
				</div>
				<div className='mb-5'>
					<label htmlFor="password" className='mb-1'>Enter password</label>
					<input
						className='w-full p-2 border border-gray-300 rounded-md'
						id="password"
						type="password"
						name="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<div id="clerk-captcha"></div>
				<div className='flex justify-center align-center'>
					<button 
						type="submit"
						className='px-10 py-2 border bg-black/50 text-white hover:bg-black/70'
					>
						Next
					</button>
				</div>
			</form>
		</div>
	</div>
  )
}