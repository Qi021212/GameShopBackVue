<script setup>
import { ElContainer, ElCard, ElHeader, ElRow, ElCol, ElStatistic } from 'element-plus';
import PieChart from '@/components/PieChart.vue';
import TrendChart from '@/components/TrendChart.vue';

// 定义响应式数据
const ordersOfToday = ref(0);
const salesOfToday = ref(0);
const ordersOfWeek = ref(0);
const salesOfWeek = ref(0);
const topGame = ref('');

// 获取数据的函数
// const fetchData = async () => {
//     try {
//         const response = await axios.get(''); // 替换为你的后端API地址
//         const data = response.data;

//         // 更新数据
//         todayOrders.value = data.ordersOfToday;
//         todaySales.value = data.salesOfToday;
//         sevenDaysOrders.value = data.ordersOfWeek;
//         sevenDaysSales.value = data.salesOfWeek;
//         hottestGame.value = data.topGame;
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// };

// 在组件挂载时获取数据
onMounted(() => {
    fetchData();
});
</script>

<template>
    <el-container>
        <!-- 数据概览 -->
        <el-header height="40%">
            <el-card class="overview-card">
                <h3>销售数据</h3>
                <el-row :gutter="20" justify="space-between">
                    <el-col :span="4">
                        <el-card class="statistic-item" style="background-color: #F8E4E8;">
                            <el-statistic title="今日订单量（单)" :value="ordersOfToday" />
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card class="statistic-item" style="background-color: #FCF3E4;">
                            <el-statistic title="今日销售额（元)" :value="salesOfToday" prefix="¥" />
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card class="statistic-item" style="background-color: #E4F8F7;">
                            <el-statistic title="七日订单量（单)" :value="ordersOfWeek" />
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card class="statistic-item" style="background-color: #E4ECF8;">
                            <el-statistic title="七日销售额（元)" :value="salesOfWeek" prefix="¥"/>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card class="statistic-item" style="background-color: #F0E9FC;">
                            <el-statistic title="最热游戏" :value="topGame" />
                        </el-card>
                    </el-col>
                </el-row>
            </el-card>
        </el-header>
        <el-row :gutter="20">
            <!-- 年度产品销量走势图 -->
            <el-col :span="13">
                <el-card class="chart-card">
                    <h3>近七日销量/销售额走势图</h3>
                    <!-- <TrendChart /> -->
                </el-card>
            </el-col>
            <!-- 各省份销量分布图 -->
            <el-col :span="11">
                <el-card class="chart-card">
                    <h3>各类游戏销量分布图</h3>
                    <!-- <PieChart /> -->
                </el-card>
            </el-col>
        </el-row>
    </el-container>
</template>

<style scoped>
.el-header {
    padding: 0;
}

h3 {
    margin: 0;
    font-size: 20px;
    margin-bottom: 20px;
    /* 增加标题与卡片之间的间距 */
}

.overview-card {
    height: 100%;
    padding-right: 20px;
}

.statistic-item {
    text-align: center;
    padding: 0px;
    border-radius: 10px;
    height: 180px;
    /* 固定高度 */
    width: 190px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.chart-card {
    height: 100%;
    margin-top: 20px;
}
</style>