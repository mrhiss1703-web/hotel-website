import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,availableRooms,overlaps,today,addDays,nights} from '../src/data.js';
import {checkoutSummary,stayEnd} from '../src/data.js';
import {completedStays} from '../src/data.js';
import {unresolvedStayRooms} from '../src/data.js';
test('A201 overdue staying and A101 checkout-day staying remain unavailable until explicit checkout',()=>{
 const d=seed();const b=d.bookings.find(b=>b.room==='A201'&&b.status==='staying');assert.ok(b.departure<today);
 for(const start of [today,addDays(today,1),addDays(today,30)]){
 const end=addDays(start,2);
 assert.ok(!availableRooms(d.rooms,d.bookings,1,start,end).some(r=>r.id==='A201'));
 assert.ok(unresolvedStayRooms(d.rooms,d.bookings,1,start,end).some(r=>r.id==='A201'));
 assert.ok(availableRooms(d.rooms,d.bookings,1,start,end).some(r=>r.id==='A202'));
 }
 assert.ok(!availableRooms(d.rooms,d.bookings,0,today,addDays(today,1)).some(r=>r.id==='A101'));
 // Not-yet-due stays still follow the ordinary half-open planned interval.
 const regular=d.bookings.find(b=>b.room==='A301'&&b.status==='staying');
 assert.ok(availableRooms(d.rooms,d.bookings,2,regular.departure,addDays(regular.departure,1)).some(r=>r.id==='A301'));
 // Only the actual staying state makes an expired scheduled interval open-ended.
 for(const status of ['pending','rejected','confirmed','completed']){
 const bookings=d.bookings.map(x=>x.id===b.id?{...x,status}:x);
 assert.ok(availableRooms(d.rooms,bookings,1,today,addDays(today,1)).some(r=>r.id==='A201'));
 assert.ok(!unresolvedStayRooms(d.rooms,bookings,1,today,addDays(today,1)).some(r=>r.id==='A201'));
 }
});
test('completed history excludes active stays and sorts actual dates and hours',()=>{
 const guest={id:'G',name:'Khách A',phone:'0000'},other={id:'H',name:'Khách B',phone:'1111'};
 const base={guestId:'G',room:'A1',status:'completed',arrival:'2026-10-30',departure:'2026-11-02',actualDeparture:'2026-11-01'};
 const data={guests:[guest,other],bookings:[{...base,id:'early',actualDepartureTime:'09:00'},{...base,id:'late',actualDepartureTime:'16:00'},{...base,id:'active',status:'staying'},{...base,id:'pending',status:'confirmed'},{...base,id:'other',guestId:'H',actualDeparture:'2026-10-31',actualDepartureTime:'12:00'}]};
 assert.deepEqual(completedStays(data).map(b=>b.id),['late','early','other']);
 assert.deepEqual(completedStays(data,{sort:'departureAsc'}).map(b=>b.id),['other','early','late']);
 assert.equal(completedStays(data,{returning:true}).length,2);
 assert.equal(completedStays(data,{from:'2026-11-02'}).length,0);
 assert.equal(completedStays(data,{search:'1111'}).length,1);
});
test('actual checkout keeps planned dates and calculates early, late and same-day stays',()=>{
 const b={arrival:'2026-11-01',departure:'2026-11-05'};
 assert.deepEqual(checkoutSummary(b,'2026-11-03'),{plannedNights:4,actualNights:2,difference:-2,label:'Trả sớm 2 đêm so với dự kiến'});
 assert.equal(checkoutSummary(b,'2026-11-07').difference,2);
 assert.equal(checkoutSummary(b,'2026-11-01').actualNights,0);
 assert.equal(checkoutSummary(b,'2026-11-05').difference,0);
 assert.equal(stayEnd({...b,actualDeparture:'2026-11-03'}),'2026-11-03');
 assert.equal(b.departure,'2026-11-05');
 assert.deepEqual(checkoutSummary({...b,actualArrival:'2026-11-03'},'2026-11-05'),{plannedNights:4,actualNights:2,difference:0,label:'Trả đúng ngày dự kiến'});
});
test('seed has separate guest profiles, repeat stays and valid room assignments',()=>{const d=seed();assert.equal(d.guests.length,15);assert.equal(new Set(d.guests.map(g=>g.id)).size,15);assert.ok(d.bookings.filter(b=>b.guestId===d.guests[0].id).length>1);for(const b of d.bookings.filter(b=>b.room)){assert.equal(d.rooms.find(r=>r.id===b.room).type,b.type)}for(const b of d.bookings.filter(b=>['confirmed','staying'].includes(b.status))){assert.ok(!d.bookings.some(x=>x.id!==b.id&&x.room===b.room&&['confirmed','staying'].includes(x.status)&&overlaps(x.arrival,x.departure,b.arrival,b.departure)))}});
test('availability respects dates, individual inventory and pending requests',()=>{const d=seed();assert.equal(availableRooms(d.rooms,d.bookings,5,today,addDays(today,2)).length,0);assert.equal(availableRooms(d.rooms,d.bookings,5,addDays(today,3),addDays(today,5)).length,1);assert.equal(availableRooms(d.rooms,d.bookings,0,today,addDays(today,2)).length,1);const before=availableRooms(d.rooms,d.bookings,0,today,addDays(today,2)).length;d.bookings.push({id:'pending-test',room:'A102',type:0,arrival:today,departure:addDays(today,2),status:'pending'});assert.equal(availableRooms(d.rooms,d.bookings,0,today,addDays(today,2)).length,before)});
test('adjacent reservations can share a room and stay durations are correct',()=>{assert.equal(overlaps('2026-11-01','2026-11-03','2026-11-03','2026-11-06'),false);assert.equal(nights('2026-11-01','2026-11-04'),3)});
