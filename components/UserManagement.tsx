import React, { useState } from 'react';
import { Users, Search, MoreHorizontal, Shield, MapPin, UserCheck, UserX, Mail } from 'lucide-react';

const initialUsers = [
    { id: 1, name: 'Jane Doe', email: 'jane.doe@acme.com', role: 'General User', region: 'Global', status: 'Active' },
    { id: 2, name: 'John Smith', email: 'john.smith@acme.com', role: 'Admin', region: 'North America', status: 'Active' },
    { id: 3, name: 'Sarah Connor', email: 'sarah.c@acme.com', role: 'General User', region: 'Europe', status: 'Inactive' },
    { id: 4, name: 'Mike Ross', email: 'mike.ross@acme.com', role: 'General User', region: 'APAC', status: 'Active' },
    { id: 5, name: 'Jessica Pearson', email: 'j.pearson@acme.com', role: 'Admin', region: 'Global', status: 'Active' },
];

export const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState(initialUsers);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Add New User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                        <Shield className="h-3 w-3" />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        {user.region}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                                        {user.status === 'Active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                        <MoreHorizontal className="h-4 w-4" />
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