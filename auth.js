// Authentication logic
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('loggedIn') === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'finance.html';
    }

    // Registration form validation
    if (document.getElementById('registerForm')) {
        const registerForm = document.getElementById('registerForm');
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            let isValid = true;

            // Email validation
            if (!email) {
                document.getElementById('emailError').textContent = 'Email không được để trống';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('emailError').textContent = 'Email không đúng định dạng';
                isValid = false;
            } else {
                document.getElementById('emailError').textContent = '';
            }

            // Password validation
            if (!password) {
                document.getElementById('passwordError').textContent = 'Mật khẩu không được để trống';
                isValid = false;
            } else if (password.length < 6) {
                document.getElementById('passwordError').textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
                isValid = false;
            } else {
                document.getElementById('passwordError').textContent = '';
            }

            // Confirm password validation
            if (!confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'Xác nhận mật khẩu không được để trống';
                isValid = false;
            } else if (password !== confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'Mật khẩu xác nhận không khớp';
                isValid = false;
            } else {
                document.getElementById('confirmPasswordError').textContent = '';
            }

            if (isValid) {
                // Save user data to localStorage
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userPassword', password);
                
                // Redirect to login page
                window.location.href = 'login.html';
            }
        });
    }

    // Login form validation
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const storedEmail = localStorage.getItem('userEmail');
            const storedPassword = localStorage.getItem('userPassword');
            let isValid = true;

            // Email validation
            if (!email) {
                document.getElementById('loginEmailError').textContent = 'Email không được để trống';
                isValid = false;
            } else {
                document.getElementById('loginEmailError').textContent = '';
            }

            // Password validation
            if (!password) {
                document.getElementById('loginPasswordError').textContent = 'Mật khẩu không được để trống';
                isValid = false;
            } else {
                document.getElementById('loginPasswordError').textContent = '';
            }

            if (isValid) {
                // Check credentials
                if (email === storedEmail && password === storedPassword) {
                    localStorage.setItem('loggedIn', 'true');
                    window.location.href = 'finance.html';
                } else {
                    document.getElementById('loginPasswordError').textContent = 'Email hoặc mật khẩu không đúng';
                }
            }
        });
    }

    // Logout functionality
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                localStorage.removeItem('loggedIn');
                window.location.href = 'login.html';
            }
        });
    }
});