"use client";

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function EditProfile() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [image, setImage] = useState(session?.user?.image || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update user profile
    await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image }),
    });
  };

  if (!session) {
    return <div>Please login first</div>;
  }

  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-md mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Avatar URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ y: 0 }}
            type="submit"
            className="w-full bg-black text-nude-beige py-3 px-4 rounded-lg font-semibold"
          >
            Save Changes
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}