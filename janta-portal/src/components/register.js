'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Register(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter(); // Initialize the useRouter hook

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                firstName,
                lastName,
                password,

            }),
        });

        const data = await res.json();

        if (res.ok) {
            setMessage(`User ${data.email} registered successfully! Redirecting...`);
            // Redirect to the home page after successful registration
            router.push('/towerselect');  // This will take the user to the home page
        } else {
            setError(data.error || 'Registration failed');
        }
  };

    return(
        <div className='w-screen h-screen text-center bg-[#757575] flex items-center justify-center'>
            {/*  bg-[#f7e2cc] bg-[#757575]*/}
            <div className='flex p-2 md:pd-0 md:min-w-1/5 justify-center'>
                <form onSubmit={handleSubmit} className='md:border-2 md:border-black rounded-2xl p-4 w-full max-w-md bg-[#757575] md:shadow-lg shadow-black'>
                    {message && <p className="bg-green-200 border border-green-600 text-green-800 px-4 py-2 rounded mb-4 text-center">{message}</p>}
                    <img
                        className='w-full sm:w-auto h-auto rounded-lg mx-auto'
                        src='images/logo_black_extra_small.png'
                        alt='Janta logo' 
                        style={{height:'5em', width:'5em'}} 
                    />

                    <p className='text-black text-4xl mx-auto font-bold pt-4 pb-10'>
                        Join Now
                    </p>

                    {error && <p className="text-xl text-red-500 pb-4 font-bold text-center">{error}</p>}

                    <div className='flex'>
                        <input 
                            type='firstname' 
                            id='firstname' 
                            name='firstname'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className='rounded-lg border-2 w-1/2 mr-2 p-2 text-black bg-white'
                            placeholder='First Name'
                            required
                        /> 
                        <input 
                            type='lastname' 
                            id='lastname' 
                            name='lastname'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className='rounded-lg border-2 w-1/2 p-2 text-black bg-white'
                            placeholder='Last Name'
                            required
                        /> 
                    </div>

                    <div className='pt-8'>
                        <input
                            type='email' 
                            id='email' 
                            name='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='rounded-lg border-2 w-full p-2 text-black bg-white'
                            placeholder='Email'
                            required>
                        </input>
                    </div>

                    <div className='pt-8'>
                        <input
                            type='password' 
                            id='password' 
                            name='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='rounded-lg border-2 w-full p-2 text-black bg-white'
                            placeholder='Password'
                            required>
                        </input>
                    </div>

                    <div className='pt-8'>
                        <input
                            type='password' 
                            id='ConfirmPassword' 
                            name='password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='rounded-lg border-2 w-full p-2 text-black bg-white'
                            placeholder='Repeat your password'
                            required>
                        </input>
                    </div>

                    <div className='mt-6 flex'>
                        <input type="checkbox" id="horns" name="horns" className='mr-1' required/>
                        <p className='text-black text-md'>I agree to the <a href='www.google.com' className='underline'>terms & condtions</a>.</p>
                    </div>

                    <div className='mt-6 text-right'>
                        <button type="submit" className='w-full border-2 border-black rounded-lg bg-[#ecac5c] p-2 text-black hover:brightness-90'>
                            Register
                        </button>
                    </div>
                </form>
            </div>            
        </div>
    )
}