<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="6">
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus"
                     @click="handleCreate">
            添加
          </el-button>
        </el-col>
        <el-col :span="8" :offset="10">
          <el-input placeholder="请输入用户名,用户姓名或手机号搜索" v-model="listQuery.q" class="input-with-select"
                    @keyup.enter.native="getList">
            <el-button slot="append" icon="el-icon-search" @click="getList"/>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        type="index"
        width="50" align="center">
      </el-table-column>
      <el-table-column label="用户名" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="80" align="center">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.remark" placement="top-start">
            <span>{{ scope.row.name }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="电话" width="140" property="mobile"/>
      <el-table-column label="生日" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.birthday | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="240">
        <template slot-scope="scope">
          <span>{{ scope.row.roles.map(r => r.name).join(',') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="禁用" width="70" align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.disabled" @change="checkDisabledStatus(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button-group>
            <el-tooltip effect="dark" content="编辑" placement="top-end" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)"/>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top-end" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)"/>
            </el-tooltip>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <!--    添加用户对话框-->
    <el-dialog title="添加用户" :visible.sync="addFormVisible">
      <el-form ref="addForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" type="password" autocomplete="off" show-password/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="temp.roles" value-key="id" multiple clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allRoles"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="temp.mobile"/>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="请选择生日" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearAddForm">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确认
        </el-button>
      </div>
    </el-dialog>


    <!--  编辑用户对话框  -->
    <el-dialog title="编辑用户" :visible.sync="editFormVisible">
      <el-form ref="editForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="用户名">
          <el-input v-model="temp.username" disabled/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="temp.roles" value-key="id" multiple clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allRoles"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="temp.mobile"/>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="请选择生日" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearEditForm">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { addUser, deleteUser, getUsers, getUserById, updateUser } from '@/api/user'
  import { getRoles } from '@/api/role'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  export default {
    name: 'User',
    components: { Pagination },
    data() {
      return {
        list: [],
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          q: undefined
        },
        temp: {},
        allRoles: [],
        addFormVisible: false,
        editFormVisible: false,
        rules: {
          username: [
            { required: true, message: '用户名不能为空', trigger: 'blur' }
            ],
          password: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '姓名不能为空', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '电话不能为空', trigger: 'blur' },
          ],
          roles: [
            { required: true, message: '角色不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getAllRoles() {
        getRoles().then(response => {
          this.allRoles = response.data.list
        })
      },
      resetTemp() {
        this.temp = {
          roles: []
        }
      },
      clearAddForm() {
        this.resetTemp()
        this.addFormVisible = false
        this.$refs['addForm'].clearValidate()
      },
      clearEditForm() {
        this.resetTemp()
        this.editFormVisible = false
        this.$refs['editForm'].clearValidate()
      },
      clearTemp() {
        this.resetTemp()
        this.addFormVisible = false
        this.editFormVisible = false
      },
      getList() {
        this.listLoading = true
        getUsers(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.paginator.totalCount
          this.listLoading = false
        })
      },
      handleCreate() {
        this.resetTemp()
        this.addFormVisible = true
        this.$nextTick(() => {
          this.getAllRoles()
          this.$refs['addForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['addForm'].validate((valid) => {
          if (valid) {
            this.temp.disabled = false
            addUser(this.temp).then(response => {
              if (this.handleErrorMsg(response)) {
                return
              }

              this.$nextTick(() => {
                this.getList()
                this.clearAddForm()
              })
              this.$notify.success({
                title: '提示',
                message: '创建成功'
              })
            })
          }
        })
      },
      checkDisabledStatus(row) {
        let msg = (!row.disabled) ? '是否启用该用户' : '是否禁用该用户'
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(r => {
          updateUser({
            id: row.id,
            disabled: row.disabled
          }).then(response => {
            this.$notify({
              title: '提示',
              message: '更新状态成功',
              type: 'success'
            })
          })
        }).catch(() => row.disabled = !row.disabled)
      },
      handleUpdate(row) {
        getUserById(row.id).then(response => {
          this.$nextTick(() => {
            this.getAllRoles()
            this.temp = response.data
            this.editFormVisible = true
          })
        })
      },
      handleErrorMsg(response) {
        if (response.success !== 1) {
          this.$message.error(response.errorMsg)
          return true
        }
        return false
      },
      updateData() {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            this.temp.password = undefined
            updateUser(this.temp).then(response => {
              this.getList()
              this.clearEditForm()
              this.$notify.success({
                title: '提示',
                message: '更新成功'
              })
            })
          }
        })
      },
      handleDelete(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.$confirm('是否删除该用户?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(r => {
          this.doDelete()
        }).catch(() => {})
      },
      doDelete() {
        deleteUser(this.temp.id).then(response => {
          this.getList()
          this.clearTemp()
          this.$notify.success({
            title: '提示',
            message: '删除成功'
          })
        })
      }
    }
  }
</script>

