"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ArrowLeft} from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

export default function Notifications(){
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [userNotifications, setuserNotifications] = useState({
        push_notifications_enabled: false,
        push_notify_login: false,
        notification_tone: false,
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
    
            async function fetchUserNotifications() {
                try{
                    const userResponse = await fetch(`/api/notifications/${userId}`);
                    const userData = await userResponse.json();
                    setuserNotifications(userData);
                } catch (error){
                    console.log("Fetch error:", error)
                    // router.push('/login');
                }
            }
            fetchUserNotifications();
        }, [userId]);

        const handleUpdate = async (field, value) => {
            const updated = { ...userNotifications, [field]: value };
            setuserNotifications(updated);
            await fetch(`/api/notifications/${userId}`, {
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
                    <h1 className='text-4xl font-bold'>Notifications</h1>
                </div>
                {/* <div className='text-left p-2 hidden'>
                    <h1 className='text-2xl'>Email Notifications</h1>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Receive marketing emails:</p>
                        <input 
                            type="checkbox"
                            id="email_marketing" 
                            checked={!!userNotifications?.email_marketing}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, email_marketing: e.target.checked }))}
                        />
                    </div>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Receive account activity emails:</p>
                        <input 
                            type="checkbox"
                            id="email_account_activity" 
                            checked={!!userNotifications?.email_account_activity}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, email_account_activity: e.target.checked }))}
                        />
                    </div>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Receive newsletter:</p>
                        <input 
                            type="checkbox"
                            id="email_newsletter" 
                            checked={!!userNotifications?.email_newsletter}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, email_newsletter: e.target.checked }))}
                        />
                    </div>
                </div> */}
                <div className='text-left p-2'>
                    <h1 className='text-2xl'>Push Notifications</h1>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Enable push notifications:</p>
                        <input 
                            type="checkbox"
                            id="push_notifications" 
                            checked={userNotifications.push_notifications_enabled ?? false}
                            onChange={(e) => handleUpdate('push_notifications_enabled', e.target.checked)}
                        />
                    </div>
                    {/* <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Notify on new messages:</p>
                        <input 
                            type="checkbox"
                            id="push_messages" 
                            checked={!!userNotifications?.push_messages}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, push_messages: e.target.checked }))}
                        />
                    </div> */}
                    <div className='py-2 flex justify-between md:justify-start'>
                        <p className='pr-2 text-lg'>Notify on login attempts:</p>
                        <input 
                            type="checkbox"
                            id="push_login_attempts" 
                            checked={userNotifications.push_notify_login}
                            onChange={(e) => handleUpdate('push_notify_login', e.target.checked)}
                        />
                    </div>
                </div>
                {/* <div className='text-left p-2 hidden'>
                    <h1 className='text-2xl'>SMS Alerts</h1>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Alert on password changes:</p>
                        <input 
                            type="checkbox"
                            id="sms_password_changes" 
                            checked={!!userNotifications?.sms_password_changes}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, sms_password_changes: e.target.checked }))}
                        />
                    </div>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Alert on promotions:</p>
                        <input 
                            type="checkbox"
                            id="sms_promotions" 
                            checked={!!userNotifications?.sms_promotions}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, sms_promotions: e.target.checked }))}
                        />
                    </div>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Notify on login attempts:</p>
                        <input 
                            type="checkbox"
                            id="sms_login_attempts" 
                            checked={!!userNotifications?.sms_login_attempts}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, sms_login_attempts: e.target.checked }))}
                        />
                    </div>
                </div>
                <div className='text-left p-2 hidden'>
                    <h1 className='text-2xl'>Notification Tone</h1>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Tone:</p>
                        <select 
                            id="notification_tone" 
                            className='text-lg border-1 ring-focus rounded-md'
                            // value={userNotifications.notification_tone}
                            // onChange={(e) => userNotifications(prev => ({ ...prev, notification_tone: e.target.value }))}
                        >
                            <option value="Default">Default</option>
                            <option value="Chime">Chime</option>
                            <option value="Silent">Silent</option>
                        </select>
                    </div>
                </div>
                <div className='text-left p-2 hidden'>
                    <h1 className='text-2xl'>Down Time</h1>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Enable Do Not Disturb:</p>
                        <input 
                            type="checkbox"
                            id="DnD" 
                            checked={!!userNotifications?.DnD}
                            onChange={(e) => setuserNotifications(prev => ({ ...prev, DnD: e.target.checked }))}
                        />
                    </div>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>Start Time:</p>
                        <input 
                            type="time"
                            id="down_time_start"
                            value={userNotifications?.down_time_start || ''} 
                            onChange={(e) => setuserNotifications((prev) => ({...prev, down_time_start: e.target.value }))}  
                        />
                    </div>
                    <div className='py-2 flex justify-between md:justify-start border-b-2 border-gray-300'>
                        <p className='pr-2 text-lg'>End Time:</p>
                        <input 
                            type="time"
                            id="down_time_end"
                            value={userNotifications?.down_time_end || ''} 
                            onChange={(e) => setuserNotifications((prev) => ({...prev, down_time_end: e.target.value }))} 
                        />
                    </div>
                </div> */}
                
                
                
                <div className='flex justify-center pb-8'>
                    <h1 className='text-2xl'></h1>
                </div>
            </div>
        </div>
    )
}