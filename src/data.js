export const hotelDefault = {name:'SkillLink Phú Quốc Hotel & Resort', address:'Bãi Trường, Dương Tơ, Phú Quốc, Việt Nam', phone:'0000000000', zalo:'0000000000', email:'hello@skilllink.example', checkin:'14:00', checkout:'12:00', facebook:'https://facebook.example/skilllink', instagram:'https://instagram.example/skilllink'};
export const photoSources = {hero:'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=3200&q=95', pool:'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85', beach:'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1400&q=85', dining:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85', spa:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85'};
export const photos = Object.fromEntries(Object.keys(photoSources).map(key=>[key,key==='hero'?'/images/hero-new.jpg':`/images/${key}.jpg`]));
export const roomTypes = [
 ['Deluxe Garden View',42,2,'1 giường King',2400000,'photo-1611892440504-42a792e24d32','Ban công riêng mở ra khu vườn nhiệt đới, nơi mỗi buổi sáng bắt đầu thật dịu dàng.'],
 ['Deluxe Ocean View',45,2,'1 King hoặc 2 giường đơn',2900000,'photo-1590490360182-c33d57733427','Đón gió biển và ánh nắng trong không gian ấm áp với tầm nhìn hướng đại dương.'],
 ['Premier Sea View',52,3,'1 giường King',3500000,'photo-1566665797739-1674de7a421a','Tầm nhìn khoáng đạt, bồn tắm thư giãn và những chi tiết chăm chút cho kỳ nghỉ riêng tư.'],
 ['Family Suite',78,4,'1 King & 2 giường đơn',4800000,'photo-1560448204-e02f11c3d0e2','Không gian rộng rãi với hai khu vực nghỉ ngơi, dành cho những khoảnh khắc bên gia đình.'],
 ['Ocean Suite',90,3,'1 giường King',6200000,'photo-1578683010236-d716f9a3f461','Phòng khách riêng và ban công hướng biển, cho một kỳ nghỉ chậm rãi và trọn vẹn.'],
 ['Beachfront Villa',160,6,'2 giường King & 2 giường đơn',12500000,'photo-1613977257363-707ba9348227','Biệt thự sát biển với hồ bơi riêng, khu vườn yên tĩnh và không gian dành riêng cho bạn.']
].map((r,i)=>({id:i,name:r[0],size:r[1],capacity:r[2],bed:r[3],price:r[4],image:`/images/room-${i}.jpg`,sourceImage:`https://images.unsplash.com/${r[5]}?auto=format&fit=crop&w=1000&q=85`,description:r[6]}));
export const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function addDays(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export const money=n=>new Intl.NumberFormat('vi-VN').format(n)+' VNĐ';
export const dateText=d=>d.split('-').reverse().join('/');
export const nights=(a,b)=>Math.max(0,Math.round((new Date(b)-new Date(a))/86400000));
export const overlaps=(a,b,c,d)=>a<d&&b>c;
export const stayEnd=b=>b.actualDeparture||b.departure;
export const stayStart=b=>b.actualArrival||b.arrival;
export const localTime=()=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
export const stayTime=(b,kind)=>kind==='arrival'?(b.actualArrivalTime||b.arrivalTime||'Chưa ghi nhận giờ'):(b.actualDepartureTime||b.departureTime||'Chưa ghi nhận giờ');
export function completedStays(data,{search='',from='',to='',returning=false,sort='departureDesc'}={}){
 const completed=data.bookings.filter(b=>b.status==='completed');
 const rows=completed.map(b=>({...b,guest:data.guests.find(g=>g.id===b.guestId)})).filter(b=>b.guest&&(`${b.guest.name} ${b.guest.phone} ${b.guest.id} ${b.room} ${b.id}`).toLowerCase().includes(search.toLowerCase())&&(!from||stayEnd(b)>=from)&&(!to||stayStart(b)<=to)&&(!returning||completed.filter(x=>x.guestId===b.guestId).length>1));
 const start=sort.startsWith('arrival'),asc=sort.endsWith('Asc');
 const key=b=>`${start?stayStart(b):stayEnd(b)}T${stayTime(b,start?'arrival':'departure')}`;
 return rows.sort((a,b)=>(asc?1:-1)*key(a).localeCompare(key(b))||a.id.localeCompare(b.id));
}
export function checkoutSummary(booking,actual){
 const plannedNights=nights(booking.arrival,booking.departure),actualNights=actual?nights(stayStart(booking),actual):0;
 const difference=actual?Math.round((new Date(actual)-new Date(booking.departure))/86400000):0;
 return {plannedNights,actualNights,difference,label:difference>0?`Ở quá ${difference} đêm so với dự kiến`:difference<0?`Trả sớm ${Math.abs(difference)} đêm so với dự kiến`:'Trả đúng ngày dự kiến'};
}
export const labels={pending:'Chờ duyệt',confirmed:'Đã xác nhận',rejected:'Đã từ chối',staying:'Đang lưu trú',completed:'Đã trả phòng'};
export function seed(){
 const names=['Nguyễn An Nhiên','Trần Minh Anh','Lê Hoàng Nam','Phạm Ngọc Lan','Đỗ Quang Huy','Vũ Thanh Hà','Bùi Gia Bảo','Đặng Thu Trang','Ngô Minh Châu','Hoàng Đức Anh','Dương Bảo Ngọc','Đinh Nhật Linh','Mai Khánh An','Lý Tuấn Kiệt','Tạ Hương Giang'];
 const guests=names.map((name,i)=>({id:`KH${String(i+1).padStart(3,'0')}`,name,phone:`000000${String(i+1).padStart(4,'0')}`,email:`guest${i+1}@skilllink.example`,nationality:'Việt Nam',documentType:'CCCD demo',document:`DEMO${String(i+1).padStart(8,'0')}`,note:i<3?'Ưu tiên phòng yên tĩnh.':''}));
 const rooms=roomTypes.flatMap((t,i)=>Array.from({length:i===5?1:3},(_,j)=>({id:`${i<3?'A':'B'}${i+1}0${j+1}`,type:i,area:i<3?'Khu A':'Khu B',operation:i===4&&j===2?'Bảo trì':i===3&&j===2?'Đang dọn':'Sẵn sàng'})));
 const bookings=guests.map((g,i)=>({id:`YC${1001+i}`,guestId:g.id,name:g.name,phone:g.phone,email:g.email,type:i%6,room:i<6?rooms.find(r=>r.type===i%6).id:null,arrival:addDays(today,i<3?-1:i<6?0:i<10?2:-15),departure:addDays(today,i<3?2:i<6?3:i<10?5:-12),adults:2,children:0,created:today,status:i<3?'staying':i<6?'confirmed':i<10?'pending':'completed',note:'',internal:''}));
 bookings.push(...guests.slice(0,3).map((g,i)=>({id:`YC090${i}`,guestId:g.id,name:g.name,phone:g.phone,email:g.email,type:0,room:'A101',arrival:addDays(today,-40-i*5),departure:addDays(today,-37-i*5),adults:2,children:0,created:addDays(today,-45),status:'completed',note:'',internal:''})));
 bookings.find(b=>b.id==='YC1001').departure=today;
 Object.assign(bookings.find(b=>b.id==='YC1002'),{arrival:addDays(today,-3),departure:addDays(today,-1)});
 Object.assign(bookings.find(b=>b.id==='YC1005'),{arrival:addDays(today,5),departure:addDays(today,8)});
 bookings.push({id:'YC1020',guestId:guests[9].id,name:guests[9].name,phone:guests[9].phone,email:guests[9].email,type:0,room:'A103',arrival:addDays(today,-1),departure:addDays(today,2),adults:2,children:0,created:addDays(today,-4),status:'confirmed',note:'Khách chưa đến theo lịch.',internal:''});
 bookings.push({id:'YC1021',guestId:guests[14].id,name:guests[14].name,phone:guests[14].phone,email:guests[14].email,type:2,room:null,arrival:addDays(today,4),departure:addDays(today,6),adults:2,children:0,created:today,status:'rejected',note:'',internal:'Không còn phòng phù hợp theo yêu cầu.'});
 for(const b of bookings){b.arrivalTime='14:00';b.departureTime='12:00';if(['staying','completed'].includes(b.status)){b.actualArrival=b.arrival;b.actualArrivalTime='14:15'}if(b.status==='completed'){b.room=b.room||rooms.find(r=>r.type===b.type).id;b.actualDeparture=b.departure;b.actualDepartureTime='11:45';b.actualNights=nights(b.arrival,b.departure)}}
 return {guests,rooms,bookings};
}
// A stay is open-ended once its scheduled checkout day arrives. Only an explicit
// checkout releases it; a future calendar search must not invent a release date.
export function unresolvedStayRooms(rooms,bookings,type,arrival,departure,exclude,asOf=today){
 return rooms.filter(r=>(type==null||r.type===Number(type))&&bookings.some(b=>b.id!==exclude&&b.room===r.id&&b.status==='staying'&&b.departure<=asOf&&departure>stayStart(b)));
}
export function availableRooms(rooms,bookings,type,arrival,departure,exclude,asOf=today){
 const uncertain=new Set(unresolvedStayRooms(rooms,bookings,type,arrival,departure,exclude,asOf).map(r=>r.id));
 return rooms.filter(r=>r.type===Number(type)&&r.operation!=='Bảo trì'&&!uncertain.has(r.id)&&!bookings.some(b=>b.id!==exclude&&b.room===r.id&&['confirmed','staying'].includes(b.status)&&overlaps(arrival,departure,b.arrival,b.departure)));
}
