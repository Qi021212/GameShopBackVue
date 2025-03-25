<script setup>
import { ElContainer, ElAside, ElCard, ElRow, ElCol, ElIcon, ElStatistic, ElLink,ElMessage } from 'element-plus';
import { ref,onMounted} from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
// 路由实例
const router = useRouter();

// 图标引入
import { Plus, DataBoard, Setting } from '@element-plus/icons-vue';

// 模拟登录用户(未获取版)
const currentUser = ref('管理员'); // 可以根据实际登录用户动态设置


// 跳转函数
const navigateTo = (path) => {
    router.push(path);
};

// 模拟数据（未获取版）
const itemList = ref([
    { id: 1, name: '商品A', price: 100 },
    { id: 2, name: '商品B', price: 200 },
    { id: 3, name: '商品C', price: 300 },
]);

import {getSalesData,getOrderList} from '@/api/order.js';
//statistic-card
const ordersOfToday = ref(0);
const totalCustomers = ref(0);
const fetchData = async () => {
    try {
        const response = await getSalesData(); 
        // 更新数据
        ordersOfToday.value = response.ordersOfToday;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

//orderlist-card
const orderData = ref([]);
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



//在组件挂载时获取数据
onMounted(() => {
    fetchData();
    fetchOrderList();
});
</script>

<template>
    <el-container style="height: 100%;">
        <!-- 左侧区域 -->
        <el-aside width="calc(50% - 5px)" style="display: flex; flex-direction: column; margin-right: 10px;">
            <!-- 欢迎卡片 -->
            <el-card class="welcome-card">
                <h2>欢迎回来，管理员{{ currentUser }}！</h2>
            </el-card>

            <!-- 快捷操作卡片 -->
            <el-card class="shortcut-card">
                <el-row :gutter="20">
                    <el-col :span="8" class="shortcut-item" @click="navigateTo('/')">
                        <el-icon :size="30"><Plus /></el-icon>
                        <p>新增商品</p>
                    </el-col>
                    <el-col :span="8" class="shortcut-item" @click="navigateTo('/statistics')">
                        <el-icon :size="30"><DataBoard /></el-icon>
                        <p>查看数据</p>
                    </el-col>
                    <el-col :span="8" class="shortcut-item" @click="navigateTo('/')">
                        <el-icon :size="30"><Setting /></el-icon>
                        <p>管理员设置</p>
                    </el-col>
                </el-row>
            </el-card>

            <!-- 商品列表卡片 -->
            <el-card class="itemlist-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3>商品列表</h3>
                    <el-link @click="navigateTo('/product-detail')">查看详情 ></el-link>
                </div>
                <el-table :data="itemList" stripe>
                    <el-table-column prop="id" label="ID" width="100" />
                    <el-table-column prop="name" label="商品名称" />
                    <el-table-column prop="price" label="价格" />
                </el-table>
            </el-card>
        </el-aside>

        <!-- 右侧区域 -->
        <el-container style="flex-direction: column; width: calc(50% - 5px);">
            <!-- 统计卡片 -->
            <el-card class="statistics-card">
                <h3>统计信息</h3>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-card>
                            <el-statistic title="今日订单量（单)" :value="ordersOfToday" />
                        </el-card>
                    </el-col>
                    <el-col :span="12">
                        <el-card>
                            <el-statistic title="现有客户（人)" :value="totalCustomers" />
                        </el-card>
                    </el-col>
                </el-row>
            </el-card>

            <!-- 订单列表卡片 -->
            <el-card class="orderlist-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3>订单列表</h3>
                    <el-link @click="navigateTo('/orderList')">查看详情 ></el-link>
                </div>
                <el-table :data="orderData" stripe>
                    <el-table-column prop="id" label="订单ID" width="100" />
                    <el-table-column prop="name" label="客户姓名" />
                    <el-table-column prop="total" label="总价" />
                    <el-table-column prop="datetime" label="下单时间" width="200">
                        <template #default="{ row }">
                            {{ dayjs(row.datetime).format('YYYY-MM-DD HH:mm:ss') }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </el-container>
    </el-container>
</template>

<style scoped>
.welcome-card {
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    margin-bottom: 5px;
}

.shortcut-card {
    margin-bottom: 10px;
}

.shortcut-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.shortcut-item:hover {
    color: #409eff;
}

.itemlist-card {
    flex: 1;
}

.statistics-card {
    margin-bottom: 10px;
}

.orderlist-card {
    height: 540px; /* 固定高度 */
    display: flex;
    flex-direction: column;
}

.orderlist-card .el-table {
    height: 450px;
    flex: 1; /* 让表格占据剩余空间 */
    overflow-y: auto; /* 添加滚动条 */
}

h2{
    font-size: 24px;
}

h3 {
    margin-top: 0;
}

p {
    margin: 0;
    font-size: 22px;
}

.el-link {
    font-size: 14px;
}

</style>