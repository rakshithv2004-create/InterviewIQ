/* ============================================
   InterviewIQ — Authentication Module
   Full Appwrite integration with user profiles
   ============================================ */

const Auth = (() => {
    const { account, databases } = window.appwrite;
    const { databaseId, collections } = AppwriteConfig;

    // Check if user is logged in
    async function getCurrentUser() {
        try {
            return await account.get();
        } catch (e) {
            return null;
        }
    }

    // Register — creates account + user profile document
    async function register(email, password, name, course) {
        try {
            const newAccount = await account.create(Appwrite.ID.unique(), email, password, name);

            // Auto-login after register
            await account.createEmailPasswordSession(email, password);

            // Create user profile in database
            try {
                await databases.createDocument(
                    databaseId,
                    collections.users,
                    newAccount.$id, // use same ID as account
                    {
                        name: name,
                        email: email,
                        course: course || '',
                        createdAt: new Date().toISOString()
                    },
                    [
                        Appwrite.Permission.read(Appwrite.Role.user(newAccount.$id)),
                        Appwrite.Permission.update(Appwrite.Role.user(newAccount.$id)),
                        Appwrite.Permission.delete(Appwrite.Role.user(newAccount.$id))
                    ]
                );
            } catch (profileErr) {
                console.warn('Profile creation warning:', profileErr.message);
            }

            return { success: true, user: newAccount };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // Login
    async function login(email, password) {
        try {
            await account.createEmailPasswordSession(email, password);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // Logout
    async function logout() {
        try {
            await account.deleteSession('current');
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // Get user's past sessions from Appwrite
    async function getUserSessions() {
        try {
            const user = await getCurrentUser();
            if (!user) return [];

            const response = await databases.listDocuments(
                databaseId,
                collections.sessions,
                [
                    Appwrite.Query.equal('userId', user.$id),
                    Appwrite.Query.orderDesc('$createdAt'),
                    Appwrite.Query.limit(20)
                ]
            );
            return response.documents;
        } catch (e) {
            console.warn('Could not fetch sessions:', e.message);
            return [];
        }
    }

    // Update navbar based on auth state
    async function updateNavbar() {
        const user = await getCurrentUser();
        const authLinks = document.getElementById('auth-links');
        if (!authLinks) return;

        if (user) {
            authLinks.innerHTML = `
        <li><a href="courses.html" class="navbar__link">Practice</a></li>
        <li><span class="navbar__link" style="color: var(--color-accent);">Hi, ${user.name.split(' ')[0]}</span></li>
        <li><button onclick="Auth.logout().then(() => window.location.href='index.html')" class="navbar__cta" style="background: var(--color-danger);">Logout</button></li>
      `;
        } else {
            authLinks.innerHTML = `
        <li><a href="login.html" class="navbar__link">Login</a></li>
        <li><a href="register.html" class="navbar__cta">Get Started</a></li>
      `;
        }
    }

    return { getCurrentUser, register, login, logout, getUserSessions, updateNavbar };
})();

window.Auth = Auth;
