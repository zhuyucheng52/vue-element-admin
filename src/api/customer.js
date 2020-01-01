import request from '@/utils/request'

export function getCustomers(params) {
  return request({
    url: '/customers',
    method: 'get',
    params
  })
}

export function addCustomer(data) {
  return request({
    url: '/customer',
    method: 'post',
    data
  })
}

export function getCustomerById(id) {
  return request({
    url: `/customer/${id}`,
    method: 'get'
  })
}

export function updateCustomer(data) {
  return request({
    url: '/customer',
    method: 'put',
    data
  })
}

export function deleteCustomer(id) {
  return request({
    url: `/customer/${id}`,
    method: 'delete'
  })
}
