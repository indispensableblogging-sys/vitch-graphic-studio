import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://unidgmiuyfzttutwyev.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wrJ4jMABrxax1ThqVjG6mw_GV7KSDLK";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            "x-client-info": "vgs-client-portal"
        }
    }
});

const path = window.location.pathname.toLowerCase();
const isAuthPage = path.endsWith("/auth.html") || path.endsWith("/login.html") || path.endsWith("/signup.html");
const isAdminPage = path.endsWith("/admin.html");
const isDashboardPage = path.endsWith("/dashboard.html");

function getAuthMessageElement() {
    return document.getElementById("auth-message");
}

function showAuthMessage(text, good = false) {
    const message = getAuthMessageElement();
    if (!message) return;
    message.textContent = text;
    message.style.color = good ? "#7CFC00" : "#ffcc66";
}

function explainAuthError(error) {
    const raw = error?.message || String(error || "Unknown error");
    const lower = raw.toLowerCase();

    if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed")) {
        return "Unable to reach VGS server. Please check your internet connection, then refresh and try again. If your internet is working, the Supabase connection needs to be checked.";
    }

    return raw;
}

async function testSupabaseConnection() {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            method: "GET",
            headers: {
                apikey: SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
            },
            cache: "no-store"
        });

        if (!response.ok) {
            return { ok: false, detail: `Supabase returned HTTP ${response.status}.` };
        }

        return { ok: true };
    } catch (error) {
        return { ok: false, detail: explainAuthError(error) };
    }
}

async function currentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
}

async function getProfile(userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", userId)
        .single();
    if (error) return null;
    return data;
}

async function protectPages() {
    if (isAuthPage) return;

    if (!isDashboardPage && !isAdminPage) {
        addAccountButton();
        return;
    }

    const user = await currentUser();
    if (!user) {
        window.location.href = `auth.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
    }

    if (isAdminPage) {
        const profile = await getProfile(user.id);
        if (!profile || profile.role !== "admin") {
            alert("This account does not have administrator access yet.");
            await supabase.auth.signOut();
            window.location.href = "auth.html";
            return;
        }
    }

    const profile = await getProfile(user.id);
    const welcome = document.querySelector("[data-auth-name]");
    if (welcome) welcome.textContent = profile?.full_name || user.email || "Client";

    addLogoutButton();
}

function addAccountButton() {
    if (document.getElementById("vgs-account-link")) return;
    const header = document.querySelector(".header .container");
    if (!header) return;

    const link = document.createElement("a");
    link.id = "vgs-account-link";
    link.href = "auth.html";
    link.className = "btn";
    link.textContent = "👤 Client Login";
    link.style.marginTop = "0";
    header.appendChild(link);
}

function addLogoutButton() {
    const existing = document.querySelector("[data-vgs-logout]");
    if (existing) {
        existing.addEventListener("click", async (event) => {
            event.preventDefault();
            await supabase.auth.signOut();
            window.location.href = "auth.html";
        });
        return;
    }

    const header = document.querySelector(".header .container");
    if (!header) return;
    const button = document.createElement("button");
    button.dataset.vgsLogout = "true";
    button.className = "btn";
    button.textContent = "Logout";
    button.style.marginTop = "0";
    button.addEventListener("click", async () => {
        await supabase.auth.signOut();
        window.location.href = "auth.html";
    });
    header.appendChild(button);
}

async function initAuthPage() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const redirect = new URLSearchParams(window.location.search).get("redirect") || "dashboard.html";

    if (!loginForm && !signupForm) return;

    if (loginForm || signupForm) {
        showAuthMessage("Checking secure connection...");
        const connection = await testSupabaseConnection();
        if (!connection.ok) {
            showAuthMessage(`Connection check failed: ${connection.detail}`);
        } else {
            showAuthMessage("Secure connection ready.", true);
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;
            showAuthMessage("Signing you in...");

            try {
                const connection = await testSupabaseConnection();
                if (!connection.ok) {
                    showAuthMessage(`Connection problem: ${connection.detail}`);
                    return;
                }

                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    showAuthMessage(explainAuthError(error));
                    return;
                }

                const user = await currentUser();
                const profile = user ? await getProfile(user.id) : null;
                showAuthMessage("Login successful. Opening your dashboard...", true);
                window.location.href = profile?.role === "admin" ? "admin.html" : redirect;
            } catch (error) {
                showAuthMessage(explainAuthError(error));
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const fullName = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            showAuthMessage("Creating your account...");

            try {
                const connection = await testSupabaseConnection();
                if (!connection.ok) {
                    showAuthMessage(`Connection problem: ${connection.detail}`);
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });

                if (error) {
                    showAuthMessage(explainAuthError(error));
                    return;
                }

                if (data.session) {
                    showAuthMessage("Account created. Opening your dashboard...", true);
                    window.location.href = "dashboard.html";
                } else {
                    showAuthMessage("Account created. Check your email to confirm your account, then sign in.", true);
                }
            } catch (error) {
                showAuthMessage(explainAuthError(error));
            }
        });
    }
}

window.vgsSupabase = supabase;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initAuthPage();
        protectPages();
    });
} else {
    initAuthPage();
    protectPages();
}
