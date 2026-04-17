import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Signup = () => {
    const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Signup failed');

            // Auto-redirect to login after successful signup
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', paddingTop: '100px' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', borderRadius: '16px' }}>
                <div className="text-center mb-4">
                    <UserPlus size={40} color="var(--primary-color)" />
                    <h2 style={{ marginTop: '16px', fontWeight: 'bold' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-light)' }}>Join TripEase to plan your perfect trip</p>
                </div>

                {error && <div className="alert alert-danger" style={{ borderRadius: '8px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control hover-scale"
                            value={credentials.name}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                    </div>
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
                        Sign Up
                    </button>
                    <div className="text-center">
                        <span style={{ color: 'var(--text-light)' }}>Already have an account? </span>
                        <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
