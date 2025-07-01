import toast from 'react-hot-toast';
import '../signup/signup.css';
import { useState, React } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../../apiCalls/auth.js';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoader, hideLoader } from '../../redux/loaderSlice';
const Login = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate();

 async function submitFunction(e) {
  e.preventDefault();

  try {
    dispatch(showLoader());
    const response = await loginUser(user);
    dispatch(hideLoader());
    if (response.success) {
      toast.success(response.message);
      localStorage.setItem('token', response.token);
      navigate('/');
      window.location.href = '/' 

      // setUser({ email: '', password: '' });
    } else {
      toast.error("Login failed: " + response.message);
    }
    console.log("User data submitted:", user);
  } catch (error) {
    dispatch(hideLoader());
    toast.error(error.message || "An error occurred during login.");
    console.error("Login error:", error);
  }
}

  return (
    <div className="signup-container">
      <form onSubmit={submitFunction} className="signup-form">
        <h2>Welcome Back</h2>
        <p className="subtext">Log in to your account to continue</p>

        <input
          type="email"
          placeholder="Email Address"
          required
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        <button type="submit">Log In</button>

        <p className="login-link">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
