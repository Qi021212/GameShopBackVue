//导入request.js
import request from '@/utils/request'
import axios from 'axios';  // 导入 axios

//获取用户列表
export const fetchUserList = (queryInfo) => {
  return axios.get('/api/users', { params: queryInfo });
};

// 添加新用户
export const addUser = (userData) => {
  return request.post('/users', userData)
}

// 获取单个用户信息
export const getUserById = (id) => {
  return request.get(`/users/${id}`)
}

// 修改用户信息（管理员操作）
export function updateUserById(id, data) {
  return request({
      url: `/users/${id}`,
      method: 'put',
      data
  })
}


// 删除用户
export const removeUserById = async (id) => {
  try {
    console.log(`Deleting user with ID: ${id}`);
    const response = await axios.delete(`/api/users/${id}`);
    console.log('Response:', response.data);
    return response; // 返回响应对象
  } catch (error) {
    throw error; // 抛出错误
  }
};

// // 获取角色列表
// export const getRolesList = () => {
//   return request.get('/roles')
// }

// // 分配角色
// export const setRole = (userId, rid) => {
//   return request.put(`/users/${userId}/role`, { rid })
// }




//重置密码
export const resetPasswordById = async (id) => {
  try {
      const response = await axios.patch('/api/user/updatePwd', {
          userId: id.toString(), // 后端期望字符串类型
          newPassword: '123456' // 假设初始密码为 '123456'
      });
      return response;
  } catch (error) {
      throw error; // 抛出错误，交给调用者处理
  }
};
//获取总数
export const getTotalUsers = () => {
  return request.get('/users/total')
      .then(response => response.data);
};