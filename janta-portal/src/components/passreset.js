import React from 'react';

export default function Passreset(){
    return(
        <div className="relative w-screen h-screen text-center flex items-center justify-center">
            <div
                className="absolute inset-0 bg-[url('/images/vine_power_tower_scale60.jpg')] bg-cover bg-center brightness-75">
            </div>     
            <div className='relative flex md:min-w-1/5 justify-center md:border-2 rounded-md border-black w-full max-w-md md:bg-white md:shadow-lg shadow-black'>
                <div className='p-8'>
                    <img
                        className='w-full sm:w-auto h-auto rounded-lg mx-auto'
                        src='images/logo_mixed_black.svg'
                        alt='Janta logo' 
                        style={{height:'10em', width:'10em'}} 
                    />
                    <p className='text-black text-left font-bold py-2'> Hi $name,</p>
                    <p className='text-black text-left'>
                        You recently requested to reset your password for your Janta Portal account. Use the button below to reset it. 
                        <b> This password reset is only valid for the next 24 hours.</b>
                    </p>
                    <div className='my-6 text-center'>
                        <button type="submit" className='w-2/3 border-2 border-black rounded-lg bg-[#ecac5c] p-2 text-black hover:brightness-90'>
                            Reset your password
                        </button>
                    </div>
                    <p className='text-black text-left'>
                        For security, this request was received from a $Operating_sytem device using $browser_name. 
                        If you did not request a password reset, please ignore this email or <a className='underline cursor-pointer'>contact support</a> if you have questions.
                    </p>
                    <p className='text-black text-left mt-2'>
                        Thanks,
                    </p>
                    <p className='text-black text-left'>
                        Janta Portal Team
                    </p>
                </div>
            </div>
        </div>
    )
}