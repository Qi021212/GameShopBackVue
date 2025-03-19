import request from '@/utils/request';

// 获取订单列表
export const getOrderList = async () => {
    try {
        const response = await request.get('/orders/main');
        return response;
    } catch (error) {
        throw new Error('获取订单数据失败');
    }
};
