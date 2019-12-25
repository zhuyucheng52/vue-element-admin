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
            <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
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
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
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
      <el-table-column label="电话" width="140" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
        </template>
      </el-table-column>
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
      <el-table-column label="状态" width="70">
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
          <el-input v-model="temp.password" type="password" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="temp.mobile"/>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="请选择生日"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearTemp">
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
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="temp.mobile"/>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="请选择生日"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearTemp">
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
  import waves from '@/directive/waves' // waves directive
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  //   const calendarTypeOptions = [
  //   { key: 'CN', display_name: 'China' }
  // ]

  // arr to obj, such as { CN : "China", US : "USA" }
  // const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  //   acc[cur.key] = cur.display_name
  //   return acc
  // }, {})

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
          ]
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        getUsers(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.paginator.totalCount
          this.listLoading = false
        })
      },
      handleCreate() {
        this.addFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      clearTemp() {
        this.temp = {}
        this.addFormVisible = false
        this.editFormVisible = false
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            addUser(this.temp).then(response => {
              this.getList()
              this.addFormVisible = false
              this.temp = {}
              this.$notify({
                title: '提示',
                message: '创建成功',
                type: 'success',
              })
            })
          }
        })
      },
      checkDisabledStatus(row) {
        let msg = !row.disabled ? '是否禁用该用户' : '是否启用该用户'
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(response => {
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
        }).catch(() => {
          row.disabled = !row.disabled
        })
      },
      handleUpdate(row) {
        getUserById(row.id).then(response => {
          this.$nextTick(() => {
            this.temp = response.data
            this.editFormVisible = true
          })
        })
      },
      updateData() {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            this.temp.password = undefined
            updateUser(this.temp).then(response => {
              this.getList()
              this.editFormVisible = false
              this.temp = {}
              this.$notify({
                title: '提示',
                message: '更新成功',
                type: 'success',
              })
            })
          }
        })
      },
      handleDelete(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.deleteConfirmVisible = true
      },
      doDelete() {
        const tempData = Object.assign({}, this.temp)
        deleteUser(tempData.id).then(response => {
          this.getList()
          this.deleteConfirmVisible = false
          this.$notify({
            title: '提示',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
</script>
