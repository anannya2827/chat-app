import React, { useState, useEffect, useRef } from 'react';
import { auth, provider, db, signInWithPopup, signOut, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Sync auth state
  useEffect(() => {
    return auth.onAuthStateChanged((usr) => setUser(usr));
  }, []);

  // Sync real-time message stream
  useEffect(() => {
    if (!activeRoom) return;
    const q = query(collection(db, "messages"), where("room", "==", activeRoom), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeRoom]);

  // Auto-scroll to latest message dynamically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: text.trim(), 
      room: activeRoom, 
      user: user.displayName, 
      uid: user.uid,
      photo: user.photoURL,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  // 1. Interactive Landing Screen
  if (!user) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.glassCard}>
          <div style={styles.brandBadge}>v2.0 LIVE</div>
          <h1 style={styles.mainTitle}>DevChat Hub</h1>
          <p style={styles.subtitle}>Enter workspace pipelines, coordinate with teams, and stream logs in real time.</p>
          <button onClick={() => signInWithPopup(auth, provider)} style={styles.primaryBtn}>
            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/web-24dp/logo_googleg_color_24dp.png" alt="G" style={styles.btnIcon}/>
            Secure Authorization via Google
          </button>
        </div>
      </div>
    );
  }

  // 2. Room Selector Dashboard (Lobby)
  if (!activeRoom) {
    return (
      <div style={styles.dashboardWrapper}>
        <div style={styles.glassCard}>
          <div style={styles.profileHeader}>
            <img src={user.photoURL} alt="Avatar" style={styles.avatarLarge} />
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>Welcome back, {user.displayName}</h3>
              <span style={styles.statusIndicator}>● Active Pipeline Agent</span>
            </div>
          </div>

          <div style={styles.formContainer}>
            <label style={styles.fieldLabel}>Initialize Room Access Path</label>
            <input 
              placeholder="e.g., react, backend, bugs" 
              value={room}
              onChange={e => setRoom(e.target.value)} 
              style={styles.darkInput} 
            />
            <button 
              onClick={() => room.trim() && setActiveRoom(room.trim().toLowerCase())} 
              style={{ ...styles.primaryBtn, width: '100%', marginTop: '10px' }}
            >
              Establish Connection Matrix
            </button>
          </div>

          <button onClick={() => signOut(auth)} style={styles.secondaryBtn}>Disconnect Terminal</button>
        </div>
      </div>
    );
  }

  // 3. Real-Time Chat Engine View
  return (
    <div style={styles.chatViewport}>
      <div style={styles.chatPanel}>
        {/* Header section with room meta-info */}
        <header style={styles.chatHeader}>
          <button onClick={() => setActiveRoom(null)} style={styles.backBtn}>← Leave Room</button>
          <div style={styles.roomBadge}>
            <span style={{ color: '#00e676' }}>#</span> {activeRoom}
          </div>
        </header>

        {/* Message feed container */}
        <div style={styles.messageStream}>
          {messages.map((msg) => {
            const isMe = msg.uid === user.uid;
            return (
              <div key={msg.id} style={{ ...styles.msgWrapper, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && <img src={msg.photo || 'https://api.dicebear.com/7.x/bottts/svg'} alt="U" style={styles.avatarSmall} />}
                <div style={{ ...styles.msgBubble, backgroundColor: isMe ? '#2979ff' : '#263238', color: '#fff', borderBottomRightRadius: isMe ? '2px' : '12px', borderBottomLeftRadius: isMe ? '12px' : '2px' }}>
                  {!isMe && <span style={styles.usernameLabel}>{msg.user}</span>}
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.4' }}>{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Entry Form */}
        <form onSubmit={sendMessage} style={styles.chatFooter}>
          <input 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder={`Broadcast safely to #${activeRoom}...`} 
            style={styles.footerInput} 
          />
          <button type="submit" style={styles.sendIconBtn}>Send</button>
        </form>
      </div>
    </div>
  );
}

// Interactive Dark Theme & Glassmorphism Design Language Styling
const styles = {
  authWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'radial-gradient(circle at top right, #1a237e, #0d1117)', padding: '20px' },
  dashboardWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'radial-gradient(circle at top right, #004d40, #0d1117)', padding: '20px' },
  chatViewport: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d1117', padding: '10px' },
  
  glassCard: { background: 'rgba(22, 27, 34, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(12px)', padding: '40px', borderRadius: '16px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' },
  brandBadge: { display: 'inline-block', backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' },
  mainTitle: { color: '#ffffff', fontSize: '32px', margin: '0 0 10px 0', fontWeight: '700', letterSpacing: '-0.5px' },
  subtitle: { color: '#8b949e', fontSize: '15px', lineHeight: '1.5', margin: '0 0 30px 0' },
  
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#ffffff', color: '#0d1117', border: 'none', padding: '14px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '6px', cursor: 'pointer', transition: 'all 0.2s', width: '100%' },
  secondaryBtn: { background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', marginTop: '25px', fontSize: '14px', textDecoration: 'underline' },
  btnIcon: { width: '18px', height: '18px' },
  
  profileHeader: { display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', marginBottom: '25px' },
  avatarLarge: { width: '54px', height: '54px', borderRadius: '50%', border: '2px solid #00e676' },
  statusIndicator: { display: 'block', fontSize: '12px', color: '#00e676', marginTop: '4px' },
  
  formContainer: { textAlign: 'left', marginBottom: '10px' },
  fieldLabel: { display: 'block', color: '#c9d1d9', fontSize: '13px', marginBottom: '8px', fontWeight: '500' },
  darkInput: { width: '100%', boxSizing: 'border-box', backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '14px', color: '#fff', fontSize: '16px', transition: 'border 0.2s', outline: 'none' },
  
  chatPanel: { display: 'flex', flexDirection: 'column', height: '90vh', width: '100%', maxWidth: '750px', backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' },
  chatHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1f242c' },
  backBtn: { background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '14px' },
  roomBadge: { color: '#ffffff', fontWeight: 'bold', fontSize: '16px' },
  
  messageStream: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#0d1117' },
  msgWrapper: { display: 'flex', alignItems: 'flex-end', gap: '10px', maxWidth: '85%' },
  avatarSmall: { width: '32px', height: '32px', borderRadius: '50%', marginBottom: '2px' },
  msgBubble: { padding: '12px 16px', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' },
  usernameLabel: { display: 'block', fontSize: '11px', color: '#58a6ff', fontWeight: 'bold', marginBottom: '4px' },
  
  chatFooter: { display: 'flex', padding: '15px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1f242c' },
  footerInput: { flex: 1, backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '12px 16px', color: '#fff', fontSize: '15px', outline: 'none' },
  sendIconBtn: { marginLeft: '10px', padding: '0 20px', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '6px', fontSize: '14px' }
};
