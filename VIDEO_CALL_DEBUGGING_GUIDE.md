# Video Call Debugging Guide - FOLLOW THIS STEP BY STEP

## 🚀 QUICK TEST (5 minutes)

### Step 1: Open Two Browser Windows
- **Device 1 (Laptop)**: Open https://vibely-chat-app.vercel.app/room/test123
- **Device 2 (Phone)**: Open same URL
- Both MUST be in same room ID (test123)

### Step 2: Enable Browser Console Debugging
- On both devices: Press `F12` (or right-click → Inspect → Console)
- Keep console visible
- Set filter to show all messages (not just errors)

### Step 3: Start Video Call on DEVICE 1
1. Click "Start Video Call"
2. Allow camera permission
3. Allow microphone permission
4. Allow location access
5. **WATCH CONSOLE - Look for messages starting with:**
   - ✅ "PeerJS OPEN"
   - 📡 "Publishing peer ID"
   - "Fetched peer IDs"

### Step 4: Start Video Call on DEVICE 2
1. Same permissions as above
2. **WATCH CONSOLE - Look for:**
   - ✅ "PeerJS OPEN"  
   - 📡 "Publishing peer ID"
   - "Found remote peer"
   - 🔴 "Making call to remote peer"

---

## 📊 EXPECTED LOG SEQUENCE

### Device 1 (Initiator):
```
✅ PeerJS OPEN - My peer ID is: peer-1716447386123-abc123
📡 Publishing peer ID: peer-1716447386123-abc123 for user: user1
✅ Peer ID published successfully
Initializing VideoCall complete
Waiting for remote peer... (IDs found: 1)
Waiting for remote peer... (IDs found: 1)
Found remote peer: peer-1716447386789-def456
🔴 Making call to remote peer: peer-1716447386789-def456
Stream ready: true Peer ref: true
Call created: new
📞 Incoming call from: peer-1716447386789-def456
Answering with stream...
✅ Got remote stream from incoming call
```

### Device 2 (Receiver):
```
✅ PeerJS OPEN - My peer ID is: peer-1716447386789-def456
📡 Publishing peer ID: peer-1716447386789-def456 for user: user2
✅ Peer ID published successfully
Found remote peer: peer-1716447386123-abc123
🔴 Making call to remote peer: peer-1716447386123-abc123
✅ Got remote stream
```

---

## 🔴 COMMON ISSUES & SOLUTIONS

### Issue 1: "PeerJS OPEN" never appears
**Cause**: PeerJS cloud server not connecting
**Solution**:
- Check internet connection (try WiFi)
- Try different browser (Chrome, Firefox, Safari)
- Check if `0.peerjs.com` is accessible from your network
- **Status**: Contact support if still blocked

### Issue 2: "Publishing peer ID" shows but error follows
**Cause**: Database or API issue
**Solution**:
- Check if MongoDB is running
- Verify API keys in `.env.local`
- Check server logs
- **Status**: May indicate server-side problem

### Issue 3: "Found remote peer" appears but no call made
**Cause**: Stream not ready or peer reference broken
**Console shows**: 
- "Stream ready: false" OR
- "Peer ref: false"
**Solution**:
- Verify camera/microphone actually granted (browser settings)
- Try different browser
- Restart video call

### Issue 4: Call created but no remote stream received
**Cause**: Firewall/NAT issues or remote peer not answering
**Console shows**:
- "🔴 Making call to remote peer" ✅
- But NO "✅ Got remote stream" ❌
**Solution**:
- Try both devices on SAME WiFi
- Try different network (WiFi vs mobile)
- Check firewall settings
- Restart both browsers

### Issue 5: "❌ Connection error" message
**Console shows**: Full error details
**Solution**:
- Read error message carefully
- Google the specific error
- Try fallback: audio only or video only
- **If persists**: Provide full console output for debugging

---

## 📱 TESTING VARIANTS

### Test 1: Same WiFi Network
**Status**: Should work reliably if everything else is OK
- Laptop: Open app
- Phone on same WiFi: Open app
- This tests local network connectivity

### Test 2: Different Networks
**Status**: Tests internet connectivity
- Laptop on WiFi
- Phone on 4G/Mobile data
- This tests public internet and NAT traversal

### Test 3: Different Browsers
**Status**: Tests browser compatibility
- Laptop: Chrome
- Phone: Safari
- Tests cross-browser PeerJS compatibility

---

## 🔧 MANUAL VERIFICATION

### Check 1: Peer IDs are in Database
1. Open browser console on Device 1
2. Run:
```javascript
fetch('/api/chat/peer?roomId=test123')
  .then(r => r.json())
  .then(d => console.log('Peer IDs:', d.peerIds))
```
3. Should show array with 2 entries (one from each device)

### Check 2: Call Status is Tracked
1. Run:
```javascript
fetch('/api/chat/call?roomId=test123')
  .then(r => r.json())
  .then(d => console.log('Call status:', d))
```
3. Should show `callStatus: 'active'` when call is happening

### Check 3: Media Stream is Available
1. When in video call, run:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => console.log('Devices:', devices))
```
3. Should show camera and microphone devices

---

## 📋 REPORT FORMAT

When reporting issue, provide:

```
Device 1 (Initiator): [Laptop/Phone] [Browser] [Network]
Device 2 (Receiver): [Laptop/Phone] [Browser] [Network]

Full Console Output from Device 1:
[Paste entire console log]

Full Console Output from Device 2:
[Paste entire console log]

Last successful log message:
[e.g., "PeerJS OPEN", "Found remote peer", etc.]

Error message (if any):
[Copy exact error]
```

---

## ✅ SUCCESS INDICATORS

When connection works, you should see:
1. ✅ Your video appears in left panel
2. ✅ Remote video appears in right panel  
3. ✅ Audio works both ways (speak and hear)
4. ✅ Console shows "✅ Got remote stream"
5. ✅ mute/video-off buttons work
6. ✅ Can send messages while in call

---

## 🚨 IF NOTHING WORKS

1. **Clear cache** - Ctrl+Shift+Delete, clear everything
2. **Hard refresh** - Ctrl+Shift+R
3. **Try incognito** - New private window
4. **Try different network** - WiFi vs mobile  
5. **Different browser** - Chrome, Firefox, Safari
6. **Different devices** - Tablet, laptop, phone
7. **Check Vercel logs** - Dashboard → Deployments → View Details

---

**Updated**: May 23, 2026  
**For Support**: Check console logs first, then share full output with developers
