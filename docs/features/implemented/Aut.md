# FReD-11: User Authentication

**Version:** 1.0  
**Date:** November 22, 2025  
**Owner:** Product Team  
**Status:** 🔄 In Progress  
**Priority:** P0 (Must-Have for MVP)

---

## 1. Feature Name

**User Authentication (Stytch Integration)**

---

## 2. Goal

Implement secure, user-friendly authentication that allows users to create accounts, log in, and access their saved stories across devices.

**Success Looks Like:**
- Users can create accounts in <60 seconds
- 80%+ choose magic link over password
- Session persistence works across devices
- Zero security incidents
- Authentication doesn't feel like friction

---

## 3. User Story

**As a potential user,**  
**I want to create an account and log in easily and securely,**  
**So that I can save my stories and access them from any device without worrying about losing my work.**

---

## 4. Functional Requirements

### 4.1 Registration / Sign-Up

* **FR-1:** User can sign up with email address

* **FR-2:** Two registration methods available:
  1. **Magic Link (Primary):** Passwordless email-based authentication
  2. **Email + Password (Secondary):** Traditional registration

* **FR-3:** Email validation:
  - Valid email format required
  - Email uniqueness checked
  - No disposable email addresses

* **FR-4:** Password requirements (if using password method):
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character

* **FR-5:** Account creation triggers:
  - User record creation in Supabase
  - Welcome email sent
  - Initial preferences set

### 4.2 Login / Sign-In

* **FR-6:** Magic Link login process:
  1. User enters email
  2. System sends magic link to email
  3. User clicks link
  4. User automatically logged in
  5. Session created

* **FR-7:** Magic link properties:
  - Valid for 60 minutes
  - Single-use only
  - Includes redirect to intended page

* **FR-8:** Password login process:
  1. User enters email + password
  2. System validates credentials
  3. Session created on success
  4. Error message on failure

* **FR-9:** "Remember Me" option:
  - 30-day session if checked
  - 7-day session if unchecked

* **FR-10:** Failed login handling:
  - Clear error messages
  - No indication of whether email exists (security)
  - Rate limiting after 5 failed attempts

### 4.3 Session Management

* **FR-11:** Session duration:
  - Default: 7 days
  - With "Remember Me": 30 days
  - Auto-logout on inactivity: 7 days

* **FR-12:** Session persistence:
  - JWT token stored in httpOnly cookie
  - Token refresh before expiration
  - Cross-device session support

* **FR-13:** Concurrent sessions:
  - Allow multiple devices
  - Show active devices in settings
  - Ability to revoke sessions

### 4.4 Password Reset

* **FR-14:** Reset process:
  1. User clicks "Forgot Password"
  2. Enters email address
  3. Receives reset link via email
  4. Clicks link, lands on reset page
  5. Enters new password
  6. Password updated, logged in

* **FR-15:** Reset link properties:
  - Valid for 1 hour
  - Single-use only
  - Invalidated after use

### 4.5 Protected Routes

* **FR-16:** Routes requiring authentication:
  - `/dashboard` - User story library
  - `/story/:id` - Story editor
  - `/settings` - Account settings
  - `/billing` - Payment management (future)

* **FR-17:** Unauthenticated access behavior:
  - Redirect to login page
  - Store intended destination
  - Redirect after successful login

* **FR-18:** Public routes (no auth required):
  - `/` - Landing page
  - `/login` - Login page
  - `/signup` - Registration page
  - `/about` - About page

### 4.6 User Profile

* **FR-19:** Profile information:
  - Email address (non-editable)
  - Display name (editable)
  - Preferences (editable)
  - Account creation date
  - Last login timestamp

* **FR-20:** Display name:
  - 2-50 characters
  - Letters, numbers, spaces allowed
  - Shown in UI instead of email

### 4.7 Account Settings

* **FR-21:** Accessible settings:
  - Change display name
  - Update password (if using password auth)
  - Toggle email notifications
  - Set preferred mode (Quick/Comprehensive)
  - Set AI coaching level
  - Delete account

* **FR-22:** Delete account:
  - Confirmation required (type email)
  - All stories deleted
  - User data removed per GDPR
  - Cannot be undone

### 4.8 Demo Mode

* **FR-23:** "Try Without Account" option:
  - Works without authentication
  - Uses localStorage only
  - Warning that work won't be saved
  - Prompt to create account before export
  - Limited to 1 story

---

## 5. Data Requirements

### 5.1 Stytch Configuration

**Project Credentials:**
```javascript
const STYTCH_CONFIG = {
  publicToken: 'public-token-test-313ecee7-507c-4e35-aba0-46e56e88efd9',
  projectId: 'project-test-30ad7d23-57cc-4bc3-81b7-e66ad7c6fb5c',
  environment: 'test', // or 'live' for production
};
```

**Magic Link Settings:**
```javascript
{
  loginMagicLinkUrl: `${window.location.origin}/authenticate`,
  loginExpirationMinutes: 60,
  signupMagicLinkUrl: `${window.location.origin}/authenticate`,
  signupExpirationMinutes: 60
}
```

### 5.2 Supabase User Schema

**Users Table:**
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stytch_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  preferences JSONB DEFAULT '{
    "autoSave": true,
    "darkMode": false,
    "preferredMode": null,
    "aiCoachingLevel": "moderate",
    "defaultExportFormat": "markdown",
    "emailNotifications": true
  }'::jsonb,
  analytics JSONB DEFAULT '{
    "totalStoriesCreated": 0,
    "quickModeCount": 0,
    "comprehensiveModeCount": 0,
    "favoriteStoryTypes": {},
    "averageCompletionTime": 0,
    "lastStoryType": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast Stytch user lookup
CREATE INDEX idx_users_stytch_id ON public.users(stytch_user_id);
CREATE INDEX idx_users_email ON public.users(email);
```

### 5.3 User Data Structure

**In React Context:**
```javascript
{
  user: {
    id: UUID,
    stytchUserId: string,
    email: string,
    displayName: string,
    preferences: {
      autoSave: boolean,
      darkMode: boolean,
      preferredMode: 'quick' | 'comprehensive' | null,
      aiCoachingLevel: 'minimal' | 'moderate' | 'extensive',
      defaultExportFormat: 'text' | 'markdown' | 'pdf',
      emailNotifications: boolean
    },
    analytics: {
      totalStoriesCreated: number,
      quickModeCount: number,
      comprehensiveModeCount: number,
      favoriteStoryTypes: object,
      averageCompletionTime: number,
      lastStoryType: string
    },
    createdAt: timestamp,
    lastLogin: timestamp
  },
  session: {
    token: string,
    expiresAt: timestamp,
    isAuthenticated: boolean
  }
}
```

### 5.4 API Endpoints

**Create/Sync User:**
```javascript
POST /api/auth/sync-user
Body: {
  stytchUserId: string,
  email: string,
  displayName?: string
}
Response: {
  user: UserObject
}
```

**Update Profile:**
```javascript
PATCH /api/users/:id
Body: {
  displayName?: string,
  preferences?: object
}
Response: {
  user: UserObject
}
```

**Delete Account:**
```javascript
DELETE /api/users/:id
Body: {
  confirmEmail: string
}
Response: {
  success: boolean
}
```

---

## 6. UI/UX Requirements

### 6.1 Login Screen

**Layout:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│         🎭 Storyteller Tactics                  │
│                                                  │
│         Welcome Back!                            │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Email address                            │  │
│  │  ───────────────────────────────────────  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [        Send Magic Link to Login       ]     │
│                                                  │
│  ───────────── or ─────────────                │
│                                                  │
│  [ Use password instead ]                       │
│                                                  │
│  Don't have an account? [Sign up]              │
│                                                  │
│  [ 👤 Try Demo Mode (No Account) ]             │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Password Login (Expanded):**
```
┌─────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────┐  │
│  │  Email address                            │  │
│  │  ───────────────────────────────────────  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Password                          [👁]   │  │
│  │  ───────────────────────────────────────  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ☐ Remember me for 30 days                     │
│                                                  │
│  [          Log In          ]                   │
│                                                  │
│  [Forgot password?]    [Use magic link instead] │
└─────────────────────────────────────────────────┘
```

### 6.2 Sign-Up Screen

**Layout:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│         Create Your Account                      │
│         Start telling great stories              │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Email address                            │  │
│  │  ───────────────────────────────────────  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Display name (optional)                  │  │
│  │  ───────────────────────────────────────  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [      Send Magic Link to Sign Up      ]      │
│                                                  │
│  ───────────── or ─────────────                │
│                                                  │
│  [ Create account with password ]               │
│                                                  │
│  Already have an account? [Log in]             │
│                                                  │
│  By signing up, you agree to our                │
│  [Terms of Service] and [Privacy Policy]        │
└─────────────────────────────────────────────────┘
```

### 6.3 Magic Link Sent Confirmation

**Screen:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│              📧                                  │
│                                                  │
│         Check Your Email!                        │
│                                                  │
│  We sent a magic link to:                       │
│  [user@example.com]                             │
│                                                  │
│  Click the link in your email to log in.        │
│  The link will expire in 60 minutes.            │
│                                                  │
│  Didn't receive it?                             │
│  • Check your spam folder                       │
│  • [Resend magic link]                          │
│                                                  │
│  [Change email address]                         │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 6.4 Authentication Callback

**Loading State:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│              ⏳                                  │
│                                                  │
│         Logging you in...                        │
│                                                  │
│  (animated spinner)                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Error State:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│              ⚠️                                 │
│                                                  │
│         Login Failed                             │
│                                                  │
│  This link has expired or is invalid.           │
│                                                  │
│  [Request a new magic link]                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 6.5 User Menu (After Login)

**Top-right dropdown:**
```
┌──────────────────────────┐
│ 👤 Sarah Johnson         │
│    sarah@example.com     │
├──────────────────────────┤
│ 📚 My Stories            │
│ ⚙️  Settings             │
│ 💳 Billing (Future)      │
│ 📖 Help & Docs           │
├──────────────────────────┤
│ 🚪 Log Out               │
└──────────────────────────┘
```

### 6.6 Account Settings Page

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Account Settings                                │
├─────────────────────────────────────────────────┤
│                                                  │
│  Profile                                         │
│  ┌──────────────────────────────────────────┐  │
│  │ Email: sarah@example.com (verified)      │  │
│  │                                            │  │
│  │ Display Name: [Sarah Johnson          ]  │  │
│  │                                            │  │
│  │ Member since: Nov 1, 2025                 │  │
│  │ Last login: 2 hours ago                   │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Preferences                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ ☑ Auto-save stories                       │  │
│  │ ☐ Dark mode                               │  │
│  │ Preferred mode: [Comprehensive ▼]         │  │
│  │ AI coaching: [Moderate ▼]                 │  │
│  │ Export format: [Markdown ▼]               │  │
│  │ ☑ Email notifications                     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Security                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ Password: ••••••••  [Change Password]    │  │
│  │                                            │  │
│  │ Active Sessions: 2 devices                │  │
│  │ [Manage Sessions]                         │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Danger Zone                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ [Delete Account]                          │  │
│  │ This cannot be undone.                    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [Save Changes]                                  │
└─────────────────────────────────────────────────┘
```

---

## 7. Acceptance Criteria

**Registration:**
- [ ] User can sign up with email + magic link in <60 seconds
- [ ] User can sign up with email + password
- [ ] Email validation works correctly
- [ ] Password requirements enforced
- [ ] User record created in Supabase
- [ ] Welcome email sent
- [ ] User automatically logged in after signup

**Login:**
- [ ] Magic link sent to correct email
- [ ] Magic link works within 60 minutes
- [ ] Magic link expires after use
- [ ] Password login works with correct credentials
- [ ] Failed login shows appropriate error
- [ ] Rate limiting prevents brute force
- [ ] "Remember Me" extends session to 30 days

**Session:**
- [ ] Session persists across page reloads
- [ ] Session works across multiple devices
- [ ] Session expires after 7 days (or 30 with Remember Me)
- [ ] Token refreshes before expiration
- [ ] Logout clears session completely

**Protected Routes:**
- [ ] Unauthenticated users redirected to login
- [ ] After login, user sent to intended page
- [ ] Dashboard accessible only when logged in
- [ ] Story editor requires authentication

**Profile & Settings:**
- [ ] Display name can be updated
- [ ] Password can be changed
- [ ] Preferences save correctly
- [ ] Account deletion works (with confirmation)
- [ ] Changes persist across sessions

**Demo Mode:**
- [ ] Works without creating account
- [ ] Warning shown about no persistence
- [ ] Limited to 1 story
- [ ] Prompted to sign up before export

**Security:**
- [ ] Passwords hashed (never stored plain text)
- [ ] JWT tokens use httpOnly cookies
- [ ] HTTPS enforced in production
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints

**UX:**
- [ ] Login screen loads in <1 second
- [ ] Clear error messages
- [ ] Magic link email arrives in <30 seconds
- [ ] Smooth redirect flow
- [ ] No auth friction for users

---

## 8. Dependencies

**External Services:**
- **Stytch:** Authentication provider
- **Supabase:** User database

**Required Libraries:**
- `@stytch/react` - Stytch React SDK
- `@supabase/supabase-js` - Supabase client
- `js-cookie` - Cookie management (optional)

**Depends On:**
- FReD-12: Database Integration (user table)

**Required By:**
- All features requiring user data
- Story saving and loading
- User dashboard

---

## 9. Priority

**P0 - Must-Have**

**Justification:**
- Cannot save stories without users
- Enables core value proposition
- Required for cross-device access
- Foundation for freemium model

**MVP Scope:**
- ✅ Magic link authentication
- ✅ Email/password authentication
- ✅ Session management
- ✅ Protected routes
- ✅ Basic profile settings
- ⏳ OAuth (defer to P1)

---

## 10. Status

**Current Status:** 🔄 In Progress

**Completed:**
- [x] Requirements definition
- [x] Stytch account setup
- [x] Supabase user schema
- [ ] Frontend implementation
- [ ] Stytch SDK integration
- [ ] User sync with Supabase
- [ ] Protected route implementation
- [ ] Settings page
- [ ] Testing
- [ ] Deployment

**Blockers:**
- None currently

**Next Steps:**
1. Integrate @stytch/react SDK
2. Build login/signup screens
3. Implement authentication callback
4. Create user context
5. Protect routes
6. Build settings page
7. Test all flows

**Estimated Completion:** Week 2, Day 3-4

---

## 11. Implementation Notes

### 11.1 Stytch Integration

**Initialize Stytch:**
```javascript
import { StytchProvider } from '@stytch/react';

function App() {
  return (
    <StytchProvider stytch={stytchClient}>
      <YourApp />
    </StytchProvider>
  );
}
```

**Magic Link Login:**
```javascript
import { useStytch } from '@stytch/react';

function LoginScreen() {
  const stytch = useStytch();
  const [email, setEmail] = useState('');
  
  const handleMagicLink = async () => {
    await stytch.magicLinks.email.loginOrCreate(email, {
      login_magic_link_url: `${window.location.origin}/authenticate`,
      signup_magic_link_url: `${window.location.origin}/authenticate`,
    });
  };
}
```

**Authenticate Callback:**
```javascript
import { useStytchSession } from '@stytch/react';

function AuthCallback() {
  const { session } = useStytchSession();
  
  useEffect(() => {
    if (session) {
      // User authenticated, sync with Supabase
      syncUserWithSupabase(session.user);
    }
  }, [session]);
}
```

### 11.2 User Sync with Supabase

```javascript
async function syncUserWithSupabase(stytchUser) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('stytch_user_id', stytchUser.user_id)
    .single();
  
  if (!existingUser) {
    // Create new user
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        stytch_user_id: stytchUser.user_id,
        email: stytchUser.emails[0].email,
        display_name: stytchUser.name || stytchUser.emails[0].email.split('@')[0]
      })
      .select()
      .single();
    
    return newUser;
  } else {
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', existingUser.id);
    
    return existingUser;
  }
}
```

### 11.3 Protected Route Component

```javascript
import { useStytchUser } from '@stytch/react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user } = useStytchUser();
  const location = useLocation();
  
  if (!user) {
    // Redirect to login, save intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 12. Testing Checklist

**Unit Tests:**
- [ ] Email validation function
- [ ] Password strength checker
- [ ] User sync logic

**Integration Tests:**
- [ ] Stytch magic link flow
- [ ] Stytch password login
- [ ] User creation in Supabase
- [ ] Session persistence
- [ ] Route protection

**E2E Tests:**
- [ ] Complete signup flow (magic link)
- [ ] Complete signup flow (password)
- [ ] Complete login flow (both methods)
- [ ] Password reset flow
- [ ] Settings update flow
- [ ] Account deletion flow
- [ ] Demo mode flow

**Security Tests:**
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Session hijacking prevention

**Manual Tests:**
- [ ] Test across browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile
- [ ] Test email delivery
- [ ] Test error states
- [ ] Test with slow network

---

## 13. Future Enhancements

**OAuth Integration:**
- Google Sign-In
- GitHub Sign-In
- LinkedIn Sign-In

**Advanced Security:**
- Two-factor authentication (2FA)
- Biometric authentication (mobile)
- Security keys (WebAuthn)
- Login notifications

**User Management:**
- Account recovery
- Email change flow
- Phone number backup
- Trusted devices

---

## Change Log

**v1.0 (Nov 22, 2025):**
- Initial FReD creation
- Full specifications defined
- Ready for implementation

---

**Document Owner:** Product Team  
**Last Updated:** November 22, 2025  
**Next Review:** Weekly during development