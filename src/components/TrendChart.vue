<template>
    <div>
      <v-chart :option="chartOption" style="height: 300px;" />
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'; // 引入组合式 API
  import { use } from 
  'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { BarChart, LineChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from 'echarts/components';
  import VChart from 'vue-echarts';
  import axios from 'axios'; // 引入 axios
  
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
          text: '近七日产品销量与销售额走势图',
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: ['销量', '销售额'],
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
            name: '销量',
            axisLabel: {
              formatter: '{value} 件',
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
            name: '销量',
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
          // 发送请求到后端获取数据
          const response = await axios.get('');
          const data = response.data;
  
          // 更新图表的数据
          chartOption.value.xAxis.data = data.dates; // 假设后端返回的日期数据在 data.dates 中
          chartOption.value.series[0].data = data.salesVolume; // 销量数据
          chartOption.value.series[1].data = data.salesAmount; // 销售额数据
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