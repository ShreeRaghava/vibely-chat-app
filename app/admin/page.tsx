"use client";

import { useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  banned: boolean;
  reportsReceived: number;
}

interface Report {
  _id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
  };

  const fetchReports = async () => {
    const res = await fetch('/api/admin/reports');
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  const banUser = async (userId: string) => {
    await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user._id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-dark-grey">{user.email}</p>
                    <p className="text-sm">Reports: {user.reportsReceived}</p>
                  </div>
                  <button
                    onClick={() => banUser(user._id)}
                    className={`px-3 py-1 rounded ${user.banned ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    {user.banned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Reports</h2>
            <div className="space-y-2">
              {reports.map(report => (
                <div key={report._id} className="p-2 border rounded">
                  <p><strong>Reporter:</strong> {report.reporter}</p>
                  <p><strong>Reported:</strong> {report.reportedUser}</p>
                  <p><strong>Reason:</strong> {report.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}