// 수업용 시간표이며 실제 운행·예약 정보와 연결되지 않습니다.
const stationFares={부산:{서울:54400,대전:33100,동대구:15600,울산:7500,경주:10100,밀양:7500},구포:{서울:49200,대전:31100,동대구:9700,밀양:7500}};
function trainDefaults(){
 if(state.origin)return;
 const day=new Date();const local=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 state.origin='부산';state.departDate=local(day);day.setDate(day.getDate()+1);state.returnDate=local(day);
 state.departHour='09';state.returnHour='17';state.trip='편도';state.room='일반실';state.direct='직통';state.direction='무관';state.position='무관';state.leg=0;state.trains=[];state.seats=[];
}
function trainFare(){trainDefaults();const base=stationFares[state.origin][state.destination]||0;const room=state.room==='특실'?Math.round(base*.4/100)*100:0;return (Math.round(base*(state.child?.5:1)/100)*100+room)*state.count*(state.trip==='왕복'?2:1);}
function trainRoute(){return state.origin==='구포'||state.destination==='밀양'?'구포 경유':'경주 경유';}
function trainSummary(){return `${state.origin} → ${state.destination} · ${state.trip} · ${state.child?'소아':'어른'} ${state.count}명 · ${state.room}`;}
function trainOptions(key,values){return `<div class="options">${values.map(v=>`<button class="option ${state[key]===v?'selected':''}" data-rail-key="${key}" data-rail-value="${v}">${v}</button>`).join('')}</div>`;}
function trainDate(key,hour,label){return `<div class="panel"><h2>${label}</h2><div class="rail-date"><input aria-label="${label} 날짜" type="date" data-rail-input="${key}" value="${state[key]}"><select aria-label="${label} 조회 시간" data-rail-input="${hour}">${Array.from({length:20},(_,i)=>String(i+4).padStart(2,'0')).map(h=>`<option ${state[hour]===h?'selected':''}>${h}</option>`).join('')}</select><span>시 이후</span></div></div>`;}
function railDuration(){return ({서울:state.origin==='구포'?175:165,대전:100,동대구:55,울산:22,경주:35,밀양:40})[state.destination];}
function railTime(minutes){return `${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
function railArrival(){const t=state.trains[0];return new Date(`${state.departDate}T${t.time}:00`).getTime()+railDuration()*60000;}
function railRows(){const h=+(state.leg?state.returnHour:state.departHour);return Array.from({length:5},(_,i)=>{const min=h*60+i*40+10;return {id:101+state.leg*100+i*2,time:railTime(min),arrival:railTime(min+railDuration()),sold:i===1,minute:min};}).filter(t=>t.minute+railDuration()<1440&&(!state.leg||new Date(`${state.returnDate}T${t.time}:00`).getTime()>railArrival()));}
function train(){
 trainDefaults();
 if(state.stage==='rail-list'){
 const rows=railRows();const returning=state.leg===1;
 wrap(`<div class="step">여정 조회 &gt; ${returning?'복편':'왕편'} 열차 선택</div><div class="panel"><h2>${returning?state.destination+' → '+state.origin:state.origin+' → '+state.destination}</h2><p>${returning?state.returnDate:state.departDate} · ${state.room} · ${state.direct}</p><p class="small">수업용 모의 시간표</p><div class="rail-table"><div class="rail-head"><span>열차</span><span>출발 / 도착</span><span>좌석</span></div>${rows.map(t=>`<button class="rail-row ${state.trains[state.leg]?.id===t.id?'selected':''}" data-rail-train="${t.id}"><span>KTX<br><small>${t.id}</small></span><span>${t.time} → ${t.arrival}<small>${railDuration()}분 · ${trainRoute()}</small></span><span>${t.sold?'매진':'예약 가능'}</span></button>`).join('')}</div>${!rows.length?'<p>조회 조건에 맞는 열차가 없습니다. 출발 시각 또는 복편 날짜를 변경하십시오.</p>':''}</div><button class="secondary" data-action="rail-query">조건 변경</button>`,`<button class="primary" data-action="rail-seat">좌석 속성 지정</button>`);return;
 }
 if(state.stage==='seat'){
 const returning=state.leg===1;const seats=Array.from({length:16},(_,i)=>{const row=Math.floor(i/4)+1,col='ABCD'[i%4];return {name:row+col,pos:col==='A'||col==='D'?'창측':'내측',dir:row<=2?'역방향':'순방향',busy:i===5||i===10};});
 wrap(`<div class="step">${returning?'복편':'왕편'} 좌석 지정</div><div class="panel"><h2>${returning?'돌아오는':'가는'} 열차 좌석</h2><p class="small">${trainSummary()}<br>${state.trains[state.leg].time} 출발 · ${state.direction} / ${state.position}<br>${state.count}명을 위한 좌석을 각각 선택하십시오.</p><div class="seat-grid">${seats.map(s=>{const unavailable=s.busy||(state.direction!=='무관'&&s.dir!==state.direction)||(state.position!=='무관'&&s.pos!==state.position);return `<button ${unavailable?'disabled':''} data-rail-seat="${s.name}" class="${state.seats[state.leg]?.includes(s.name)?'selected':''}">${s.name} ${s.pos}<br><small>${s.busy?'기판매':s.dir}</small></button>`;}).join('')}</div></div><button class="secondary" data-action="rail-list">열차 재선택</button>`,`<div class="summary"><span>${(state.seats[state.leg]||[]).join(', ')||'좌석 미지정'}</span><b>${won(trainFare())}</b></div><button class="primary" data-action="rail-next">${state.trip==='왕복'&&!returning?'복편 열차 조회':'발권 내용 확인'}</button>`);return;
 }
 wrap(`<div class="step">승차권 발매 &gt; 여정 조회</div><div class="panel"><h2>승차역</h2>${trainOptions('origin',['부산','구포'])}</div><div class="panel"><h2>하차역</h2><div class="options">${Object.keys(stationFares[state.origin]).map(s=>`<button class="option ${state.destination===s?'selected':''}" data-dest="${s}">${s}</button>`).join('')}</div></div><div class="panel"><h2>여정 구분</h2>${trainOptions('trip',['편도','왕복'])}</div>${trainDate('departDate','departHour','왕편 승차 일시')}${state.trip==='왕복'?trainDate('returnDate','returnHour','복편 승차 일시'):''}<div class="panel"><h2>승차 인원</h2><div class="row"><span>${state.child?'소아 · 우대':'어른 · 일반'}</span><div><button data-count="-1">−</button> ${state.count} <button data-count="1">＋</button></div></div><button class="secondary" data-action="discount">우대 발매</button>${state.child?'<button class="secondary" data-rail-key="child" data-rail-value="false">일반 발매</button>':''}</div><div class="panel"><h2>여정 경로</h2>${trainOptions('direct',['직통','환승'])}<p class="small">환승 여정은 연결 열차 발매 창구를 이용하십시오.</p></div><div class="panel"><h2>객실 등급</h2>${trainOptions('room',['일반실','특실'])}</div><div class="panel"><h2>좌석 속성</h2>${trainOptions('direction',['무관','순방향','역방향'])}${trainOptions('position',['무관','창측','내측'])}</div>`,`<button class="primary" data-action="rail-search">열차 조회</button>`);
}
function railDone(){wrap(`<div class="ticket"><div>승차권 발매 완료</div><h2>${state.origin} → ${state.destination}</h2><p>${trainSummary()}</p>${state.trains.slice(0,state.trip==='왕복'?2:1).map((t,i)=>`<p>${i?'복편':'왕편'} · ${i?state.returnDate:state.departDate}<br>${i?state.destination+' → '+state.origin:state.origin+' → '+state.destination}<br>KTX ${t.id} · ${t.time} 출발<br>좌석 ${(state.seats[i]||[]).join(', ')}</p>`).join('')}<p>합계 ${won(trainFare())}</p><div class="barcode"></div></div>`,`<button class="primary" data-action="home">처음 화면으로</button>`);}
const originalKioskDone=done;
done=function(){if(state.kind==='train')return railDone();return originalKioskDone();};
app.addEventListener('change',e=>{if(state.kind!=='train'||!e.target.dataset.railInput)return;state[e.target.dataset.railInput]=e.target.value;state.trains=[];state.seats=[];});
app.addEventListener('click',e=>{
 if(state.kind!=='train')return;const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(!d.railKey&&!d.railTrain&&!d.railSeat&&!d.action?.startsWith('rail-'))return;
 e.stopImmediatePropagation();trainDefaults();
 if(d.railKey){state[d.railKey]=d.railKey==='child'?false:d.railValue;if(d.railKey==='origin')state.destination='';state.trains=[];state.seats=[];return render();}
 if(d.railTrain){const t=railRows().find(t=>t.id===+d.railTrain);if(t.sold)return modal('좌석 매진','선택한 열차의 잔여 좌석이 없습니다. 다른 열차를 선택하십시오.');state.trains[state.leg]=t;state.seats[state.leg]=[];return render();}
 if(d.railSeat){const selected=state.seats[state.leg]||[];if(selected.includes(d.railSeat))state.seats[state.leg]=selected.filter(s=>s!==d.railSeat);else if(selected.length<state.count)state.seats[state.leg]=[...selected,d.railSeat];else return modal('좌석 수 확인','승차 인원만큼만 선택할 수 있습니다. 기존 좌석을 해제하십시오.');return render();}
 switch(d.action){
 case 'rail-search':{
 if(!state.destination)return modal('하차역 확인','하차역을 지정하십시오.');
 const today=new Date();today.setHours(0,0,0,0);const depart=new Date(state.departDate+'T00:00:00');const end=new Date(today);end.setDate(end.getDate()+30);
 if(!state.departDate||!Number.isFinite(+depart)||depart<today||depart>end)return modal('승차일 확인','왕편 승차일은 오늘부터 30일 이내로 지정하십시오.');
 if(state.trip==='왕복'&&(!state.returnDate||state.returnDate<state.departDate||new Date(state.returnDate+'T00:00:00')>end))return modal('복편 승차일 확인','복편은 왕편과 같은 날 또는 이후이며, 오늘부터 30일 이내여야 합니다.');
 if(state.direct==='환승')return modal('연결 여정 조회','환승 연결 열차는 창구에서 발매합니다. 직통 여정으로 재조회하십시오.');
 state.leg=0;state.trains=[];state.seats=[];state.stage='rail-list';break;}
 case 'rail-query':state.stage='menu';break;
 case 'rail-list':state.stage='rail-list';break;
 case 'rail-seat':if(!state.trains[state.leg])return modal('열차 지정','발매할 열차를 먼저 지정하십시오.');state.stage='seat';break;
 case 'rail-next':
 if(state.seats[state.leg]?.length!==state.count)return modal('좌석 지정 미완료',`승차 인원 ${state.count}명에 맞는 좌석을 지정하십시오. 조건에 맞는 좌석이 부족하면 조회 조건을 변경하십시오.`);
 if(state.trip==='왕복'&&state.leg===0){state.leg=1;state.stage='rail-list';break;}
 state.cart=[{name:trainSummary(),description:state.trains.map((t,i)=>`${i?'복편':'왕편'} ${i?state.returnDate:state.departDate} ${t.time} · ${(state.seats[i]||[]).join(', ')}`).join(' / '),price:trainFare()}];state.stage='pay';break;
 }render();
},true);
