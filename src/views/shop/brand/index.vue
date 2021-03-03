<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="品牌名称">
        <el-input clearable v-model="pageParams.name" placeholder="品牌名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne">添加</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" :data="tableData" :max-height="tableH" :height="tableH" border>
      <el-table-column prop="name" label="品牌名称" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column label="图片" width="100">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.listPicUrl" style="vertical-align: middle;" :src="getFile(scope.row.listPicUrl)"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="simpleDesc" label="描述" show-overflow-tooltip width="300"></el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80"></el-table-column>
      <el-table-column label="显示" width="60">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isShow">
              <el-tag size="mini">是</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">否</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="app显示图片" width="100">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.appListPicUrl" style="vertical-align: middle;" :src="getFile(scope.row.appListPicUrl)"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="新品牌" width="60">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isNew">
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
      :close-on-click-modal="false"
      :title="!$route.meta.manage ? '详情' : form.id ? '编辑' : '添加'"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <upload-img :avatarUrl="form.listPicUrl" @changeUrl="(url) => (form.listPicUrl = url)" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.simpleDesc" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.isShow">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="app显示图片">
          <upload-img :avatarUrl="form.appListPicUrl" @changeUrl="(url) => (form.appListPicUrl = url)" />
        </el-form-item>
        <el-form-item label="是否新品牌">
          <el-radio-group v-model="form.isNew">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="新品牌图片">
          <upload-img :avatarUrl="form.newPicUrl" @changeUrl="(url) => (form.newPicUrl = url)" />
        </el-form-item>
        <el-form-item label="新品牌排序">
          <el-input-number v-model="form.newSortOrder" :min="1" controls-position="right"></el-input-number>
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
import { deleteById, getList, insert, updateById } from '@/api/brand';
import UploadImg from '@/components/Upload';

import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';

const defaultProps = {
  id: null,
  name: '',
  listPicUrl: '',
  simpleDesc: '',
  sortOrder: null,
  isShow: null,
  floorPrice: null,
  appListPicUrl: '',
  isNew: null,
  newPicUrl: '',
  newSortOrder: null,
};

export default {
  name: 'Brand',
  data(props) {
    return {
      loading: false,
      saving: false,
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
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
  },
};
</script>
