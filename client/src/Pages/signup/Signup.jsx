import React, { useState } from 'react';
import './signup.css';
import { Link , useNavigate} from 'react-router-dom';
import signupUser from '../../apiCalls/auth.js'; 
import toast from 'react-hot-toast';
import ProtectedRoutes from '../../components/ProtectedRoutes.jsx';
import { useDispatch } from 'react-redux';
import { showLoader, hideLoader } from '../../redux/loaderSlice.js';

const Signup = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  async function submitFunction(e) {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    };

    console.log("User data to be sent:", userData);

    try {
      dispatch(showLoader())
      const response = await signupUser(userData);
      dispatch(hideLoader())
      if (response.success) {
        toast.success("Account created successfully! Please log in.");
        navigate('/'); 
        setUser({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
        // window.location.href = '/home'; 
      } else {
        toast.error("Error creating account: " + response.message);
      }

    } catch (error) {
      dispatch(hideLoader())
      console.error("Error during signup:", error);
      toast.error("An error occurred while creating your account. Please try again.");
    }
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={submitFunction}>
        <h2>Sign Up! Create Your Account</h2>
        <p className="subtext">Start chatting with friends today!</p>

        <div className='custom-input-container'>
          <input
            type="text"
            className='custom-input'
            placeholder="First Name"
            required
            value={user.firstname}
            onChange={(e) => setUser({ ...user, firstname: e.target.value })}
          />
          <input
            type="text"
            className='custom-input'
            placeholder="Last Name"
            required
            value={user.lastname}
            onChange={(e) => setUser({ ...user, lastname: e.target.value })}
          />
        </div>

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

        <input
          type="password"
          placeholder="Confirm Password"
          required
          value={user.confirmPassword}
          onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
        />

        <button type="submit">Sign Up</button>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
