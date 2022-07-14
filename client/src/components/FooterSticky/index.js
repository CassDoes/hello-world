import React from 'react';
import { Icon } from '@iconify/react';
import hamburgerIcon from '@iconify/icons-ph/hamburger';
import chatText from '@iconify/icons-bi/chat-text';
import homeIcon from '@iconify/icons-iconoir/home';
import codeIcon from '@iconify/icons-fa/code';
import searchLoading from '@iconify/icons-gg/search-loading';
import LogoLg from '../LogoLg';

const FooterSticky = () => {
  return (
    
    // <div className='hidden lg:contents'>
    // <div id="border">
    //   <nav className='' id="second-border">
    //     <div className='' id='content'>
    //       hkjhkgh
    //     </div>
        
    //   </nav>
    // </div>
    // </div>

    <footer className="h-16 fixed bottom-0 w-full bg-gray-300 rounded-t-xl display-contents">
      <div className='flex flex-row justify-around items-center py-2'>
        <a href='/profile'><Icon icon={homeIcon} height="42" /></a>
        <a href='/'><Icon icon={searchLoading} height="42" className='invisible sm:visible'/></a>
        <a href='/projecthub'><Icon icon={codeIcon} height="32" /></a>
        <a href='/'><Icon icon={chatText} height="36" className='invisible sm:visible'/></a>
        <a href='#open'><Icon icon={hamburgerIcon} height="42" /></a>
      </div>
    </footer>
  );
}
export default FooterSticky;