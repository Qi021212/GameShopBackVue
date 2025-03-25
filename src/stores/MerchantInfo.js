// src/stores/merchantInfo.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { userInfoService } from '@/api/merchant';

export const useMerchantInfoStore = defineStore('merchantInfo', () => {
    const info = ref({});

    const setInfo = (value) => {
        info.value = value;
    };

    const removeInfo = () => {
        info.value = {};
    };

    const fetchMerchantInfo = async (id) => {
        try {
            const result = await userInfoService(id);
            if (result.success && result.data) {
                info.value = result.data;
            } else {
                throw new Error(result.message || '获取商家信息失败');
            }
        } catch (error) {
            throw error;
        }
    };

    return {
        info,
        setInfo,
        removeInfo,
        fetchMerchantInfo
    };
}, {
    persist: true
});