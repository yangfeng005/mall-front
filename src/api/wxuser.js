import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/wxUser/list',
    method: 'post',
    data,
  });
}

//根据id获取
export function getById(data, id) {
  return request({
    url: '/wxUser/' + id,
    method: 'GET',
    data: data,
  });
}

//插入
export function insert(data) {
  return request({
    url: '/wxUser',
    method: 'POST',
    data: data,
  });
}

//更新数据状态
export function updateById(data) {
  return request({
    url: '/wxUser/',
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
    url: '/wxUser/' + id,
    method: 'DELETE',
  });
}
