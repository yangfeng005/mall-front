<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="订单号">
        <el-input clearable v-model="pageParams.orderSn" placeholder="请输入订单号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table stripe v-loading="loading" :data="tableData" row-key="id" default-expand-all border style="width: 100%; margin-bottom: 20px;">
      <el-table-column prop="orderSn" label="订单号" show-overflow-tooltip width="180"></el-table-column>
      <!--<el-table-column prop="orderType" label="订单类型" show-overflow-tooltip width="100">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <template v-if="scope.row.orderType==1">
                普通订单
              </template>
            </div>
          </template>
      </el-table-column>-->
      <el-table-column prop="orderStatus" label="订单状态" show-overflow-tooltip width="90">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.orderStatus == '0'">
              待付款
            </template>
            <template v-else-if="scope.row.orderStatus == '101'">
              订单已取消
            </template>
            <template v-else-if="scope.row.orderStatus == '102'">
              订单已删除
            </template>
            <template v-else-if="scope.row.orderStatus == '201'">
              订单已付款
            </template>
            <template v-else-if="scope.row.orderStatus == '300'">
              订单已发货
            </template>
            <template v-else-if="scope.row.orderStatus == '301'">
              用户确认收货
            </template>
            <template v-else-if="scope.row.orderStatus == '401'">
              退款
            </template>
            <template v-else-if="scope.row.orderStatus == '402'">
              完成
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="shippingStatus" label="发货状态" show-overflow-tooltip width="90">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.shippingStatus == '0'">
              未发货
            </template>
            <template v-if="scope.row.shippingStatus == '1'">
              已发货
            </template>
            <template v-if="scope.row.shippingStatus == '2'">
              已收货
            </template>
            <template v-if="scope.row.shippingStatus == '4'">
              退货
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="payStatus" label="付款状态" show-overflow-tooltip width="90">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.payStatus == '0'">
              未付款
            </template>
            <template v-if="scope.row.payStatus == '1'">
              付款中
            </template>
            <template v-if="scope.row.payStatus == '2'">
              已付款
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="shippingName" label="快递公司" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="shippingNo" label="快递单号" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="actualPrice" label="实际支付金额" width="80"></el-table-column>
      <el-table-column prop="orderPrice" label="订单总价" width="80"></el-table-column>
      <el-table-column prop="goodsPrice" label="商品总价" width="80"></el-table-column>
      <el-table-column prop="addTime" label="下单时间" show-overflow-tooltip width="130"></el-table-column>
      <el-table-column label="操作" align="center" :width="!$route.meta.manage ? '150' : '150'">
        <template slot-scope="scope">
          <el-button @click="orderDetail(scope.row)" type="primary" size="mini">详情</el-button>
          <el-button @click="delivery(scope.row)" type="danger" size="mini">发货</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pageParams.pageNo"
      background
      layout="total, prev, pager, next, jumper, sizes"
      :page-size="pageParams.pageSize"
      :total="total"
    ></el-pagination>
    <el-dialog
      top="5vh"
      width="60%"
      :max-height="tableH"
      :height="tableH"
      :close-on-click-modal="false"
      title="订单详情"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="订单信息" name="general">
          <el-form ref="form" :model="form" :disabled="true" label-width="110px">
            <el-form-item label="订单号">
              <el-input v-model="form.orderSn" />
            </el-form-item>
            <el-form-item label="订单类型">
              <el-select v-model="form.orderType">
                <el-option value="1">普通订单</el-option>
                <el-option value="2">团购订单</el-option>
                <el-option value="3">砍价订单</el-option>
                <el-option value="4">立即购买</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订单状态">
              <el-radio-group v-model="form.orderStatus">
                <el-radio :label="0">
                  待付款
                </el-radio>
                <el-radio :label="101">
                  订单已取消
                </el-radio>
                <el-radio :label="102">
                  订单已删除
                </el-radio>
                <el-radio :label="201">
                  订单已付款
                </el-radio>
                <el-radio :label="300">
                  订单已发货
                </el-radio>
                <el-radio :label="301">
                  用户确认收货
                </el-radio>
                <el-radio :label="401">
                  退款
                </el-radio>
                <el-radio :label="402">
                  完成
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="发货状态">
              <el-radio-group v-model="form.shippingStatus">
                <el-radio :label="0">
                  待发货
                </el-radio>
                <el-radio :label="1">
                  已发货
                </el-radio>
                <el-radio :label="2">
                  已收货
                </el-radio>
                <el-radio :label="4">
                  退货
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="付款状态">
              <el-radio-group v-model="form.payStatus">
                <el-radio :label="0">
                  待付款
                </el-radio>
                <el-radio :label="1">
                  付款中
                </el-radio>
                <el-radio :label="2">
                  已付款
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="收货人">
              <el-input v-model="form.consignee" />
            </el-form-item>
            <el-form-item label="收货地址">
              <el-input v-model="form.address" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="form.mobile" />
            </el-form-item>
            <el-form-item label="快递公司">
              <el-input v-model="form.shippingName" />
            </el-form-item>
            <el-form-item label="快递单号">
              <el-input v-model="form.shippingNo" />
            </el-form-item>
            <el-form-item label="付款方">
              <el-input v-model="form.payName" />
            </el-form-item>
            <el-form-item label="快递费用">
              <el-input v-model="form.shippingFee" />
            </el-form-item>
            <el-form-item label="实际支付">
              <el-input v-model="form.actualPrice" />
            </el-form-item>
            <el-form-item label="订单总价">
              <el-input v-model="form.orderPrice" />
            </el-form-item>
            <el-form-item label="商品总价">
              <el-input v-model="form.goodsPrice" />
            </el-form-item>
            <el-form-item label="下单时间">
              <el-date-picker type="date" value-format="yyyy-MM-dd" v-model="form.addTime" style="width: 100%;"></el-date-picker>
            </el-form-item>
            <el-form-item label="付款时间">
              <el-date-picker type="date" value-format="yyyy-MM-dd" v-model="form.payTime" style="width: 100%;"></el-date-picker>
            </el-form-item>
            <el-form-item label="配送费用">
              <el-input v-model="form.freightPrice" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="订单商品" name="goodInfo">
          <el-row>
            <el-col :span="8">
              <span>单据编号：{{ form.orderSn }}</span>
              <p>
                <span>日期： {{ this.nowDate }}</span>
              </p>
              <address>
                <strong>{{ form.consignee }}</strong
                ><br />
                {{ form.address }}<br />
                <abbr title="Phone">联系方式：</abbr> {{ form.mobile }}
              </address>
              <br />
            </el-col>
          </el-row>

          <el-table
            stripe
            v-loading="loading"
            :data="orderGoods"
            row-key="id"
            default-expand-all
            border
            style="width: 100%; margin-bottom: 20px;"
          >
            <el-table-column prop="goodsName" label="清单" show-overflow-tooltip width="400"></el-table-column>
            <el-table-column prop="number" label="数量" show-overflow-tooltip width="100"></el-table-column>
            <el-table-column prop="retailPrice" label="单价" width="100" :formatter="format"></el-table-column>
            <el-table-column label="总价" width="100" :formatter="formatTotal"></el-table-column>
          </el-table>
          <el-row>
            <el-col :span="6" :offset="18">
              <span>总计：¥{{ this.totalPrice }}</span>
            </el-col>
          </el-row>
          <el-button type="primary" @click="print"><i class="el-icon-printer"></i>打印</el-button>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button @click="handleCancel">返回</el-button>
      </div>
    </el-dialog>
    <el-dialog
      top="5vh"
      width="35%"
      :max-height="tableH"
      :height="tableH"
      :close-on-click-modal="false"
      title="发货"
      :visible.sync="dialogDeliveryVisible"
      :before-close="handleCancel"
    >
      <el-form ref="form" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="快递公司" prop="shippingId" required="">
          <el-select v-model="form.shippingId">
            <el-option v-for="shipping in shippingList" :value="shipping.id" :key="shipping.id" :label="shipping.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="shippingNo" required="">
          <el-input v-model="form.shippingNo" placeholder="快递单号" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogDeliveryVisible = false">取 消</el-button>
        <el-button :loading="saving" type="primary" v-if="$route.meta.manage" @click="deliveryGoods">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';
import { getList, sendGoods } from '@/api/order';
import { getAllShippingList } from '@/api/shipping';
import { getList as getOrderGoodsList } from '@/api/orderGoods';
import { getCurrentDate } from '@/utils/common';

const defaultProps = {
  id: null,
  orderSn: '',
  orderStatus: null,
  shippingStatus: null,
  payStatus: null,
  consignee: '',
  country: '',
  province: '',
  city: '',
  district: '',
  address: '',
  mobile: '',
  postscript: '',
  shippingId: '',
  shippingName: '',
  payId: '',
  payName: '',
  shippingFee: null,
  actualPrice: null,
  integral: null,
  integralMoney: null,
  orderPrice: null,
  goodsPrice: null,
  payTime: null,
  freightPrice: null,
  couponId: null,
  parentId: null,
  couponPrice: null,
  callbackStatus: '',
  shippingNo: '',
  fullCutPrice: null,
  orderType: '',
  addTime: null,
};

export default {
  name: 'Order',
  data(props) {
    return {
      totalPrice: null,
      nowDate: null,
      orderGoods: [],
      dialogDeliveryVisible: false,
      shippingList: [],
      loading: false,
      saving: false,
      pageParams: {
        orderSn: '',
        pageNo: 1,
        pageSize: 10,
      },
      activeName: 'general',
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      formRules: {
        shippingId: [{ required: true, message: '请选择快递公司', trigger: 'blur' }],
        shippingNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }],
      },
    };
  },
  computed: {
    ...mapState('layout', ['tableHeight']),

    tableH() {
      if (this.tableHeight) {
        let html = getStyle(document.documentElement);
        let htmlFont = Number(html.fontSize.replace('px', ''));
        return this.tableHeight - 1.5 * htmlFont;
      }
      return null;
    },
  },
  methods: {
    print: function () {
      window.print();
    },
    format(row) {
      return '¥' + row.retailPrice;
    },
    formatTotal(row) {
      return '¥' + row.retailPrice * row.number;
    },
    deliveryGoods() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        this.saving = true;
        sendGoods({
          ...this.form,
        })
          .then(() => {
            this.$message({
              message: '保存成功',
              type: 'success',
            });
            this.loadData();
            this.dialogDeliveryVisible = false;
          })
          .finally(() => (this.saving = false));
      });
    },
    delivery(row) {
      this.form = this._.pick(row, Object.keys(defaultProps));
      this.dialogDeliveryVisible = true;
    },
    handleClick() {
      console.log();
    },
    orderDetail(row) {
      this.form = this._.pick(row, Object.keys(defaultProps));
      var searchFrom = {
        orderId: row.id,
      };
      getOrderGoodsList({
        ...searchFrom,
      }).then((res) => {
        this.orderGoods = res.data;
        if (this.orderGoods && this.orderGoods.length > 0) {
          let totalPrice = 0;
          this.orderGoods.forEach((item) => {
            totalPrice += item.retailPrice * item.number;
          });
          this.totalPrice = totalPrice;
        }
      });
      this.nowDate = getCurrentDate(2);
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    handleSelectionChange(val) {
      this.goodsIds = [];
      if (val && val.length > 0) {
        val.forEach((item) => {
          this.goodsIds.push(item.id);
        });
      }
    },
    handleSearch() {
      this.loadData();
    },
    loadData() {
      this.loading = true;
      getList(this.pageParams)
        .then((res) => {
          if (res.data) {
            this.tableData = res.data;
            this.total = (res.additionalProperties.page && res.additionalProperties.page.total) || res.data.length;
          }
        })
        .finally(() => (this.loading = false));
    },
    handleCancel() {
      this.form = this._.cloneDeep(defaultProps);
      this.$refs.form.resetFields();
      this.dialogVisible = false;
    },
    handleSizeChange(pageSize) {
      this.pageParams.pageSize = pageSize;
      this.loadData();
    },
    handleCurrentChange(pageNo) {
      this.pageParams.pageNo = pageNo;
      this.loadData();
    },
  },
  mounted() {
    this.loadData();
    getAllShippingList().then((res) => {
      this.shippingList = res.data;
    });
  },
};
</script>
