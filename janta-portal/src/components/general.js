"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { ArrowLeft} from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

export default function Settings(){
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [userSettings, setUserSettings] = useState({
        theme: '',
        text_size: '',
        bold_text: false,
        update_frequency: '',
    });

    useEffect(() => {
            const token = localStorage.getItem('token');
        
            if (!token) {
                router.push('/');
                return;
            }
        
            try {
                const decoded = jwtDecode(token); // ✅ should be { id }
                setUserId(decoded.id); // ✅ correctly store in state
            } catch (error) {
                console.error('Invalid token', error);
                localStorage.removeItem('token');
                router.push('/');
                return;
            }
        }, []);
    
        useEffect(() => {
            if (!userId) return; // Don't fetch until ID is set
    
            async function fetchUserSettings() {
                try{
                    const userResponse = await fetch(`/api/settings/${userId}`);
                    const userData = await userResponse.json();
                    setUserSettings(userData);
                } catch (error){
                    console.log("Fetch error:", error)
                    // router.push('/login');
                }
            }
            fetchUserSettings();
        }, [userId]);

        const handleUpdate = async (field, value) => {
            const updated = { ...userSettings, [field]: value };
            setUserSettings(updated);
            await fetch(`/api/settings/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
        };

    if (!userId) {
        return <p className="bg-[#f7e2cc] w-screen h-screen flex items-center justify-center text-black text-2xl ">Loading...</p>;
    }

    return(
        <div className='w-screen max-w-screen overflow-hidden min-h-screen h-auto pb-4 text-center bg-[#f7e2cc] text-black'>     
            <div className='py-8 relative w-full h-32'>
                {/* Back Button */}
                <Link href="/settings" className="absolute top-7 left-8">
                    <ArrowLeft size={32} strokeWidth={ICON_STROKE} className="text-black" />
                </Link>

                {/* Janta Logo */}
                <img
                    className='absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 object-cover'
                    src='images/Logo Type_Mix1.png'
                    alt='Janta logo' 
                    style={{height:'15em', width:'15em'}} 
                />
            </div>
            <div className='border-2 border-black shadow-md shadow-black rounded-lg bg-white py-8 mx-2 md:mx-auto md:w-2/3 px-4'>
                <div className='pb-4'>
                    <h1 className='text-4xl font-bold'>General</h1>
                </div>
                {/* <div className='text-left p-2 hidden'>
                    <h1 className='text-2xl'>Language & Region</h1>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Language:</p>
                        <select
                            id="language" 
                            className='text-lg border-1 ring-focus rounded-md'
                            // value={userSettings.language}
                            // onChange={(e) => setUserSettings(prev => ({ ...prev, language: e.target.value }))}
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>

                        </select>
                    </div>
                    <div className='py-2 flex justify-between md:justify-start'>
                        <p className='pr-2 text-lg'>Region:</p>
                        <select 
                            id="region" 
                            className='text-lg border-1 ring-focus rounded-md'
                            // value={userSettings.region}
                            // onChange={(e) => setUserSettings(prev => ({ ...prev, region: e.target.value }))}
                        >
                            <option value="North-America">North America</option>
                            <option value="Europe">Europe</option>
                            <option value="Asia">Asia</option>
                        </select>
                    </div>
                </div> */}
                <div className='text-left py-2 px-2'>
                    <h1 className='text-2xl text-left'>Default Theme</h1>
                    <div className='flex justify-between md:justify-start py-2'>
                        <p className='pr-2 text-lg'>Theme:</p>
                        <select 
                            id="theme" 
                            className='text-lg border-1 ring-focus rounded-md'
                            value={userSettings.theme}
                            onChange={(e) => handleUpdate('theme', e.target.value)}
                        >
                            <option value="Light">Light</option>
                            <option value="Dark">Dark</option>
                            <option value="Auto">Auto</option>
                        </select>
                    </div>
                </div>
                <div className='text-left py-2 px-2'>
                    <h1 className='text-2xl text-left'>Time</h1>
                    {/* <div className='flex py-2 justify-between md:justify-start border-b-2 border-gray-300 hidden'>
                        <p className='pr-2 text-lg'>24-Hour Time:</p>
                        <input 
                            type="checkbox" 
                            id="twentyFourHourTime" 
                            // checked={!!userSettings?.twentyFourHourTime}
                            // onChange={(e) => setUserSettings(prev => ({ ...prev, twentyFourHourTime: e.target.checked }))}
                        />
                    </div> */}
                    <div className='flex py-2 text-lg'>
                        <p className='pr-2'>Time zone:</p>
                        <p className='text-gray-600'>{userSettings.time_zone || 'Loading...'}</p>
                    </div>
                </div>
                <div className='text-left py-2 px-2'>
                    <h1 className='text-2xl text-left'>Accessibility</h1>
                    <div className='flex justify-between md:justify-start py-2 border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Text Size:</p>
                        <select 
                            id="text_size" 
                            className='text-lg border-1 ring-focus rounded-md'
                            value={userSettings.text_size}
                            onChange={(e) => handleUpdate('text_size', e.target.value)}
                        >
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                            <option value="Extra Large">Extra Large</option>
                        </select>
                    </div>
                    <div className='flex justify-between md:justify-start py-2'>
                        <p className='pr-2 text-lg'>Bold Text:</p>
                        <input 
                            type="checkbox" 
                            id="bold_text" 
                            checked={userSettings.bold_text}
                            onChange={(e) => handleUpdate('bold_text', e.target.checked)}
                        />
                    </div>
                    {/* <div className='flex justify-between md:justify-start py-2 hidden'>
                        <p className='pr-2 text-lg'>Screen Reader Support:</p>
                    </div> */}
                </div>
                <div className='text-left py-2 px-2'>
                    <h1 className='text-2xl text-left'>Auto-Update</h1>
                    <div className='flex justify-between md:justify-start py-2'>
                        <p className='pr-2 text-lg'>Update Frequency:</p>
                        <select 
                            id="update_frequency" 
                            className='text-lg border-1 ring-focus rounded-md'
                            value={userSettings.update_frequency}
                            onChange={(e) => handleUpdate('update_frequency', e.target.value)}
                            // onChange={(e) => setUserSettings(prev => ({ ...prev, update_frequency: e.target.value }))}
                        >
                            <option value="15 minutes">15 minutes</option>
                            <option value="30 minutes">30 minutes</option>
                            <option value="1 hour">1 hour</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}