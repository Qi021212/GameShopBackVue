<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { getProductDetail } from '@/api/product.js';
import { ElMessage } from 'element-plus';
import ModifyProduct from "@/views/products/ModifyProduct.vue";


const route = useRoute();
const router = useRouter();

const product = ref([]);

//商品图片展示功能
// activeImageIndex 表示当前大图展示的图片下标（0~4，对应 picture1~picture5）
const activeImageIndex = ref(0);
let carouselTimer = null;

// 计算实际存在的图片 key 数组（最多五张）
const actualPictureKeys = computed(() => {
  if (!product.value) return [];
  const keys = [];
  for (let i = 1; i <= 5; i++) {
    const key = `picture${i}`;
    if (product.value[key] && product.value[key].trim() !== "") {
      keys.push(key);
    }
  }
  return keys;
});

// 开始轮播：每隔 3 秒自动切换，基于实际图片数量轮播
const startCarousel = () => {
  stopCarousel();
  carouselTimer = setInterval(() => {
    const count = actualPictureKeys.value.length;
    if (count > 0) {
      activeImageIndex.value = (activeImageIndex.value + 1) % count;
    }
  }, 3000);
};
// 停止轮播
const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
};
// 鼠标悬停时：暂停轮播并显示对应图片
const handleMouseOver = (index) => {
  stopCarousel();
  activeImageIndex.value = index;
};
// 鼠标离开后恢复轮播
const handleMouseLeave = () => {
  startCarousel();
};

const fetchProductDetail = async () => {
  const id = route.params.id; // 获取路由参数
  if (!id) {
    ElMessage.error('商品 id 缺失');
    return;
  }
  try {
    console.log('id：', id);
    const data = await getProductDetail(id);
    console.log('获取到的商品详情数据：', data);
    // product.value = data;
    // 同时合并评论和子种类数据（editions），确保数据存在
    product.value = { 
      ...data, 
      comments: data.comments || [],
      editions: data.editions || [] 
    };
    // 启动轮播（如果存在图片则从第一张开始）
    activeImageIndex.value = 0;
    startCarousel();
  } catch (error) {
    ElMessage.error('获取商品详情失败');
  }
};


// 定义跳转到 goToModifyProduct 页面的方法
const goToModifyProduct = (id) => {
  router.push(`/modifyProduct/${id}`);
};

// 为评论点赞功能添加 toggleLike 方法
const toggleLike = (index) => {
  const comment = product.value.comments[index];
  if (comment) {
    // 如后端未返回 likeActive 和 like 字段，则初始化
    if (comment.likeActive === undefined) {
      comment.likeActive = false;
    }
    if (comment.like === undefined) {
      comment.like = 0;
    }
    // 切换点赞状态，并更新点赞数
    comment.likeActive = !comment.likeActive;
    comment.like = comment.likeActive ? comment.like + 1 : comment.like - 1;
  }
};

onMounted(fetchProductDetail);
onBeforeUnmount(() => {
  stopCarousel();
});
</script>

<template>
  <div class="wrapper">
    <div class="main">
      <div class="card" v-if="product">
        <div style="padding: 20px 5px 0px 20px;">
          <h2 style="color: #303133;">商品详情</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-xl-7 col-xxl-6">
              <div>
                <div class="row">
                  <!-- 缩略图区域 -->
                  <div class="col-4 col-md-3 col-xxl-2">
                    <div class="nav flex-column nav-outline" role="tablist" aria-orientation="vertical">
                      <!-- 遍历实际存在的图片 -->
                      <a
                        v-for="(picKey, index) in actualPictureKeys"
                        :key="picKey"
                        class="nav-link p-1"
                        :class="{ active: activeImageIndex === index }"
                        @mouseover="handleMouseOver(index)"
                        @mouseleave="handleMouseLeave"
                      >
                        <img
                          :src="`http://localhost:8080/images/${product[picKey]}`"
                          :alt="`商品图片${index + 1}`"
                          class="img-fluid mx-auto d-block rounded mh-75px"
                        />
                      </a>
                    </div>
                  </div>
                  <!-- 主展示区域 -->
                  <div class="col-8 col-md-1 col-xxl-9">
                    <div class="tab-content p-3">
                      <div>
                        <!-- 仅显示实际存在的图片 -->
                        <img
                          v-if="actualPictureKeys.length > 0"
                          :src="`http://localhost:8080/images/${product[actualPictureKeys[activeImageIndex]]}`"
                          alt="商品图片"
                          class="img-fluid"
                        />
                        <img
                          v-else
                          src="/src/assets/ProductsManage/img/loading.png"
                          alt="加载中"
                          class="img-fluid"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <h5>商品版本:</h5>
                      <div id="classificationList" class="col-8 col-md-1 col-xxl-10">
                        <!-- 当存在子种类（editions）时，循环展示每个子种类 -->
                        <template v-if="product.editions && product.editions.length > 0">
                          <div v-for="edition in product.editions" :key="edition.id" class="input-group mb-3 classification-item">
                            <span class="input-group-text form-control-lg price">￥{{ edition.price }}</span>
                            <span class="form-control form-control-lg name">{{ edition.editionName }}</span>
                            <span class="input-group-text form-control-lg storage me-2">{{ edition.storage }}件</span>
                          </div>
                        </template>
                        <!-- 否则展示单个大商品信息 -->
                        <template v-else>
                          <div class="input-group mb-3 classification-item">
                            <span class="input-group-text form-control-lg price">￥{{ product.price }}</span>
                            <span class="form-control form-control-lg name">{{ product.name }}</span>
                            <span class="input-group-text form-control-lg storage me-2">{{ product.storage }}件</span>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-5 col-xxl-5">
              <h4 class="mt-1">{{ product.name }}</h4>
              <span class="badge badge-subtle-primary">{{ product.category }}</span>
              <p class="mb-3">
                <i class="fa-solid text-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    data-lucide="star" class="lucide lucide-star align-middle me-2">
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                    </polygon>
                  </svg>
                </i> 4.6 <span class="text-muted">out of 40 Reviews</span>
              </p>

              <h4 class="mb-3">价格: ￥{{ product.price }}起</h4>

              <div class="row mb-3">
                <div class="col-md-12">
                  <p class="text-muted mb-4">
                    <i class="align-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        data-lucide="map" class="lucide lucide-map align-middle me-2">
                        <path
                          d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z">
                        </path>
                        <path d="M15 5.764v15"></path>
                        <path d="M9 3.236v15"></path>
                      </svg>
                    </i>
                    <span class="align-middle">简介：{{ product.description }}</span>
                  </p>
                  <p class="text-muted">
                    <i class="align-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        data-lucide="tag" class="lucide lucide-tag align-middle me-2">
                        <path
                          d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z">
                        </path>
                        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
                      </svg>
                    </i>
                    <span class="align-middle">分类:{{ product.type }}</span>
                  </p>
                  <p class="text-muted">
                    <i class="align-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        data-lucide="database" class="lucide lucide-database align-middle me-2">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                        <path d="M3 12A9 3 0 0 0 21 12"></path>
                      </svg>
                    </i>
                    <span class="align-middle">库存:{{ product.storage }}件</span>
                  </p>

                </div>
              </div>


              <button class="btn btn-primary mb-3 me-1" @click="goToModifyProduct(product.id)">
                <i class="align-middle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    data-lucide="edit" class="lucide lucide-edit align-middle me-2">
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                  </svg>
                </i>
                <span class="align-middle">编辑商品信息</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>加载中...</p>
      </div>

      <div class="card" v-if="product.comments">
        <div class="card-header">
          <h5 class="card-title mb-0">
            Comments (<span id="commentNum">{{ product.comments.length }}</span>)
          </h5>
        </div>
        <div class="card-body">
          <!-- 当评论列表为空时，显示暂无评论 -->
          <div v-if="product.comments.length === 0">
            <p>暂无评论</p>
          </div>
          <!-- 遍历评论数组 -->
          <div v-for="(comment, index) in product.comments" :key="index" class="d-flex align-items-start">
            <!--<img :src="comment.avatar || '@/assets/ProductsManage/img/头像.jpg'" width="56" height="56" class="rounded-circle me-3" alt="头像">-->
            <div class="flex-grow-1">
              <small class="float-end">{{ comment.createTime }}</small>
              <p class="mb-2"><strong>{{ comment.userName }}</strong></p>
              <p>{{ comment.content }}</p>
              <div style="text-align: right;">
                <ul style="display: flex; list-style-type: none; padding: 0; margin: 0 0 0 920px;">
                  <!-- 点赞按钮 -->
                  <li style="margin-right: 10px;">
                    <a class="nav-item dropdown nav-icon dropdown-toggle like-btn" @click="toggleLike(index)"
                      :class="{ active: comment.likeActive }">
                      <div class="position-relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          data-lucide="thumbs-up" class="lucide lucide-message-circle align-middle text-body">
                          <path d="M7 10v12"></path>
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                        </svg>
                        <span class="indicator">{{ comment.like }}</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            <hr/>
            </div>
          </div>
        </div>
      </div>  
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/ProductsManage/app.css";

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>