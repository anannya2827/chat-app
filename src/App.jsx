import React, { useState, useEffect } from 'react';
import { auth, provider, db, signInWithPopup, signOut, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Track login state
  useEffect(() => {
    return auth.onAuthStateChanged((usr) => setUser(usr));
  }, []);

  // Listen for real-time messages when activeRoom changes
  useEffect(() => {
    if (!activeRoom) return;
    const q = query(collection(db, "messages"), where("room", "==", activeRoom), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeRoom]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      text, room: activeRoom, user: user.displayName, createdAt: serverTimestamp()
    });
    setText("");
  };

  // 1. If not logged in, show login button
  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2>Simple Firebase Chat</h2>
        <button onClick={() => signInWithPopup(auth, provider)} style={{ padding: '10px 20px', fontSize: '16px' }}>Sign In with Google</button>
      </div>
    );
  }

  // 2. If logged in but no room chosen, show Lobby
  if (!activeRoom) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2>Welcome, {user.displayName}!</h2>
        <input placeholder="Enter Room Name" onChange={e => setRoom(e.target.value)} style={{ padding: '8px', marginRight: '5px' }} />
        <button onClick={() => room.trim() && setActiveRoom(room.trim().toLowerCase())} style={{ padding: '8px 15px' }}>Join Room</button>
        <br/><br/>
        <button onClick={() => signOut(auth)} style={{ color: 'red' }}>Sign Out</button>
      </div>
    );
  }

  // 3. Show active chat interface
  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => setActiveRoom(null)}>← Leave Room</button>
        <strong>Room: {activeRoom.toUpperCase()}</strong>
      </div>

      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px', backgroundColor: '#fafafa' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ margin: '8px 0' }}>
            <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>{msg.user}</span>
            <span style={{ backgroundColor: '#e1f5fe', padding: '6px 10px', borderRadius: '4px', display: 'inline-block' }}>{msg.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '8px' }} />
        <button type="submit" style={{ padding: '8px 15px' }}>Send</button>
      </form>
    </div>
  );
}