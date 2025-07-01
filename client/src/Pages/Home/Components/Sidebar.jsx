import React from 'react'
import Search from './Search'
import { useState } from 'react'
import UserList from './UserList'

const Sidebar = ({socket , onlineUser }) => {
    const [searchKey, setSearchKey] = useState('')
    return (
        <div className="app-sidebar">
            {/* Search  */}
            <Search searchKey={searchKey} setSearchKey={setSearchKey} />
            {/* User List compoennt */}
            <UserList searchKey={searchKey} onlineUser={onlineUser} socket={socket}/>
        </div>
    )
}

export default Sidebar
