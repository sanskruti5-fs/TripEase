import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
            // Optionally reload to update Navbar state
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', paddingTop: '100px' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', borderRadius: '16px' }}>
                <div className="text-center mb-4">
                    <LogIn size={40} color="var(--primary-color)" />
                    <h2 style={{ marginTop: '16px', fontWeight: 'bold' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-light)' }}>Enter your credentials to access your trips</p>
                </div>

                {error && <div className="alert alert-danger" style={{ borderRadius: '8px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '500' }}>Email address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control hover-scale"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label" style={{ fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control hover-scale"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary-custom w-100 mb-3" style={{ padding: '12px', fontSize: '16px' }}>
                        Log In
                    </button>
                    <div className="text-center">
                        <span style={{ color: 'var(--text-light)' }}>Don't have an account? </span>
                        <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
