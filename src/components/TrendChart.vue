<template>
  <div>
    <v-chart :option="chartOption" style="height: 300px;" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // 引入组合式 API
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { getTrendData } from '@/api/order.js'; // 引入后端 API 函数

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

export default {
  components: {
    VChart,
  },
  setup() {
    // 使用 ref 创建响应式数据
    const chartOption = ref({
      title: {
        text: '近七日产品订单量与销售额走势图',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['订单量', '销售额'],
        bottom: '10',
        orient: 'horizontal',
      },
      xAxis: {
        type: 'category',
        data: [], // 初始为空，数据从后端获取
      },
      yAxis: [
        {
          type: 'value',
          name: '订单量',
          axisLabel: {
            formatter: '{value} 单',
          },
        },
        {
          type: 'value',
          name: '销售额',
          axisLabel: {
            formatter: '{value} 元',
          },
        },
      ],
      series: [
        {
          name: '订单量',
          type: 'bar',
          data: [], // 初始为空，数据从后端获取
          yAxisIndex: 0,
        },
        {
          name: '销售额',
          type: 'line',
          data: [], // 初始为空，数据从后端获取
          yAxisIndex: 1,
        },
      ],
    });

    // 定义获取数据的函数
    const fetchChartData = async () => {
    try {
      const response = await getTrendData();

        // 直接使用 response
      const data = response.data;

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      const dates = data.map(item => item.date);
      const orderCounts = data.map(item => item.orderCount);
      const salesAmounts = data.map(item => item.salesAmount);

      chartOption.value.xAxis.data = dates;
      chartOption.value.series[0].data = orderCounts;
      chartOption.value.series[1].data = salesAmounts;
  } catch (error) {
    console.error('Failed to fetch chart data:', error);
  }
};

    // 在组件挂载时调用 fetchChartData
    onMounted(() => {
      fetchChartData();
    });

    // 返回需要在模板中使用的数据
    return {
      chartOption,
    };
  },
};
</script>