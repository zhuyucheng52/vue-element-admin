import request from '@/utils/request'

export function getCategories(params) {
  return request({
    url: '/product/categories',
    method: 'get',
    params
  })
}

export function addCategory(data) {
  return request({
    url: '/product/category',
    method: 'post',
    data
  })
}

export function getCategoryById(id) {
  return request({
    url: `/product/category/${id}`
  })
}

export function updateCategory(data) {
  return request({
    url: '/product/category',
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/product/category/${id}`,
    method: 'delete'
  })
}
