<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="商品名称">
        <el-input clearable v-model="pageParams.productName" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne">添加</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      ref="multipleTable"
      :data="tableData"
      :max-height="tableH"
      :height="tableH"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column prop="productName" label="商品" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="specificationName" label="规格" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="value" label="规格说明" width="200"></el-table-column>
      <el-table-column label="规格图片" width="100">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.picUrl" style="vertical-align: middle;" :src="getFile(scope.row.picUrl)"></el-avatar>
        </template>
      </el-table-column>
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
      width="40%"
      :close-on-click-modal="false"
      :title="!$route.meta.manage ? '详情' : form.id ? '编辑' : '添加'"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
        <el-form-item label="商品">
          <el-select v-model="form.goodsId">
            <el-option v-for="(item, index) in goodsList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-select v-model="form.specificationId">
            <el-option v-for="(item, index) in specificationList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规格说明">
          <el-input v-model="form.value" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="规格图片">
          <upload-img :avatarUrl="form.picUrl" @changeUrl="(url) => (form.picUrl = url)" />
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
import { deleteById, getList, insert, updateById } from '@/api/goodsSpecification';
import { getAllSpecificationList } from '@/api/specification';
import { getAllGoodsList } from '@/api/goods';
import UploadImg from '@/components/Upload';

import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';

const defaultProps = {
  id: null,
  goodsId: '',
  specificationId: '',
  value: '',
  picUrl: '',
};

export default {
  name: 'GoodsSpecification',
  data(props) {
    return {
      goodsList: [],
      specificationList: [],
      loading: false,
      saving: false,
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        productName: '',
      },
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      brandIds: [], // 批量操作状态
      formRules: {
        name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
      },
    };
  },
  components: {
    UploadImg,
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
    addOne(row) {
      if (row) {
        this.form.name = row.name;
      }
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
    handleSelectionChange(val) {
      this.brandIds = val;
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
    getAllSpecificationList().then((res) => {
      this.specificationList = res.data;
    });
    getAllGoodsList().then((res) => {
      this.goodsList = res.data;
    });
  },
};
</script>
