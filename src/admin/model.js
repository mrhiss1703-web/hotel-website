import {addDays,availableRooms,checkoutSummary,localTime,nights,overlaps,roomTypes,stayEnd,stayStart,stayTime,today,unresolvedStayRooms} from '../data.js';

export const statusLabels={pending:'Chờ duyệt',confirmed:'Đã xác nhận',staying:'Đang ở',completed:'Đã trả phòng',rejected:'Đã từ chối'};
export const actualStays=(data,id)=>data.bookings.filter(b=>b.guestId===id&&['staying','completed'].includes(b.status));
const endForFilter=b=>b.status==='staying'&&stayEnd(b)<today?today:stayEnd(b);
export const maskDocument=value=>value?(value.length>4?'••••'+value.slice(-4):'••••'):'Chưa ghi nhận';
export function operationalState(data,room){
 if(data.bookings.some(b=>b.room===room.id&&b.status==='staying'))return {key:'occupied',label:'Đang có khách'};
 if(room.operation==='Đang dọn')return {key:'cleaning',label:'Đang dọn'};
 if(room.operation==='Bảo trì')return {key:'maintenance',label:'Bảo trì'};
 return {key:'ready',label:'Trống, sẵn sàng'};
}
export function tasksForToday(data,date=today){return {
 pending:data.bookings.filter(b=>b.status==='pending'),
 arrivals:data.bookings.filter(b=>b.status==='confirmed'&&b.arrival===date),
 departures:data.bookings.filter(b=>b.status==='staying'&&b.departure===date),
 cleaning:data.rooms.filter(r=>operationalState(data,r).key==='cleaning'),
 overdueArrival:data.bookings.filter(b=>b.status==='confirmed'&&b.arrival<date),
 overdueDeparture:data.bookings.filter(b=>b.status==='staying'&&b.departure<date)
}}
export function bookingRows(data,f={}){if(f.from&&f.to&&f.from>f.to)return [];return data.bookings.filter(b=>(!f.status||b.status===f.status)&&(!f.search||`${b.id} ${b.name} ${b.phone}`.toLowerCase().includes(f.search.toLowerCase()))&&(!f.from||b.arrival>=f.from)&&(!f.to||b.arrival<=f.to)&&(!f.due||b.departure===f.due)).sort((a,b)=>b.created.localeCompare(a.created)||b.id.localeCompare(a.id))}
export function customerRows(data,f={}){if(f.from&&f.to&&f.from>f.to)return [];return data.guests.filter(g=>{
 const s=actualStays(data,g.id),active=s.some(b=>b.status==='staying');
 return (!f.search||`${g.id} ${g.name} ${g.phone}`.toLowerCase().includes(f.search.toLowerCase()))&&(!f.state||(f.state==='staying'?active:s.length>0))&&(!f.returning||s.length>=2)&&(!f.from&&!f.to||s.some(b=>(!f.from||endForFilter(b)>=f.from)&&(!f.to||stayStart(b)<=f.to)));
}).sort((a,b)=>{const latest=g=>actualStays(data,g.id).map(b=>`${stayStart(b)} ${stayTime(b,'arrival')}`).sort().at(-1)||'';return latest(b).localeCompare(latest(a))||a.name.localeCompare(b.name,'vi')})}
export function historyRows(data,guests,f={}){const ids=new Set(guests.map(g=>g.id));return data.bookings.filter(b=>ids.has(b.guestId)&&['staying','completed'].includes(b.status)&&(!f.from||endForFilter(b)>=f.from)&&(!f.to||stayStart(b)<=f.to)).sort((a,b)=>stayStart(b).localeCompare(stayStart(a))||a.id.localeCompare(b.id))}
export function exportRows(data,kind,scope,filters={}){
 const guests=scope==='all'?data.guests:customerRows(data,filters);
 if(kind==='profiles')return guests.map(g=>{const s=actualStays(data,g.id);return {'Mã khách':g.id,'Họ tên':g.name,'Điện thoại':g.phone,'Email':g.email||'','Quốc tịch':g.nationality||'','Giấy tờ (đã che)':maskDocument(g.document),'Số lần đã ở':s.length,'Đang ở':s.some(b=>b.status==='staying')?'Có':'Không','Nhận phòng gần nhất':s.map(b=>stayStart(b)).sort().at(-1)||'','Ghi chú':g.note||''}});
 return historyRows(data,guests,scope==='all'?{}:filters).map(b=>{const g=data.guests.find(g=>g.id===b.guestId);return {'Mã đơn':b.id,'Mã khách':g.id,'Họ tên':g.name,'Điện thoại':g.phone,'Giấy tờ (đã che)':maskDocument(g.document),'Phòng':b.room,'Ngày nhận thực tế':stayStart(b),'Giờ nhận thực tế':stayTime(b,'arrival'),'Ngày trả thực tế':b.actualDeparture||'','Giờ trả thực tế':b.actualDepartureTime||'','Ngày nhận dự kiến':b.arrival,'Ngày trả dự kiến':b.departure,'Giờ trả dự kiến':b.departureTime||'12:00','Trạng thái':statusLabels[b.status],'Số đêm thực tế':b.status==='completed'?(b.actualNights??nights(stayStart(b),stayEnd(b))):'','Ghi chú trả phòng':b.checkoutNote||''}});
}
const requireThat=(condition,message)=>{if(!condition)throw new Error(message)};
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const validTime=value=>/^\d{2}:\d{2}$/.test(value||'')&&+value.slice(0,2)<24&&+value.slice(3)<60;
const nextCode=(prefix,rows)=>prefix+String(Math.max(0,...rows.map(r=>new RegExp(`^${prefix}(\\d+)$`).exec(r.id)?.[1]||0))+1).padStart(3,'0');
function validatePeople(type,adults,children){requireThat(Number.isInteger(+adults)&&+adults>=1&&Number.isInteger(+children)&&+children>=0,'Số người lớn và trẻ em chưa hợp lệ.');requireThat(+adults+(+children)<=roomTypes[type].capacity,`Phòng chỉ phục vụ tối đa ${roomTypes[type].capacity} khách.`)}
export function checkinReason(data,b,date=today){
 if(b.status!=='confirmed')return 'Chỉ nhận phòng từ đơn đã xác nhận.';
 if(b.arrival>date)return `Chưa đến ngày nhận phòng (${b.arrival.split('-').reverse().join('/')}).`;
 if(b.departure<=date)return 'Đơn đã quá cả ngày trả dự kiến. Cần trao đổi lại với khách trước khi nhận khách trực tiếp với lịch mới.';
 const r=data.rooms.find(r=>r.id===b.room);
 if(!r)return 'Đơn chưa được phân phòng.';
 if(operationalState(data,r).key!=='ready')return 'Phòng chưa trống, sẵn sàng. Hãy kiểm tra khách đang ở, dọn phòng hoặc bảo trì.';
 if(!availableRooms(data.rooms,data.bookings,b.type,date,b.departure,b.id,date).some(r=>r.id===b.room))return 'Lịch nhận phòng đang trùng một đơn khác.';
 return '';
}
function upsertGuest(data,profile,selectedId){
 const clean={name:profile.name?.trim(),phone:profile.phone?.trim(),email:profile.email?.trim()||'',nationality:profile.nationality?.trim()||'Việt Nam',documentType:profile.documentType||'CCCD demo',document:profile.document?.trim()||'',note:profile.note?.trim()||''};
 requireThat(clean.name?.length>=2,'Vui lòng nhập họ tên khách.');requireThat(/^[+\d ()-]{8,16}$/.test(clean.phone||''),'Vui lòng nhập số điện thoại hợp lệ.');
 const phoneKey=v=>(v||'').replace(/[^\d+]/g,'');
 let guest=selectedId?data.guests.find(g=>g.id===selectedId):null;
 if(selectedId)requireThat(guest,'Không tìm thấy hồ sơ khách đã chọn.');
 const samePhone=data.guests.filter(g=>phoneKey(g.phone)&&phoneKey(g.phone)===phoneKey(clean.phone));
 if(!guest&&samePhone.length){requireThat(samePhone.length===1,'Nhiều hồ sơ dùng số này. Vui lòng tìm và chọn khách cũ.');guest=samePhone[0];requireThat(guest.name.trim().toLocaleLowerCase('vi')===clean.name.toLocaleLowerCase('vi'),'Số điện thoại đã có trong hồ sơ khác. Hãy chọn khách cũ hoặc kiểm tra lại số.');}
 if(guest)requireThat(!samePhone.some(g=>g.id!==guest.id),'Số điện thoại thuộc một hồ sơ khách khác.');
 const saved={...guest,...clean,id:guest?.id||nextCode('KH',data.guests)};
 return {guest:saved,guests:guest?data.guests.map(g=>g.id===saved.id?saved:g):[...data.guests,saved]};
}
// Pure state transitions: every entry point calls this same function with fresh state.
export function applyAction(data,action,{date=today,time=localTime(),checkin='14:00',checkout='12:00'}={}){
 const b=data.bookings.find(b=>b.id===action.id);
 const replace=(patch)=>({...data,bookings:data.bookings.map(x=>x.id===b.id?{...x,...patch}:x)});
 if(['confirm','reject','note','checkin','checkout'].includes(action.kind))requireThat(b,'Không tìm thấy đơn.');
 if(action.kind==='confirm'){
 requireThat(b.status==='pending','Đơn này đã được xử lý.');
 requireThat(validDate(b.arrival)&&validDate(b.departure)&&b.arrival<b.departure&&b.departure>date,'Khoảng ngày của đơn không còn hợp lệ.');validatePeople(b.type,b.adults,b.children);
 requireThat(!unresolvedStayRooms(data.rooms,data.bookings,b.type,b.arrival,b.departure,b.id,date).some(r=>r.id===action.room),'Cần xử lý khách đang ở chưa trả phòng trước khi xác nhận lịch mới cho phòng này, kể cả ngày tương lai.');
 requireThat(availableRooms(data.rooms,data.bookings,b.type,b.arrival,b.departure,b.id,date).some(r=>r.id===action.room),'Phòng không phù hợp hoặc trùng lịch. Vui lòng chọn phòng khác.');
 return replace({room:action.room,status:'confirmed',internal:action.note||'',arrivalTime:b.arrivalTime||checkin,departureTime:b.departureTime||checkout});
 }
 if(action.kind==='reject'){requireThat(b.status==='pending','Đơn này đã được xử lý.');return replace({status:'rejected',internal:action.note||''})}
 if(action.kind==='note')return replace({internal:action.note||''});
 if(action.kind==='checkin'||action.kind==='walkin'){
 const arrival=action.kind==='walkin'?date:b.arrival,departure=action.kind==='walkin'?action.departure:b.departure;
 const r=data.rooms.find(r=>r.id===(action.kind==='walkin'?action.room:b.room));
 requireThat(r,'Vui lòng chọn phòng cụ thể.');
 if(action.kind==='checkin'){const reason=checkinReason(data,b,date);requireThat(!reason,reason)}
 else {requireThat(!action.token||!data.bookings.some(x=>x.operationToken===action.token),'Lượt nhận khách này đã được lưu.');requireThat(validDate(departure)&&departure>date,'Ngày trả phải sau hôm nay.');requireThat(operationalState(data,r).key==='ready','Phòng chưa trống, sẵn sàng.');requireThat(availableRooms(data.rooms,data.bookings,r.type,date,departure,undefined,date).some(x=>x.id===r.id),'Phòng trùng lịch đặt trong khoảng ngày này.');}
 validatePeople(r.type,action.adults??b?.adults,action.children??b?.children);
 requireThat(validTime(action.time)&&action.time<=time,'Giờ nhận phòng chưa hợp lệ hoặc sau thời điểm hiện tại.');
 const {guest,guests}=upsertGuest(data,action.profile,action.guestId!==undefined?action.guestId:b?.guestId);
 const actual={guestId:guest.id,name:guest.name,phone:guest.phone,email:guest.email,status:'staying',actualArrival:date,actualArrivalTime:action.time,adults:+(action.adults??b?.adults),children:+(action.children??b?.children),arrivalTime:b?.arrivalTime||checkin,departureTime:b?.departureTime||checkout};
 return {...data,guests,bookings:action.kind==='checkin'?data.bookings.map(x=>x.id===b.id?{...x,...actual}:x):[{id:nextCode('YC',data.bookings),type:r.type,room:r.id,arrival,departure,created:date,internal:'Khách trực tiếp',note:'',operationToken:action.token,...actual},...data.bookings]};
 }
 if(action.kind==='checkout'){
 requireThat(b.status==='staying','Đơn này không còn ở trạng thái Đang ở.');const v=action.details;
 requireThat(validDate(v.actualDeparture)&&v.actualDeparture>=stayStart(b)&&v.actualDeparture<=date,'Ngày trả thực tế không hợp lệ.');
 requireThat(validTime(v.actualDepartureTime)&&`${v.actualDeparture}T${v.actualDepartureTime}`>=`${stayStart(b)}T${b.actualArrivalTime||'00:00'}`&&`${v.actualDeparture}T${v.actualDepartureTime}`<=`${date}T${time}`,'Giờ trả thực tế không được trước giờ nhận hoặc sau hiện tại.');
 requireThat(v.actualDeparture===b.departure||v.checkoutNote?.trim(),'Vui lòng ghi lý do trả sớm hoặc ở quá ngày.');
 const next=replace({status:'completed',actualDeparture:v.actualDeparture,actualDepartureTime:v.actualDepartureTime,checkoutNote:v.checkoutNote||'',checkoutConflictIds:v.checkoutConflictIds||[],actualNights:checkoutSummary(b,v.actualDeparture).actualNights,checkoutRecordedAt:new Date().toISOString()});
 return {...next,rooms:data.rooms.map(r=>r.id===b.room?{...r,operation:'Đang dọn'}:r)};
 }
 if(action.kind==='operation'){
 const r=data.rooms.find(r=>r.id===action.room);requireThat(r,'Không tìm thấy phòng.');
 requireThat(!data.bookings.some(x=>x.room===r.id&&x.status==='staying'),'Không thể đổi tình trạng khi phòng đang có khách.');
 requireThat(['Sẵn sàng','Bảo trì'].includes(action.operation),'Thao tác chưa hợp lệ.');
 if(action.operation==='Bảo trì')requireThat(r.operation!=='Bảo trì','Phòng đã được chuyển bảo trì.');
 if(action.operation==='Sẵn sàng')requireThat(['Đang dọn','Bảo trì'].includes(r.operation),'Phòng đã sẵn sàng.');
 return {...data,rooms:data.rooms.map(x=>x.id===r.id?{...x,operation:action.operation}:x)};
 }
 throw new Error('Thao tác không được hỗ trợ.');
}
