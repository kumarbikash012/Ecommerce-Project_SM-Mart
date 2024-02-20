import React from 'react'
import './Navbar.css'
import navlogo  from '../../assets/logo.png'
import navProfile from '../../assets/nav-profile.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={navlogo} alt="" className="nav-logo" />
      <img src={navProfile} alt="" />
    </div>
  )
}

export default Navbar
