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
  import axios from 'axios'; // 引入 axios
  
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
        legend: {// 图例组件
          orient: 'horizontal',
          bottom: '20',
          data: [], // 初始为空，数据从后端获取
        },
        series: [// 系列列表
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
  
      // 定义获取数据的函数
      const fetchChartData = async () => {
        try {
          // 发送请求到后端获取数据
          const response = await axios.get('');
          const data = response.data;
  
          // 更新图表的 legend 和 series 数据
          pieChartOption.value.legend.data = data.map(item => item.name);
          pieChartOption.value.series[0].data = data;
        } catch (error) {
          console.error('Failed to fetch chart data:', error);
        }
      };
  
      // 在组件挂载时调用 fetchChartData
      onMounted(() => {
        fetchChartData();
      });
  
      // 返回需要在模板中使用的数据和方法
      return {
        pieChartOption,
      };
    },
  };
  </script>