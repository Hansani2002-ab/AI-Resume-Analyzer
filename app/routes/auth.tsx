
export const meta = () => [
  { title: "Resumind | Auth" },
  {name: 'description', content: 'Log intoyour account'},
];

import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

const auth = () => {
  const { isLoading, auth } = usePuterStore(); 
 const location = useLocation();
  const navigate = useNavigate();

 
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next"); 


 useEffect(() => {
  if (auth.isAuthenticated) navigate( next); 
  
}, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className='gradient-border shadow-lg'>
        <section className='flex flex-col gap=8 bg-white rounded-2xl p-10'>
          <div className='flex flex-col items-center gap-2'>
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Vacancy</h2>
          </div>
          <div>
            {isLoading ? (
              <button className='auth-button animate-pulse'>
                <p>Signing you in...</p>
              </button>
            ):(
             <>
                {auth.isAuthenticated ? (
                   <button className='auth-button' onClick={auth.signOut}>
                    <p>Logout</p>
                   </button>
                ):(
                   <button className='auth-button' onClick={auth.signIn}>
                    <p>LogIn</p>
                   </button>
                )}
             </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default auth
