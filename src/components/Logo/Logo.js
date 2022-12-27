import React from 'react';
import Tilt from 'react-parallax-tilt';
import './Logo.css'
import brain from './brain.png'

const Logo = () => {
    return (
        <Tilt style={{width:'150px'}}>
            <div className='parallax br3 shadow-2 flex justify-center' style={{ height: '150px', width:"150px", scale:'.7'}}>
                <h1>
                    <img src={brain} alt='brain' height={'110px'}></img>
                </h1>
            </div>
        </Tilt>
    );
}

export default Logo;