<script setup>
import { ElMessage } from 'element-plus';
import { ref, computed,onMounted} from 'vue';
import {getOrderList} from '@/api/order.js';

// 订单数据
const orderData = ref([
    {
        // id: '',//订单编号
        // user_id: '',//用户编号
        // order_items: [
        //     { name: '', price: '' },
        // ],//下单物品
        // total: '',//订单总价
        // name: '',//用户姓名
        // phone: '',//用户电话
        // email: '',//用户邮箱
        // paytype: '',//支付方式
        // status: '',//订单状态
        // datetime: '',//下单时间
        // state: '未读',//查看状态
    }
]);

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
onMounted(fetchOrderList); // 组件挂载时调用

// 分页相关状态
const currentPage = ref(1); // 当前页
const pageSize = ref(12); // 每页显示的数据条数

// 计算当前页显示的数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return orderData.value.slice(start, end);
});

// 处理页码改变事件
const handlePageChange = (newPage) => {
    currentPage.value = newPage;
};


// 处理标记为已读
const markAsRead = async (id) => {
const order = orderData.value.find(item => item.id === id);
        if (order) {
            order.state = "1"; // 更新订单状态
            ElMessage.success(`订单状态已更新`);
        }
};

// 弹窗相关状态
const dialogVisible = ref(false); // 控制弹窗显示
const currentOrder = ref(null); // 当前选中的订单

// 处理详情按钮点击
const showDetails = async (id) => {
    const item = orderData.value.find(item => item.id === id);
    if (item) {
        currentOrder.value = item; // 设置当前选中的订单
        dialogVisible.value = true; // 显示弹窗
    }
    //这里应该添加发送id到后端的逻辑，获取订单详情

};
// 搜索相关状态
const searchQuery = ref(''); // 搜索关键字

// 处理搜索
const handleSearch = () => {


};

</script>

<template>
    <el-card class="orderList-page">
        <!-- 卡片头部：标题和搜索栏 -->
        <template #header>
            <div class="card-header">
                <h2>订单列表</h2>
                <div class="search-bar">
                    <el-input v-model="searchQuery" placeholder="请输入订单编号/用户ID" clearable @clear="handleSearch" />
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                </div>
            </div>
        </template>
        <!-- 订单列表 -->
        <el-table :data="paginatedData" stripe class="orderList-table" :cell-style="{ textAlign: 'center' }" border>
            <el-table-column prop="id" label="编号" width="150" header-align="center" />
            <el-table-column prop="user_id:" label="用户ID" width="150" header-align="center" />
            <el-table-column prop="total" label="订单总价" width="150" show-overflow-tooltip header-align="center" />
            <el-table-column prop="status" label="订单状态" width="150" header-align="center" />
            <el-table-column prop="datetime" label="下单时间" width="200" header-align="center" />
            <el-table-column label="操作" header-align="center">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="showDetails(row.id)">详情</el-button>
                    <el-button v-if="row.state === '0'" type="warning" size="small"
                        @click="markAsRead(row.id)">
                        未读
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-pagination class="pagination" :current-page="currentPage" :page-size="pageSize" :total="orderData.length"
            background layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="订单详情" width="30%" center>
        <div v-if="currentOrder">
            <p><strong>订单编号：</strong>{{ currentOrder.id }}</p>
            <p><strong>用户ID：</strong>{{ currentOrder.user_id }}</p>
            <p><strong>下单物品：</strong></p>
            <ul>
                <li v-for="(item, index) in currentOrder.order_items" :key="index">
                    {{ item.name }}-￥{{ item.price }}
                </li>
            </ul>
            <p><strong>订单总价：</strong>{{ currentOrder.total }}</p>
            <p><strong>用户姓名</strong>{{ currentOrder.name }}</p>
            <p><strong>电话：</strong>{{ currentOrder.phone }}</p>
            <p><strong>邮箱：</strong>{{ currentOrder.email }}</p>
            <p><strong>订单状态：</strong>{{ currentOrder.status }}</p>
            <p><strong>下单时间：</strong>{{ currentOrder.datetime }}</p>
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
    border-bottom: none !important; /* 去掉下划线 */
    padding-bottom: 0; /* 去掉多余的 padding */
}

h2 {
    margin: 0;
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 10px; /* 搜索栏和按钮之间的间距 */
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