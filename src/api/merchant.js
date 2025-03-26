// src/api/merchant.js
import request from '@/utils/request';
import axios from 'axios';
import { useTokenStore } from '@/stores/token';

export const loginService = (loginData) => {
    const urlSearchParams = new URLSearchParams();
    for (let key in loginData) {
        if (loginData[key] !== undefined && loginData[key] !== null) {
            urlSearchParams.append(key, loginData[key]);
        }
    }

    return request.post('/api/user/login', urlSearchParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => response.data);
};

export const BusinessRegisterService = (registerData) => {
    const urlSearchParams = new URLSearchParams();
    for (let key in registerData) {
        if (registerData[key] !== undefined && registerData[key] !== null) {
            urlSearchParams.append(key, registerData[key]); // 修正：使用 registerData[key]
        }
    }

    return request.post('/api/user/register', urlSearchParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => response.data);
};

export const userInfoService = (id) => {
    return request.get(`/api/user/getUserInfo?id=${id}`)
        .then(response => response.data);
};

export const updateUserInfoService = (userInfoData) => {
    const tokenStore = useTokenStore();
    return request.post('/api/users/updateInfo', userInfoData, { // 使用 request 替代 axios
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenStore.token}`
        }
    }).then(response => response.data);
};



export const MerchantResetPasswordService = (data)=>{
    return request.post('/api/user/updatePwd', data)
}
