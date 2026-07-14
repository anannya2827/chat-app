import React, { useState, useEffect, useRef } from 'react';
import { auth, provider, db, signInWithPopup, signOut, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Sync auth state change listener
  useEffect(() => {
    return auth.onAuthStateChanged((usr) => setUser(usr));
  }, []);

  // FIXED REAL-TIME ENGINE: Seamless message synchronization loop
  useEffect(() => {
    if (!activeRoom) return;

    // Setting up query targets explicitly
    const q = query(
      collection(db, "messages"), 
      where("room", "==", activeRoom), 
      orderBy("createdAt", "asc")
    );

    // Active pipeline snapshot listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeMessages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMessages(activeMessages);
    }, (error) => {
      console.error("Firestore sync error: ", error.message);
      alert("Realtime synchronization pending. Please make sure step 2 is configured in the console!");
    });

    return () => unsubscribe();
  }, [activeRoom]);

  // Auto-scroll anchor point tracker
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

  // 1. Authorization Card Layout View
  if (!user) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.glassCard}>
          <div style={styles.brandBadge}>v2.1 PIPELINE ACTIVE</div>
          <h1 style={styles.mainTitle}>DevChat Hub</h1>
          <p style={styles.subtitle}>Coordinate securely inside real-time distributed workspace environments.</p>
          <button onClick={() => signInWithPopup(auth, provider)} style={styles.primaryBtn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style={styles.btnIcon}/>
            Secure Authorization via Google
          </button>
        </div>
      </div>
    );
  }

  // 2. Verified Room Selector Entrance Dashboard
  if (!activeRoom) {
    return (
      <div style={styles.dashboardWrapper}>
        <div style={styles.glassCard}>
          <div style={styles.profileHeader}>
            <img src={user.photoURL} alt="Avatar" style={styles.avatarLarge} />
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>Agent: {user.displayName}</h3>
              <span style={styles.statusIndicator}>● Connection Secure</span>
            </div>
          </div>

          <div style={styles.formContainer}>
            <label style={styles.fieldLabel}>Target Room Name Path</label>
            <input 
              placeholder="e.g., general, production, staging" 
              value={room}
              onChange={e => setRoom(e.target.value)} 
              style={styles.darkInput} 
            />
            <button 
              onClick={() => room.trim() && setActiveRoom(room.trim().toLowerCase())} 
              style={{ ...styles.primaryBtn, width: '100%', marginTop: '10px' }}
            >
              Establish Room Pipeline
            </button>
          </div>

          <button onClick={() => signOut(auth)} style={styles.secondaryBtn}>Disconnect Session</button>
        </div>
      </div>
    );
  }

  // 3. Complete Real-Time Multi-Room Interaction View
  return (
    <div style={styles.chatViewport}>
      <div style={styles.chatPanel}>
        <header style={styles.chatHeader}>
          <button onClick={() => setActiveRoom(null)} style={styles.backBtn}>← Disconnect Matrix</button>
          
          {/* VERIFIED ROOM ROOM PATH BAR: Ensures users can immediately check room parity */}
          <div style={{ textAlign: 'right' }}>
            <div style={styles.roomBadge}>
              <span style={{ color: '#00e676' }}>#</span>{activeRoom}
            </div>
            <span style={styles.parityLabel}>Channel Address Verified</span>
          </div>
        </header>

        <div style={styles.messageStream}>
          {messages.map((msg) => {
            const isMe = msg.uid === user.uid;
            return (
              <div key={msg.id} style={{ ...styles.msgWrapper, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && <img src={msg.photo || 'https://api.dicebear.com/7.x/bottts/svg'} alt="U" style={styles.avatarSmall} />}
                <div style={{ 
                  ...styles.msgBubble, 
                  backgroundColor: isMe ? '#007bff' : '#21262d', 
                  borderBottomRightRadius: isMe ? '2px' : '12px', 
                  borderBottomLeftRadius: isMe ? '12px' : '2px' 
                }}>
                  {!isMe && <span style={styles.usernameLabel}>{msg.user}</span>}
                  <p style={{ margin: 0, fontSize: '15px', color: '#fff' }}>{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={styles.chatFooter}>
          <input 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder={`Send message to verification path #${activeRoom}...`} 
            style={styles.footerInput} 
          />
          <button type="submit" style={styles.sendIconBtn}>Send</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  authWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'radial-gradient(circle at top right, #111827, #030712)', padding: '20px' },
  dashboardWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'radial-gradient(circle at top right, #064e3b, #030712)', padding: '20px' },
  chatViewport: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#030712', padding: '10px' },
  glassCard: { background: '#0d1117', border: '1px solid #30363d', padding: '40px', borderRadius: '16px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center' },
  brandBadge: { display: 'inline-block', backgroundColor: 'rgba(0, 230, 118, 0.1)', color: '#00e676', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' },
  mainTitle: { color: '#ffffff', fontSize: '32px', margin: '0 0 10px 0', fontWeight: '700' },
  subtitle: { color: '#8b949e', fontSize: '15px', lineHeight: '1.5', margin: '0 0 30px 0' },
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#ffffff', color: '#0d1117', border: 'none', padding: '14px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  secondaryBtn: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginTop: '25px', fontSize: '14px', textDecoration: 'underline' },
  btnIcon: { width: '18px', height: '18px' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left', borderBottom: '1px solid #30363d', paddingBottom: '20px', marginBottom: '25px' },
  avatarLarge: { width: '54px', height: '54px', borderRadius: '50%', border: '2px solid #00e676' },
  statusIndicator: { display: 'block', fontSize: '12px', color: '#00e676', marginTop: '4px' },
  formContainer: { textAlign: 'left', marginBottom: '10px' },
  fieldLabel: { display: 'block', color: '#c9d1d9', fontSize: '13px', marginBottom: '8px' },
  darkInput: { width: '100%', boxSizing: 'border-box', backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '14px', color: '#fff', fontSize: '16px', outline: 'none' },
  chatPanel: { display: 'flex', flexDirection: 'column', height: '90vh', width: '100%', maxWidth: '750px', backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden' },
  chatHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #30363d', backgroundColor: '#0d1117' },
  backBtn: { background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '14px' },
  roomBadge: { color: '#ffffff', fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.5px' },
  parityLabel: { fontSize: '10px', color: '#8b949e', display: 'block' },
  messageStream: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#0d1117' },
  msgWrapper: { display: 'flex', alignItems: 'flex-end', gap: '10px', maxWidth: '75%' },
  avatarSmall: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #30363d' },
  msgBubble: { padding: '12px 16px', borderRadius: '14px' },
  usernameLabel: { display: 'block', fontSize: '11px', color: '#58a6ff', fontWeight: 'bold', marginBottom: '4px' },
  chatFooter: { display: 'flex', padding: '15px', borderTop: '1px solid #30363d', backgroundColor: '#0d1117' },
  footerInput: { flex: 1, backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '12px 16px', color: '#fff', fontSize: '15px', outline: 'none' },
  sendIconBtn: { marginLeft: '10px', padding: '0 20px', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};
