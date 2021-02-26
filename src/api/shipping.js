import request from '@/utils/request';

export function getAllShippingList(data) {
  return request({
    url: '/shipping/listAll',
    method: 'post',
    data,
  });
}
