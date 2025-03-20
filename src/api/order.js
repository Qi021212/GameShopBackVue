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

// 订单详情
export const getOrderDetail = async (id) => {
    try {
        const response = await request.get(`/orders/detail/${id}`);
        return response;
    } catch (error) {
        throw new Error('获取订单详情失败');
    }
};

// 切换订单状态
export const toggleOrderStatus = async (id) => {
    try {
        const response = await request.post(`/orders/${id}/toggle-status`);
        return response.data; // 返回后端响应的数据
    } catch (error) {
        // 如果后端返回了错误信息，抛出错误
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('切换订单状态失败，请稍后重试');
        }
    }
};

// 搜索订单
// export const searchOrder = async (keyword) => {
//     try {
//         const response = await request.get(`/orders/search}`,{params: {keyword}});
//         return response;
//     } catch (error) {
//         throw new Error('搜索订单失败');
//     }
// };

// 获取销售数据
export const getSalesData = async () => {
    try {
        const response = await request.get('/statistics');
        return response;
    } catch (error) {
        throw new Error('获取销售数据失败');
    }
}

// 获取走势图数据
export const getTrendData = async () => {
    try {
        const response = await request.get('/statistics/sales/last-seven-days');
        return response;
    } catch (error) {
        throw new Error('获取走势图数据失败');
    }
}