import React from 'react';
import {unresolvedStayRooms} from './data';
export default function AvailabilityNotice({data,type,arrival,departure,exclude,admin=false,rooms=data.rooms}){
 const unresolved=unresolvedStayRooms(rooms,data.bookings,type,arrival,departure,exclude);
 if(!unresolved.length)return null;
 return <p className={admin?'a-info':'notice'} role="status">{admin?`Cần xử lý khách đang ở tại phòng ${unresolved.map(r=>r.id).join(', ')}: đã đến hoặc quá ngày trả dự kiến nhưng chưa trả phòng. Chưa thể xác định lịch trống, kể cả ngày tương lai; các phòng này không được chọn để xác nhận đơn mới.`:'Một số phòng chưa thể xác định lịch trống vì khách đang ở chưa hoàn tất trả phòng. Vui lòng liên hệ khách sạn để kiểm tra; số phòng còn trống bên trên không bao gồm các phòng này.'}</p>;
}
