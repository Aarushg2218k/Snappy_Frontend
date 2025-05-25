import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { host } from '../utils/APIRoutes';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      const res = await fetch(`${host}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error:', errorData);
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      const res = await fetch(`${host}/api/admin/user/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4e0eff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f1f2e',
      color: 'white'
    });
  
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${host}/api/admin/user/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (res.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'User has been deleted.',
            icon: 'success',
            confirmButtonColor: '#4e0eff',
            background: '#1f1f2e',
            color: 'white'
          });
          fetchUsers();
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#4e0eff',
          background: '#1f1f2e',
          color: 'white'
        });
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="text-white p-4">Loading users...</p>;

  return (
    <div className="container-fluid vh-100 py-4" style={{ backgroundColor: "#131324", color: "white", fontFamily: "sans-serif" }}>
      <h2 className="mb-4 text-white">👨‍💼 Admin Dashboard</h2>
      <div className="table-responsive bg-dark rounded shadow-sm p-3">
        <table className="table table-dark table-bordered align-middle mb-0">
          <thead style={{ backgroundColor: '#0e1a35' }}>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="btn btn-sm fw-bold"
                    style={{ backgroundColor: '#4e0eff', color: 'white' }}
                    onClick={() => updateRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                  >
                    Make {u.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm fw-bold"
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                    onClick={() => deleteUser(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
