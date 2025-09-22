import { createSlice } from "@reduxjs/toolkit";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const token = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user");
const initialState = {
  user: userFromStorage
    ? JSON.parse(userFromStorage)
    : token
    ? parseJwt(token)
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload)); // เปลี่ยนเป็น localStorage
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user"); // เปลี่ยนเป็น localStorage
      localStorage.removeItem("token"); // ถ้ามี token ให้ลบด้วย
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
