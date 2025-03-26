import request from '@/utils/request';

// 获取订单列表
export const getOrderList = async () => {
    try {
        const response = await request.get('/orders/main');
        return response.data;
    } catch (error) {
        throw new Error('获取订单数据失败');
    }
};

// 订单详情
export const getOrderDetail = async (id) => {
    try {
        const response = await request.get(`/orders/detail/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('获取订单详情失败');
    }
};

// 标记为已读
export const toggleOrderStatus = async (id) => {
    try {
      const response = await request.put(`/orders/ship/${id}`); // 调用后端 API
      return response.data; // 返回后端返回的数据
    } catch (error) {
      console.error('Failed to toggle order status:', error);
      throw error;
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
        return response.data;
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

//获取饼图数据
export const getPieData = async () => {
    try {
        const response = await request.get('/statistics/sales/category');
        return response;
    } catch (error) {
        throw new Error('获取饼图数据失败');
    }
}