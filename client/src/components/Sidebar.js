import React from 'react';
import { list, iconPlus} from './icons.js'
import { NavLink } from 'react-router-dom';

import "bootstrap/dist/css/bootstrap.min.css";

import "./Sidebar.css";

const Sidebar = (props) => {
    
    return (
        <div className="editSidebar">
            <NavLink to={{pathname: '/'}} className='nav-link' onClick={() => props.setUpdated(true)}>{list}&nbsp;Questionari pubblicati</NavLink>        
            <NavLink to={{pathname: '/new'}} className='nav-link'>{iconPlus}&nbsp;Crea questionario</NavLink>        
        </div>
    );
};

export default Sidebar;
