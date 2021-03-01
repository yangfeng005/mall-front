import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/adPosition/list',
    method: 'post',
    data,
  });
}

//根据id获取
export function getById(data, id) {
  return request({
    url: '/adPosition/' + id,
    method: 'GET',
    data: data,
  });
}

//插入
export function insert(data) {
  return request({
    url: '/adPosition',
    method: 'POST',
    data: data,
  });
}

//更新数据状态
export function updateById(data) {
  return request({
    url: '/adPosition/',
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
    url: '/adPosition/' + id,
    method: 'DELETE',
  });
}

export function getAllAdPositionList() {
  return request({
    url: '/adPosition/listAll',
    method: 'post',
  });
}
