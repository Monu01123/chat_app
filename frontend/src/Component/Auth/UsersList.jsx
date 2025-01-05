import React from 'react';

const UsersList = ({ users, activeUsers, setCurrentRecipient }) => (
  <div>
    <h3>All Users</h3>
    <ul>
      {users.map((user, index) => (
        <li
          key={index}
          onClick={() => setCurrentRecipient(user.username)}
          style={{ cursor: 'pointer', color: activeUsers.includes(user.username) ? 'green' : 'black' }}
        >
          {user.username}
        </li>
      ))}
    </ul>
  </div>
);

export default UsersList;
