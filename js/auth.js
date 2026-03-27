/* 
    Avenir de Thiawlene - Authentication Logic
*/

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple login attempt using Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert('Erreur de connexion : ' + error.message);
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Check if user is already logged in (optional redirect)
    async function checkSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && window.location.pathname.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
    }
    
    checkSession();
});
