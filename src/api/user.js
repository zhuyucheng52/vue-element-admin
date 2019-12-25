import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get',
  })
}

export function getUserById(id) {
  return request({
    url: '/user/' + id,
    method: 'get'
  })
}

export function updateUser(data) {
  return request({
    url: '/user',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/user/' + id,
    method: 'delete'
  })
}

export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

export function getUsers(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}
