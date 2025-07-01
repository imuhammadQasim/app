import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  allUsers: [],
  allChats: [],
  selectedChat: null,
};

const usersSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setAllChat: (state, action) => {
      state.allChats  = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat  = action.payload;
    },
  },
});

export const { setUser, setAllUsers , setAllChat ,setSelectedChat} = usersSlice.actions;
export default usersSlice.reducer;
