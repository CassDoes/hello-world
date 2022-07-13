import React from 'react';
import { Icon } from '@iconify/react';
import gripLinesVertical from '@iconify/icons-fa-solid/grip-lines-vertical';


const FooterBody = () => {
  return (
    
    <footer className="relative"> 
      <div className="pb-1 w-full bg-gray-300 rounded-t-2xl display-contents lg:hidden text-xl" 
        id='open'>
        <a href='#close'><Icon icon={gripLinesVertical} height='30' rotate={1} vFlip={true}/></a>
        <div className='grid grid-cols-2 text-left py-2 mx-3'>
          <a href='/about'className='m-1'>About</a>
          <a href='/'className='m-1'>Support</a>
          <a href='/terms'className='m-1'>Terms</a>
        </div>
      </div>
    </footer>
  );
}
export default FooterBody;