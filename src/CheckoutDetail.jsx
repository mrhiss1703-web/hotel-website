import React,{useState} from 'react';
import {today,dateText,roomTypes,nights,checkoutSummary,overlaps,stayStart,stayTime,localTime} from './data';

export function StayOutcome({booking:b}){
 if(!b.actualDeparture)return null;
 const summary=checkoutSummary(b,b.actualDeparture);
 return <div className="stay-outcome"><p>Thực tế nhận: {dateText(stayStart(b))} · {stayTime(b,'arrival')}<br/>Dự kiến trả: {dateText(b.departure)} · {b.departureTime||'12:00'} · {summary.plannedNights} đêm<br/><strong>Thực tế trả: {dateText(b.actualDeparture)} · {stayTime(b,'departure')} · {summary.actualNights} đêm</strong><br/>{summary.label}</p>{b.checkoutNote&&<p>Ghi chú trả phòng: {b.checkoutNote}</p>}</div>;
}

export default function CheckoutDetail({booking:b,bookings,onConfirm}){
 const [actual,setActual]=useState(today),[time,setTime]=useState(localTime),[note,setNote]=useState(''),[checked,setChecked]=useState(false),[error,setError]=useState('');
 const summary=checkoutSummary(b,actual);
 const conflicts=bookings.filter(x=>x.id!==b.id&&x.room===b.room&&['confirmed','staying'].includes(x.status)&&actual>b.departure&&overlaps(b.departure,actual,x.arrival,x.departure));
 return <><div className="detail-grid"><div><small>KHÁCH TRẢ PHÒNG</small><h3>{b.name}</h3><p>{b.phone}<br/>{b.email}</p></div><div><small>THÔNG TIN PHÒNG</small><h3>{b.room} · {roomTypes[b.type].name}</h3><p>Nhận phòng: {dateText(b.arrival)}<br/>Dự kiến trả: {dateText(b.departure)}<br/>{b.adults+b.children} khách · {b.id}</p></div></div>
 <form onSubmit={e=>{e.preventDefault();if(!actual||actual<stayStart(b)||actual>today){setError('Ngày trả thực tế phải từ ngày nhận phòng đến hôm nay.');return}if(`${actual}T${time}`<`${stayStart(b)}T${b.actualArrivalTime||'00:00'}`||`${actual}T${time}`>`${today}T${localTime()}`){setError('Giờ trả thực tế không được trước giờ nhận phòng hoặc sau thời điểm hiện tại.');return}if(actual!==b.departure&&!note.trim()){setError('Vui lòng ghi lý do trả sớm hoặc ở quá ngày dự kiến.');return}onConfirm({actualDeparture:actual,actualDepartureTime:time,checkoutNote:note.trim(),checkoutConflictIds:conflicts.map(x=>x.id)})}}>
 <div className="form-grid"><label>Ngày trả phòng thực tế<input type="date" required min={stayStart(b)} max={today} value={actual} onChange={e=>{setActual(e.target.value);setChecked(false);setError('')}}/></label><label>Giờ trả phòng thực tế<input type="time" required value={time} onChange={e=>{setTime(e.target.value);setChecked(false);setError('')}}/></label></div><p className="notice">Đã nhận: {dateText(stayStart(b))} lúc {stayTime(b,'arrival')} · Giờ Việt Nam (UTC+7).</p>
 <div className={`checkout-summary ${summary.difference>0?'late':summary.difference<0?'early':'ontime'}`}><strong>{summary.label}</strong><div><span>Theo lịch: {summary.plannedNights} đêm</span><span>Thực tế: {summary.actualNights} đêm</span></div>{actual===b.arrival&&<small>Nhận và trả trong cùng ngày · ghi nhận 0 đêm, không tự tính phí.</small>}</div>
 <label>{actual!==b.departure?'Lý do thay đổi ngày trả phòng':'Ghi chú trả phòng'}<textarea rows="3" required={actual!==b.departure} value={note} onChange={e=>{setNote(e.target.value);setChecked(false)}} placeholder="Ghi nhận nội dung đã trao đổi với khách…"/></label>
 {!!conflicts.length&&<p className="notice checkout-warning" role="status">Khách đã ở quá sang lịch của {conflicts.map(x=>`${x.id} (${x.name})`).join(', ')}. Ngày trả thực tế vẫn được ghi nhận; cần kiểm tra lại việc bố trí phòng cho các đơn này.</p>}
 <p className="notice">Giữ nguyên lịch đặt ban đầu và lưu riêng ngày trả thực tế, số đêm thực tế, lý do thay đổi vào lịch sử. Sau xác nhận, phòng chuyển sang Đang dọn.</p>
 {error&&<p role="alert" className="checkout-error">{error}</p>}
 <label className="checkout-confirm"><input type="checkbox" required checked={checked} onChange={e=>setChecked(e.target.checked)}/>Đã kiểm tra ngày trả thực tế và xác nhận khách đã trả phòng.</label><button className="primary wide">Xác nhận đã trả phòng</button></form></>;
}
