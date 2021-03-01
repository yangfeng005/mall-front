<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="会员名称">
        <el-input clearable v-model="pageParams.userName" placeholder="会员名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne">添加</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" :data="tableData" :max-height="tableH" :height="tableH" border>
      <el-table-column prop="username" label="会员名称" show-overflow-tooltip width="120"></el-table-column>
      <el-table-column label="性别" width="50">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.gender">
              <el-tag size="mini">男</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">女</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="出生日期" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="registerTime" label="注册时间" show-overflow-tooltip width="130"></el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" show-overflow-tooltip width="130"></el-table-column>
      <el-table-column prop="lastLoginIp" label="最后登录Ip" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="nickname" label="微信名" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="mobile" label="手机号码" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="registerIp" label="注册Ip" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column label="头像" width="80">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.avatar" style="vertical-align: middle;" :src="scope.row.avatar"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="weixinOpenid" label="微信Id" show-overflow-tooltip width="120"></el-table-column>
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
        <el-form-item label="会员名称" prop="username" required>
          <el-input v-model="form.username" placeholder="会员名称" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">
              男
            </el-radio>
            <el-radio :label="2">
              女
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker type="date" value-format="yyyy-MM-dd" v-model="form.birthday" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="form.mobile" placeholder="手机号码" />
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
import { deleteById, getList, insert, updateById } from '@/api/wxuser';

import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';

const defaultProps = {
  id: null,
  username: '',
  nickname: '',
  gender: null,
  birthday: null,
  registerTime: null,
  lastLoginTime: null,
  lastLoginIp: '',
  userLevelId: null,
  mobile: '',
  registerIp: '',
  avatar: '',
  weixinOpenid: '',
};

export default {
  name: 'WxUser',
  data(props) {
    return {
      loading: false,
      saving: false,
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        userName: '',
      },
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      brandIds: [], // 批量操作状态
      formRules: {
        username: [{ required: true, message: '请输入会员名称', trigger: 'blur' }],
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
