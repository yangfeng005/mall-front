<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="名称">
        <el-input clearable v-model="pageParams.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne()">添加</el-button>
      </el-form-item>
    </el-form>
    <el-table stripe v-loading="loading" :data="tableData" row-key="id" default-expand-all border style="width: 100%; margin-bottom: 20px;">
      <el-table-column prop="productName" label="商品名称" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="goodsSpecificationIds" label="商品规格" show-overflow-tooltip width="150"></el-table-column>
      <el-table-column prop="goodsSn" label="商品序列号" show-overflow-tooltip width="140"></el-table-column>
      <el-table-column prop="goodsNumber" label="商品库存" show-overflow-tooltip width="120"></el-table-column>
      <el-table-column prop="retailPrice" label="零售价格(元)" width="80"></el-table-column>
      <el-table-column prop="marketPrice" label="市场价格(元)" width="80"></el-table-column>
      <el-table-column label="操作" align="center" :width="!$route.meta.manage ? '150' : '150'">
        <template slot-scope="scope">
          <el-button @click="updateOne(scope.row)" type="primary" size="mini">{{ $route.meta.manage ? '编辑' : '详情' }}</el-button>
          <el-popconfirm v-if="$route.meta.manage" title="确定删除吗？" @confirm="removeOne(scope.row.id)">
            <el-button slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
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
      width="55%"
      :max-height="tableH"
      :height="tableH"
      :close-on-click-modal="false"
      :title="form.id ? '编辑' : '添加'"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
        <el-form-item label="商品">
          <el-select v-model="form.goodsId">
            <el-option v-for="(item, index) in goodsList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品规格">
          <el-checkbox-group v-model="form.goodsSpecificationIdList" @change="showSpecification">
            <el-checkbox v-for="(item, index) in specificationList" :key="index" :label="item.name">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-row v-for="(element, key) in form.specificationMap" :key="key">
          <el-form-item :label="key">
            <el-select class="paddingcss long_select_">
              <el-option v-for="data in element" :key="index" :label="data.value" :value="data.value"></el-option
            ></el-select>
          </el-form-item>
        </el-row>
        <el-form-item label="商品序列号">
          <el-input v-model="form.goodsSn" maxlength="64"></el-input>
        </el-form-item>
        <el-form-item label="商品库存">
          <el-input-number v-model="form.goodsNumber" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="零售价格">
          <el-input-number v-model="form.retailPrice" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="市场价格">
          <el-input-number v-model="form.marketPrice" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button :loading="saving" type="primary" v-if="$route.meta.manage" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';
import { deleteById, getList, insert, updateById } from '@/api/product';
import { getAllSpecificationList } from '@/api/specification';
import { getAllGoodsList } from '@/api/goods';

const defaultProps = {
  id: null,
  goodsId: '',
  goodsSn: '',
  goodsNumber: '',
  retailPrice: '',
  marketPrice: '',
  goodsSpecificationIds: '',
  goodsSpecificationIdList: [],
  productName: '',
  specificationMap: null,
};

export default {
  name: 'Product',
  data(props) {
    return {
      innerVisible: false,
      goodsList: [],
      specificationList: [],
      loading: false,
      saving: false,
      pageParams: {
        name: '',
      },
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      formRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
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
    showSpecification(val) {},
    handleClick(tab, event) {
      console.log(tab, event);
    },
    addOne(row) {
      if (row) {
        this.form.name = row.name;
      }
      getAllSpecificationList().then((res) => {
        this.specificationList = res.data;
      });
      getAllGoodsList().then((res) => {
        this.goodsList = res.data;
      });
      this.dialogVisible = true;
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
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        this.saving = true;

        if (this.form && this.form.id) {
          updateById(JSON.stringify(this.form))
            .then(() => {
              this.$message({
                message: '保存成功',
                type: 'success',
              });
              this.loadData();
              this.handleCancel();
            })
            .finally(() => (this.saving = false));
        } else {
          insert({
            ...this.form,
          })
            .then(() => {
              this.$message({
                message: '保存成功',
                type: 'success',
              });
              this.loadData();
              this.handleCancel();
            })
            .finally(() => (this.saving = false));
        }
      });
    },
    updateOne(row) {
      getAllSpecificationList().then((res) => {
        this.specificationList = res.data;
      });
      getAllGoodsList().then((res) => {
        this.goodsList = res.data;
      });
      this.form = this._.pick(row, Object.keys(defaultProps));
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    removeOne(agencyId) {
      deleteById(agencyId).then(() => {
        this.$message({
          message: '删除成功',
          type: 'success',
        });
        this.loadData();
      });
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
  },
};
</script>