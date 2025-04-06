<template>
  <div>
    <v-chart :option="pieChartOption" style="height: 300px;" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // 引入组合式 API
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { getPieData } from '@/api/order.js'; // 引入后端 API 函数

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

export default {
  components: {
    VChart,
  },
  setup() {
    // 使用 ref 创建响应式数据
    const pieChartOption = ref({
      title: {
        text: '各类游戏销量分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: '20',
        data: [], // 初始为空，数据从后端获取
      },
      series: [
        {
          name: '销量分布',
          type: 'pie',
          radius: '40%',
          center: ['50%', '50%'],
          data: [], // 初始为空，数据从后端获取
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });

    // 字段映射表
    const gameNameMap = {
      'action': '动作',
      'adventure': '冒险',
      'casual': '休闲',
      'role': '角色扮演',
      'simulation': '模拟',
      'sports': '体育及竞速',
    };

    // 定义获取数据的函数
    const fetchChartData = async () => {
      try {
        // 调用后端 API 获取数据
        const response = await getPieData();

        const data = response.data; 
        console.log(data);

        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        // 处理数据格式
        const formattedData = data.map(item => ({
          name:gameNameMap[item.category] || item.category, // 游戏类别（映射为中文）
          value: item.totalQuantity, // 销量
        }));

        // 更新图表的 legend 和 series 数据
        pieChartOption.value.legend.data = formattedData.map(item => item.name);
        pieChartOption.value.series[0].data = formattedData;
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
      pieChartOption,
    };
  },
};
</script>