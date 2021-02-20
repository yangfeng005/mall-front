import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/attributeCategory/list',
    method: 'post',
    data,
  });
}

//根据id获取
export function getById(data, id) {
  return request({
    url: '/attributeCategory/' + id,
    method: 'GET',
    data: data,
  });
}

//插入
export function insert(data) {
  return request({
    url: '/attributeCategory',
    method: 'POST',
    data: data,
  });
}

//更新数据状态
export function updateById(data) {
  return request({
    url: '/attributeCategory/',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  });
}

//删除
export function deleteById(id) {
  return request({
    url: '/attributeCategory/' + id,
    method: 'DELETE',
  });
}

export function getAttributeCategoryList() {
  return request({
    url: '/attributeCategory/listAll',
    method: 'post',
  });
}
