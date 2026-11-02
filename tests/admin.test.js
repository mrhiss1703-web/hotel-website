import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,today,addDays,localTime} from '../src/data.js';
import {actualStays,applyAction,bookingRows,checkinReason,customerRows,exportRows,operationalState,tasksForToday} from '../src/admin/model.js';
const context={date:today,time:'23:59'};
const profile={name:'Khách Kiểm Tra',phone:'0000012345',email:'',nationality:'Việt Nam',document:'DEMO12345',note:''};
const walkin={kind:'walkin',room:'A102',departure:addDays(today,1),adults:1,children:0,time:'10:00',profile,token:'test-walkin'};
test('cannot confirm A201 today or in the future while overdue; checkout and cleaning restore same-day turnover',()=>{
 const original=seed(),old=original.bookings.find(b=>b.room==='A201'&&b.status==='staying');
 let d={...original,bookings:[...original.bookings,{...original.bookings.find(b=>b.status==='pending'),id:'regression',type:1,arrival:today,departure:addDays(today,2)}]};
 assert.throws(()=>applyAction(d,{kind:'confirm',id:'regression',room:'A201'},context),/Cần xử lý khách đang ở/);
 const future={...d,bookings:d.bookings.map(b=>b.id==='regression'?{...b,arrival:addDays(today,30),departure:addDays(today,32)}:b)};
 assert.throws(()=>applyAction(future,{kind:'confirm',id:'regression',room:'A201'},context),/kể cả ngày tương lai/);
 const other=applyAction(d,{kind:'confirm',id:'regression',room:'A202'},context);assert.equal(other.bookings.find(b=>b.id==='regression').room,'A202');
 assert.equal(d.bookings.find(b=>b.id==='regression').status,'pending');
 d=applyAction(d,{kind:'checkout',id:old.id,details:{actualDeparture:today,actualDepartureTime:'11:00',checkoutNote:'Khách ở quá ngày và đã trả phòng.'}},context);
 d=applyAction(d,{kind:'confirm',id:'regression',room:'A201'},context);
 assert.match(checkinReason(d,d.bookings.find(b=>b.id==='regression')),/chưa trống/);
 d=applyAction(d,{kind:'operation',room:'A201',operation:'Sẵn sàng'},context);
 assert.equal(checkinReason(d,d.bookings.find(b=>b.id==='regression')),'');
 const guest=d.guests[12];d=applyAction(d,{kind:'checkin',id:'regression',time:'12:00',guestId:guest.id,profile:guest},context);
 assert.equal(d.bookings.find(b=>b.id===old.id).status,'completed');assert.equal(d.bookings.find(b=>b.id==='regression').status,'staying');
 assert.equal(d.bookings.find(b=>b.id===old.id).actualDeparture,d.bookings.find(b=>b.id==='regression').actualArrival);
});
test('today workgroups include only correct dates and separate overdue tasks',()=>{
 const d=seed(),t=tasksForToday(d);assert.equal(t.pending.length,4);assert.equal(t.arrivals.length,2);assert.equal(t.departures.length,1);assert.equal(t.cleaning.length,1);assert.equal(t.overdueArrival.length,1);assert.equal(t.overdueDeparture.length,1);
 assert.ok(t.arrivals.every(b=>b.arrival===today&&b.status==='confirmed'));
 const future=d.rooms.find(r=>r.id==='B501');assert.equal(operationalState(d,future).key,'ready');assert.ok(d.bookings.some(b=>b.room===future.id&&b.arrival>today&&b.status==='confirmed'));
});
test('confirmation checks fresh state, saves notes and respects adjacent dates',()=>{
 let d=seed(),b=d.bookings.find(b=>b.id==='YC1007');d=applyAction(d,{kind:'confirm',id:b.id,room:'A102',note:'Đã gọi khách'},context);assert.equal(d.bookings.find(x=>x.id===b.id).internal,'Đã gọi khách');
 assert.throws(()=>applyAction(d,{kind:'confirm',id:b.id,room:'A102'},context));
 d={...d,bookings:[...d.bookings,{...b,id:'overlap',status:'pending'},{...b,id:'adjacent',arrival:b.departure,departure:addDays(b.departure,2),status:'pending'}]};
 assert.throws(()=>applyAction(d,{kind:'confirm',id:'overlap',room:'A102'},context),/trùng lịch/);
 d=applyAction(d,{kind:'confirm',id:'adjacent',room:'A102'},context);assert.equal(d.bookings.find(b=>b.id==='adjacent').status,'confirmed');
});
test('pending does not hold inventory and rejected orders do not count as stays',()=>{
 let d=seed();assert.equal(actualStays(d,'KH004').length,0);assert.equal(actualStays(d,'KH001').length,2);assert.equal(actualStays(d,'KH015').length,1);
 d=applyAction(d,{kind:'reject',id:'YC1007',note:'Đã trao đổi'},context);assert.equal(d.bookings.find(b=>b.id==='YC1007').status,'rejected');assert.throws(()=>applyAction(d,{kind:'reject',id:'YC1007'},context));
});
test('same checkin/checkout transitions preserve actual times and return room to cleaning',()=>{
 let d=seed(),b=d.bookings.find(b=>b.id==='YC1004'),guest=d.guests.find(g=>g.id===b.guestId);const count=d.guests.length;
 d=applyAction(d,{kind:'checkin',id:b.id,guestId:guest.id,profile:guest,time:'10:00'},context);assert.equal(d.guests.length,count);assert.equal(actualStays(d,guest.id).length,1);
 assert.equal(d.bookings.find(x=>x.id===b.id).actualArrivalTime,'10:00');assert.throws(()=>applyAction(d,{kind:'checkin',id:b.id,profile:guest,time:'10:00'},context));
 assert.throws(()=>applyAction(d,{kind:'operation',room:b.room,operation:'Sẵn sàng'},context),/đang có khách/);
 const details={actualDeparture:today,actualDepartureTime:'11:00',checkoutNote:'Khách trả sớm'};
 assert.throws(()=>applyAction(d,{kind:'checkout',id:b.id,details:{...details,actualDepartureTime:'09:00'}},context),/Giờ trả/);
 d=applyAction(d,{kind:'checkout',id:b.id,details},context);assert.equal(d.rooms.find(r=>r.id===b.room).operation,'Đang dọn');assert.equal(d.bookings.find(x=>x.id===b.id).departure,b.departure);assert.equal(d.bookings.find(x=>x.id===b.id).actualDepartureTime,'11:00');
 assert.throws(()=>applyAction(d,{kind:'checkout',id:b.id,details},context));d=applyAction(d,{kind:'operation',room:b.room,operation:'Sẵn sàng'},context);assert.equal(operationalState(d,d.rooms.find(r=>r.id===b.room)).key,'ready');
});
test('early arrival, cleaning, maintenance, capacity and schedule collisions are blocked',()=>{
 const d=seed(),b=d.bookings.find(b=>b.id==='YC1005'),g=d.guests.find(g=>g.id===b.guestId);
 assert.match(checkinReason(d,b),/Chưa đến/);assert.throws(()=>applyAction(d,{kind:'checkin',id:b.id,profile:g,time:'10:00'},context),/Chưa đến/);
 for(const room of ['A101','B403','B503'])assert.throws(()=>applyAction(d,{...walkin,room},context));
 assert.throws(()=>applyAction(d,{...walkin,adults:3},context),/tối đa/);
 const collision={...d,bookings:[...d.bookings,{id:'future',status:'confirmed',room:'A102',type:0,arrival:today,departure:addDays(today,3)}]};assert.throws(()=>applyAction(collision,walkin,context),/trùng lịch/);
});
test('walkin tokens prevent duplicates and old guest selection reuses one profile',()=>{
 let d=seed(),g=d.guests[12];const count=d.guests.length;d=applyAction(d,{...walkin,guestId:g.id,profile:g},context);assert.equal(d.guests.length,count);assert.equal(actualStays(d,g.id).length,2);assert.throws(()=>applyAction(d,{...walkin,guestId:g.id,profile:g},context));
});
test('blank or shared email does not merge different people; explicit phone conflicts require checking',()=>{
 let d=seed();d.guests[0].email='';const original=d.guests.length;d=applyAction(d,walkin,context);assert.equal(d.guests.length,original+1);
 assert.throws(()=>applyAction(seed(),{...walkin,profile:{...profile,phone:seed().guests[0].phone}},context),/hồ sơ khác/);
});
test('customer and history export scopes match each selected dataset and filters',()=>{
 const d=seed(),profiles=exportRows(d,'profiles','all'),history=exportRows(d,'history','all');assert.equal(profiles.length,15);assert.equal(history.length,11);
 assert.ok(history.every(r=>['Đang ở','Đã trả phòng'].includes(r['Trạng thái'])));assert.ok(profiles.every(r=>r['Giấy tờ (đã che)'].startsWith('••••')));
 const filter={search:'KH004'};assert.equal(exportRows(d,'profiles','filtered',filter).length,1);assert.equal(exportRows(d,'history','filtered',filter).length,0);assert.equal(exportRows(d,'profiles','all',filter).length,15);
 assert.equal(customerRows(d,{returning:true}).length,3);assert.equal(customerRows(d,{state:'staying'}).length,3);assert.equal(bookingRows(d,{status:'confirmed',from:today,to:today}).length,2);
 assert.equal(exportRows(d,'profiles','filtered',{from:addDays(today,2),to:today}).length,0);
 assert.equal(customerRows(d,{state:'staying',from:today,to:today}).length,3);
});
