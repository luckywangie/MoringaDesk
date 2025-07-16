import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import { ToastContainer } from 'react-toastify';

export default function Layout() {
    return (
    <div>
        <Navbar />

        <div className='container mx-auto min-h-[80vh] p-4' >
                    <Outlet />

                     <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false}
                      rtl={false} pauseOnFocusLoss draggableposition pauseOnHover theme="light" />
        </div>

        <Footer />
    </div>
    )
}