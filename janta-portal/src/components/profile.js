"use client";
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft} from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

export default function Profile(){
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [showError, setShowError] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
    
        if (!token) {
            router.push('/');
            return;
        }
    
        try {
            const decoded = jwtDecode(token); // should be { id }
            setUserId(decoded.id); // store in state
        } catch (error) {
            console.error('Invalid token', error);
            localStorage.removeItem('token');
            router.push('/');
            return;
        }
    }, []);

    useEffect(() => {
        if (!userId) return; // Don't fetch until ID is set

        async function fetchUserData() {
            try{
                const userResponse = await fetch(`/api/user/${userId}`);
                const userData = await userResponse.json();
                setUser(userData);
                setName(userData.name); 
                setEmail(userData.email);

            } catch (error){
                console.log("Fetch error:", error)
                // router.push('/login');
            }
        }
        fetchUserData();
    }, [userId]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!userId) {
            setShowError(true);
            setTimeout(() => setShowError(false), 4000);
            // setMessage("Missing user ID");
            return;
        }

        const res = await fetch(`/api/user/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        });
      
        const data = await res.json();
      
        if (res.ok) {
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 4000);
            // setMessage('Profile updated successfully!'); // Clear the message
        } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 4000);
            // setMessage(data.error || 'Failed to update profile'); // Clear the message
        }
    };

    if (!user) {
        return <p className="bg-[#f7e2cc] w-screen h-screen flex items-center justify-center text-black text-2xl ">Loading...</p>;
    }
    return(
        <div className='w-screen max-w-screen overflow-hidden h-screen md:h-screen pb-4 text-center bg-[#f7e2cc] text-black'>     
            <div className='py-8 relative w-full h-32'>
                {/* Back Button */}
                <Link href="/towerselect" className="absolute top-7 left-8">
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
                    <h1 className='text-4xl font-bold'>Profile</h1>
                </div>
                <div className='text-center space-y-2 p-2'>
                    <img
                        className='w-full sm:w-auto h-auto mx-auto'
                        src='/images/avatar.png'
                        alt='Avatar' 
                        style={{
                            height:'7em', 
                            width:'7em',
                            borderRadius: '50%', // makes the image circular
                            objectFit: 'cover', 
                        }} 
                    />
                    <h1 className='text-2xl'>{user.name}</h1>
                </div>
                <form onSubmit={handleUpdate}>
                    <div className='text-left p-2'>
                        {showMessage && (
                            <div className="bg-green-200 border border-green-600 text-green-800 px-4 py-2 rounded mb-4 text-center">
                                Profile updated successfully.
                            </div>
                        )}
                        {showError && (
                            <div className="bg-red-400 border border-green-600 text-green-800 px-4 py-2 rounded mb-4 text-center">
                                Failed to update profile.
                            </div>
                        )}
                        <h1 className='text-2xl'>Personal Info</h1>
                        <div className='flex justify-between md:justify-start py-2 text-lg'>
                            <p className='pr-2'>Name:</p>
                            <input 
                                type="text" 
                                id="firstname" 
                                className='border-1 border-black ring-2 pl-1'
                                value= {name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className='flex justify-between md:justify-start py-2 text-lg'>
                            <p className='pr-2'>Email:</p>
                            <input 
                                type="email" 
                                id="email" 
                                className='border-1 border-black ring-2 pl-1'
                                value= {email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='py-2'>
                            <button type='submit' value="Save" className='border-2 p-1 cursor-pointer rounded-md hover:focus hover:bg-white bg-orange-400'>Save</button>
                        </div>
                    </div>
                </form>
                <div className='flex justify-center pb-2'>
                    <div className='py-2'>
                        <input type='submit' value="Delete Account" className='border-2 border-black p-2 text-white text-xl cursor-pointer rounded-md hover:focus hover:border-black bg-red-600 ring-2'></input>
                    </div>
                </div>
            </div>
        </div>
    )
}