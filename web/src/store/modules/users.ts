import { createSlice } from "@reduxjs/toolkit";

interface UserState {
    token: string;
    uuid: number;
    email: string;
    nickname: string;
}

const initialState: UserState = {
    token: localStorage.getItem('access_token') || '',
    uuid: 0,
    email: '',
    nickname: '',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserInfo: (state, { payload }) => {
            const { token, uuid, permission, is_admin, is_auditor } = payload;
            state.token = token;
            state.uuid = uuid;
            localStorage.setItem('access_token', token);
            localStorage.setItem('user_info', JSON.stringify(payload));
        },
        clearUserInfo: (state) => {
            Object.assign(state, initialState);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
        }
    }
})

export const {setUserInfo, clearUserInfo} = userSlice.actions

export default userSlice.reducer