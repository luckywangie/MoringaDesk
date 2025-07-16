import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';

const mockUsers = [
  { id: 2, name: 'Jane Moringa', email: 'jane@example.com' },
  { id: 3, name: 'Peter Code', email: 'peter@example.com' },
];

const mockMessages = {
  2: [
    { id: 1, from: 'me', text: 'Hi Jane!', time: '10:00 AM' },
    { id: 2, from: 'Jane Moringa', text: 'Hey! How are you?', time: '10:01 AM' },
  ],
  3: [
    { id: 1, from: 'me', text: 'Hello Peter', time: 'Yesterday' },
    { id: 2, from: 'Peter Code', text: 'Hi there!', time: 'Yesterday' },
  ],
};

const ChatPage = () => {
  const { user } = useContext(UserContext);
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    if (selectedUserId) {
      setMessages(mockMessages[selectedUserId] || []);
    }
  }, [selectedUserId]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Please log in to access chat.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Users List - Left */}
        <div className="md:col-span-1 bg-white border rounded-lg shadow p-4 h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold text-green-700 mb-4">Users</h3>
          <ul className="space-y-3">
            {mockUsers.map((u) => (
              <li
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`p-3 rounded-lg cursor-pointer border hover:border-green-500 transition ${
                  selectedUserId === u.id ? 'bg-green-50 border-green-600' : 'bg-white'
                }`}
              >
                <div className="font-semibold text-black">{u.name}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Box - Right */}
        <div className="md:col-span-3 bg-white border rounded-lg shadow p-4 flex flex-col h-[80vh]">
          <div className="border-b pb-3 mb-3">
            <h2 className="text-xl font-bold text-green-700">
              Chat with {mockUsers.find(u => u.id === selectedUserId)?.name || 'User'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                  msg.from === 'me'
                    ? 'bg-green-100 text-black self-end ml-auto'
                    : 'bg-gray-200 text-black self-start'
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">{msg.time}</div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center gap-2 border-t pt-3">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
