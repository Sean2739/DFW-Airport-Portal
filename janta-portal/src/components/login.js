"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ICON_SM, iconProps } from '@/lib/icons';

const FIELD_BORDER = '1px solid rgba(26, 37, 53, 0.12)';

function CircleCheck({ checked }) {
    return (
        <span
            className="flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center box-border bg-white"
            style={{ border: FIELD_BORDER }}
        >
            {checked ? (
                <span
                    className="rounded-full shrink-0"
                    style={{ width: 6, height: 6, background: '#2A9D8F' }}
                />
            ) : null}
        </span>
    );
}

const inputClass =
    "w-full px-3.5 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87a9c4]/25 focus:border-[#87a9c4]/60 bg-white text-[#2F3E4D] placeholder-[#6A7B8F]/50";

const inputStyle = { border: FIELD_BORDER };

export default function Login() {
    const searchParams = useSearchParams();
    const [showLogoutMessage, setShowLogoutMessage] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get('loggedout') === 'true') {
            setShowLogoutMessage(true);
            setTimeout(() => setShowLogoutMessage(false), 4000);
        }
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!acceptTerms) {
            setMessage('Please accept the terms of service.');
            return;
        }
        setMessage('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/systemselect');
            } else {
                setMessage(data.error || 'Invalid email or password.');
            }
        } catch (err) {
            console.error('Login failed', err);
            setMessage('Login failed. Please try again.');
        }
    };

    const photoStyle = {
        backgroundImage: "url('/images/Dallas%20Three%20Towers%201.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const panelStyle = {
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
    };

    return (
        <div className="min-h-screen relative flex flex-col lg:flex-row lg:items-stretch">
            {/* Full-bleed photo — shows through translucent sign-in panel */}
            <div className="absolute inset-0 -z-10" style={photoStyle} aria-hidden />

            {/* Mobile / tablet — keep photo visible above the form */}
            <div className="lg:hidden h-44 sm:h-56 w-full shrink-0" />

            {/* Desktop — open photo area on the left */}
            <div className="hidden lg:block flex-1 min-w-[240px] min-h-screen" />

            {/* Sign in panel; scales with viewport (~32–40% width, bounded) */}
            <div
                className="flex flex-col w-full lg:w-[clamp(400px,38vw,640px)] lg:shrink-0 min-h-0 lg:min-h-screen"
                style={panelStyle}
            >
                <div className="px-6 sm:px-10 pt-8 lg:px-[clamp(2rem,5vw,3.5rem)] lg:pt-10">
                    <img
                        src="/images/Janta%20Power%20Official%20Logo%201.svg"
                        alt="Janta Power"
                        className="h-10 sm:h-11 w-auto object-contain opacity-90"
                    />
                </div>

                <div className="flex-1 flex items-center justify-center px-6 sm:px-10 pb-10 lg:px-[clamp(2rem,5vw,3.5rem)] lg:pb-12">
                    <div className="w-full max-w-[480px]">
                        <header className="mb-6">
                            <p
                                className="text-[11px] font-bold tracking-[0.18em] uppercase mb-1"
                                style={{ color: '#7A90A8' }}
                            >
                                Welcome back
                            </p>
                            <h1
                                className="text-[2.25rem] font-semibold leading-[1.1] tracking-tight"
                                style={{ color: '#1A2535' }}
                            >
                                Sign in
                            </h1>
                        </header>

                        {showLogoutMessage && (
                            <div className="mb-5 p-3 rounded-lg text-xs text-center bg-[#2A9D8F]/15 text-[#2A9D8F]">
                                You have been logged out successfully.
                            </div>
                        )}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-5 p-3 rounded-lg text-xs text-center bg-[#2A9D8F]/15 text-[#2A9D8F]">
                                Local dev login: <strong>dev@local.test</strong> / <strong>localdev</strong>
                            </div>
                        )}
                        {message && (
                            <div className="mb-5 p-3 rounded-lg text-xs text-center bg-[#D80404]/15 text-[#D80404]">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-2">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setMessage(''); }}
                                className={inputClass}
                                style={inputStyle}
                                required
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setMessage(''); }}
                                    className={`${inputClass} pr-11`}
                                    style={inputStyle}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#6A7B8F] hover:text-[#2F3E4D] transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff {...iconProps(ICON_SM)} /> : <Eye {...iconProps(ICON_SM)} />}
                                </button>
                            </div>

                            <div className="space-y-1 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-[10px] leading-snug text-[#7A90A8]">
                                    <CircleCheck checked={acceptTerms} />
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <span>Please accept the terms of service.</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 mt-3 rounded-lg text-sm font-semibold text-[#2F3E4D] bg-[#F3B664] hover:bg-[#F3B664]/90 focus:outline-none focus:ring-2 focus:ring-[#F3B664]/50 transition cursor-pointer"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
