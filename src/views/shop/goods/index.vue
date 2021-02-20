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
      <el-table-column prop="categoryName" label="商品类型" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="name" label="名称" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="brandName" label="品牌" show-overflow-tooltip width="150"></el-table-column>
      <el-table-column label="上架" width="60">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isOnSale">
              <el-tag size="mini">是</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">否</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="录入日期" show-overflow-tooltip width="140"></el-table-column>
      <el-table-column prop="attributeCategoryName" label="属性类别" show-overflow-tooltip width="120"></el-table-column>
      <el-table-column prop="retailPrice" label="零售价格" width="80"></el-table-column>
      <el-table-column prop="goodsNumber" label="商品库存" width="80"></el-table-column>
      <el-table-column prop="sellVolume" label="销售量" width="80"></el-table-column>
      <el-table-column prop="marketPrice" label="市场价" width="80"></el-table-column>
      <el-table-column label="是否热销" width="50">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isHot">
              <el-tag size="mini">是</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">否</el-tag>
            </template>
          </div>
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
      :max-height="tableH"
      :height="tableH"
      :close-on-click-modal="false"
      :title="form.id ? '编辑' : '添加'"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="通用信息" name="general">
          <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" maxlength="64"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="详细描述" name="detail">
          <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" maxlength="64"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="其他信息" name="otherInfo">
          <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" maxlength="64"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
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
import { deleteById, getList, insert, updateById } from '@/api/goods';

const defaultProps = {
  id: null,
  name: '',
  categoryId: '',
  goodsSn: '',
  brandId: '',
  goodsNumber: null,
  keywords: '',
  goodsBrief: '',
  isOnSale: null,
  sortOrder: null,
  attributeCategory: '',
  counterPrice: null,
  extraPrice: null,
  isNew: null,
  goodsUnit: '',
  primaryPicUrl: '',
  listPicUrl: '',
  retailPrice: null,
  sellVolume: null,
  primaryProductId: '',
  unitPrice: null,
  promotionDesc: '',
  promotionTag: '',
  appExclusivePrice: null,
  isAppExclusive: '',
  isLimited: null,
  isHot: null,
  marketPrice: null,
};

export default {
  name: 'Goods',
  data(props) {
    return {
      loading: false,
      saving: false,
      pageParams: {
        name: '',
      },
      activeName: 'general',
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
    handleClick(tab, event) {
      console.log(tab, event);
    },
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
