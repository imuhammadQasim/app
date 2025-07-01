import { axiosInstance, url } from "./index.js";

export const signupUser = async (userData) => {
  try {
    const response = await axiosInstance.post(url+'/api/auth/signup', userData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
    };
  }
};

export const loginUser = async (user) => {
  try {
    const response = await axiosInstance.post(url+'/api/auth/login', user);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Login failed",
    };
  }
};

export default signupUser;
