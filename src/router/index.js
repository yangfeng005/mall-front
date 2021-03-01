import Vue from 'vue';
import Router from 'vue-router';
import Layout from '@/views/Layout';

Vue.use(Router);

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    uri: '/login',
    component: () => import('@/views/Login'),
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/404',
    uri: '/404',
    component: () => import('@/views/errorPage/404'),
    meta: { hideInMenu: true },
  },
  {
    path: '/401',
    uri: '/401',
    component: () => import('@/views/errorPage/401'),
    meta: { hideInMenu: true },
  },
];

export const asyncRoutes = [
  {
    path: '/systemManage',
    name: 'systemManage',
    uri: '/systemManage',
    component: Layout,
    meta: { title: '系统管理', icon: 'el-icon-setting' },
    children: [
      {
        path: 'agencyManage',
        name: 'agencyManage',
        uri: '/systemManage/agencyManage',
        component: () => import('@/views/system/organization/index'),
        meta: { title: '机构管理', manage: true },
      },
      {
        path: 'userManage',
        name: 'userManage',
        uri: '/systemManage/userManage',
        component: () => import('@/views/system/user/index'),
        meta: { title: '用户管理', manage: true },
      },
      {
        path: 'roleManage',
        name: 'roleManage',
        uri: '/systemManage/roleManage',
        component: () => import('@/views/system/role/index'),
        meta: { title: '角色权限', manage: true },
      },
      {
        path: 'sysLog',
        name: 'sysLog',
        uri: '/systemManage/sysLog',
        component: () => import('@/views/system/log/index'),
        meta: { title: '操作日志', manage: true },
      },
    ],
  },
  {
    path: '/shopSet',
    name: 'shopSet',
    uri: '/shopSet',
    component: Layout,
    meta: { title: '商城设置', icon: 'el-icon-setting' },
    children: [
      {
        path: 'attributeCategory',
        name: 'attributeCategory',
        uri: '/shopSet/attributeCategory',
        component: () => import('@/views/shop/attributecategory/index'),
        meta: { title: '商品属性种类', manage: true },
      },
      {
        path: 'specification',
        name: 'specification',
        uri: '/shopSet/specification',
        component: () => import('@/views/shop/specification/index'),
        meta: { title: '商品规格', manage: true },
      },
      {
        path: 'category',
        name: 'category',
        uri: '/shopSet/category',
        component: () => import('@/views/shop/category/index'),
        meta: { title: '商品类型', manage: true },
      },
      {
        path: 'brand',
        name: 'brand',
        uri: '/shopSet/brand',
        component: () => import('@/views/shop/brand/index'),
        meta: { title: '品牌制造商', manage: true },
      },
    ],
  },
  {
    path: '/editGoods',
    name: 'editGoods',
    uri: '/editGoods',
    component: Layout,
    meta: { title: '编辑商品', icon: 'el-icon-edit-outline' },
    children: [
      {
        path: 'goods',
        name: 'goods',
        uri: '/editGoods/goods',
        component: () => import('@/views/shop/goods/index'),
        meta: { title: '所有商品', manage: true },
      },
      {
        path: 'goodsSpecification',
        name: 'goodsSpecification',
        uri: '/editGoods/goodsSpecification',
        component: () => import('@/views/shop/goodsSpecification/index'),
        meta: { title: '商品规格', manage: true },
      },
      {
        path: 'product',
        name: 'product',
        uri: '/editGoods/product',
        component: () => import('@/views/shop/product/index'),
        meta: { title: '产品设置', manage: true },
      },
    ],
  },
  {
    path: '/order',
    name: 'order',
    uri: '/order',
    component: Layout,
    meta: { hideInMenu: true, title: '订单管理' },
    children: [
      {
        path: '/',
        name: 'order',
        uri: '/order',
        component: () => import('@/views/shop/order/index'),
        meta: { manage: true },
      },
    ],
  },
  {
    path: '/wxuser',
    name: 'wxuser',
    uri: '/wxuser',
    component: Layout,
    meta: { hideInMenu: true, title: '会员管理' },
    children: [
      {
        path: '/',
        name: 'wxuser',
        uri: '/wxuser',
        component: () => import('@/views/shop/wxuser/index'),
        meta: { manage: true },
      },
    ],
  },
  { path: '/', meta: { hideInMenu: true } },
  { path: '*', redirect: '/404', meta: { hideInMenu: true } },
];

const createRouter = () =>
  new Router({
    routes: constantRoutes,
  });

const router = createRouter();

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
