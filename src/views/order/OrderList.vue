<script setup>
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { getOrderList, toggleOrderStatus, getOrderDetail } from '@/api/order.js';
import dayjs from 'dayjs'; // 引入dayjs,用于格式化时间

// 订单数据
const orderData = ref([]);

// 状态映射表
const statusMap = {
  1: '未支付',
  2: '已支付',
};

// 获取订单数据
const fetchOrderList = async () => {
  try {
    const response = await getOrderList(); // 调用 getOrderList
    if (response && Array.isArray(response)) { // 检查是否为数组
      orderData.value = response;
    } else {
      ElMessage.warning('未获取到订单数据');
    }
  } catch (error) {
    ElMessage.error('获取订单数据失败');
  }
};

// 分页相关状态
const currentPage = ref(1); // 当前页
const pageSize = ref(12); // 每页显示的数据条数

// 搜索相关状态
const searchQuery = ref(''); // 搜索关键字

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索后重置到第一页
};

// 过滤后的订单数据
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return orderData.value; // 如果没有搜索关键字，返回全部数据
  }
  const query = searchQuery.value.toLowerCase();
  return orderData.value.filter(order =>
    order.id.toString().includes(query) || // 搜索订单编号
    order.name.toLowerCase().includes(query) // 搜索用户姓名
  );
});

// 计算当前页显示的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 处理页码改变事件
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
};

// 处理标记为已读
const markAsRead = async (id) => {
  try {
    // 调用 API 更新订单状态
    const response = await toggleOrderStatus(id);

    // 检查返回的状态
    if (response.status === '1') { 
      // 更新前端状态
      const order = orderData.value.find(item => item.id === id);
      if (order) {
        order.state = '已读'; // 更新订单状态为已读
        ElMessage.success('已标记为为已读');
      }
    } else {
      ElMessage.warning('更新订单状态失败');
    }
  } catch (error) {
    console.error('切换订单状态失败:', error);
    ElMessage.error(error.message || '更新订单状态失败');
  }
};

// 弹窗相关状态
const dialogVisible = ref(false); // 控制弹窗显示
const currentOrder = ref(null); // 当前选中的订单

// 处理详情按钮点击
const showDetails = async (id) => {
  try {
    const response = await getOrderDetail(id); // 调用获取订单详情的 API
    currentOrder.value = response;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取订单详情失败');
  }
};

onMounted(fetchOrderList); // 组件挂载时调用
</script>

<template>
  <el-card class="orderList-page">
    <!-- 卡片头部：标题和搜索栏 -->
    <template #header>
      <div class="card-header">
        <h2>订单列表</h2>
        <div class="search-bar">
          <el-input v-model="searchQuery" placeholder="请输入订单编号/用户姓名" clearable @clear="handleSearch" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </template>
    <!-- 订单列表 -->
    <el-table :data="paginatedData" stripe class="orderList-table" :cell-style="{ textAlign: 'center' }" border>
      <el-table-column prop="id" label="编号" width="150" header-align="center" />
      <el-table-column prop="name" label="用户姓名" width="150" header-align="center" />
      <el-table-column prop="datetime" label="下单时间" width="200" header-align="center">
        <template #default="{ row }">
          {{ dayjs(row.datetime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="total" label="订单总价" width="150" show-overflow-tooltip header-align="center" />
      <el-table-column prop="status" label="订单状态" width="150" header-align="center">
        <template #default="{ row }">
          {{ statusMap[row.status] || row.status }} <!-- 使用状态映射表 -->
        </template>
      </el-table-column>
      <el-table-column label="操作" header-align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showDetails(row.id)">详情</el-button>
          <el-button v-if="row.state === '0'" type="warning" size="small" @click="markAsRead(row.id)">
            未读
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination class="pagination" :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      background layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
  </el-card>

  <!-- 详情弹窗 -->
  <el-dialog v-model="dialogVisible" title="订单详情" width="30%" center>
    <div v-if="currentOrder">
      <p><strong>订单编号：</strong>{{ currentOrder.order.id }}</p>
      <p><strong>下单物品：</strong></p>
      <ul>
        <li v-for="(item, index) in currentOrder.items" :key="index">
          {{ item.name }}---￥{{ item.price }}
        </li>
      </ul>
      <p><strong>订单总价：</strong>{{ currentOrder.order.total }}</p>
      <p><strong>用户姓名：</strong>{{ currentOrder.order.name }}</p>
      <p><strong>电话：</strong>{{ currentOrder.order.phone }}</p>
      <p><strong>邮箱：</strong>{{ currentOrder.order.email }}</p>
      <p><strong>订单状态：</strong>{{ statusMap[currentOrder.order.status] || currentOrder.order.status }}</p>
      <p><strong>下单时间：</strong>{{ dayjs(currentOrder.order.datetime).format('YYYY-MM-DD HH:mm:ss') }}</p>
    </div>
  </el-dialog>
</template>

<style scoped>
.orderList-page {
  background-color: #fff;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card__header) {
  border-bottom: none !important;
  /* 去掉下划线 */
  padding-bottom: 0;
  /* 去掉多余的 padding */
}

h2 {
  margin: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 搜索栏和按钮之间的间距 */
}

.orderList-table {
  width: auto;
  margin: 20px;
  text-align: center;
}

.pagination {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

ul {
  padding-left: 20px;
  margin: 10px 0;
}

li {
  list-style-type: disc;
  margin-bottom: 5px;
}
</style>