const app=document.querySelector('#app');
const places={ice:{name:'배스킨라빈스 31',brand:'baskin robbins 31',color:'#df337f',desc:'아이스크림 · 핸드팩 · 케이크'},food:{name:'푸드코트',brand:'모두의 푸드코트',color:'#cb642c',desc:'먹고 싶은 한 끼 주문'},train:{name:'기차역',brand:'우리철도 승차권 발매',color:'#235f9d',desc:'목적지까지 승차권 구매'},library:{name:'도서관',brand:'우리 동네 도서관',color:'#337d69',desc:'읽고 싶은 책 찾기'}};
let state={},timer=null,serial=100;
const won=n=>n.toLocaleString('ko-KR')+'원';
function photo(sheet,index,label,extra=''){
 const grids={places:[2,2],ice:[4,3],food:[3,3],books:[4,3],hardware:[3,1]};
 const [cols,rows]=grids[sheet];const x=index%cols,y=Math.floor(index/cols);
 const filename={ice:'ice-menu',food:'food-menu'}[sheet]||sheet;
 return `<div class="photo ${extra}" role="img" aria-label="${label}" style="background-image:url('assets/${filename}.png');background-size:${cols*100}% ${rows*100}%;background-position:${cols===1?0:x/(cols-1)*100}% ${rows===1?0:y/(rows-1)*100}%"></div>`;
}
function home(){clearInterval(timer);state={};app.innerHTML=`<section class="home"><div class="eyebrow">우리 동네 · 생활 체험</div><h1>어디로 가 볼까요?</h1><p>이용할 장소를 누르고<br>화면의 안내에 따라 이용해 보세요.</p><div class="places">${Object.entries(places).map(([k,p])=>`<button class="place" data-place="${k}"><div class="place-media">${photo('places',Object.keys(places).indexOf(k),p.name+'의 키오스크','place-photo')}</div><strong>${p.name}</strong><span>${p.desc} →</span></button>`).join('')}</div><p class="home-note">수업용 체험 앱입니다. 실제 결제나 예약은 이루어지지 않습니다.</p></section>`;}
function start(k){clearInterval(timer);state={kind:k,stage:'menu',cart:[],tab:0,seconds:60,opts:{},query:'',seat:'',destination:'',count:1,child:false,member:false,copy:0,libraryOutcome:'print',searchTab:1,libraryFilter:'all',searched:false};render();if(k==='food')timer=setInterval(()=>{if(state.kind!=='food'||state.stage==='done')return;state.seconds--;const el=document.querySelector('#time');if(el)el.textContent=state.seconds;if(state.seconds<=0){clearInterval(timer);modal('이용 시간이 초과되었습니다.','주문이 취소되어 처음 화면으로 돌아갑니다.',()=>start('food'));}},1000);}
function wrap(body,bottom=''){
 const p=places[state.kind];
 const isPay=state.stage==='pay';const isMember=state.kind==='library'&&state.stage==='member';
 app.innerHTML=`<section class="shell ${state.kind}" style="--accent:${p.color}">
 <div class="utility"><span>생활 체험 · ${p.name}</span><button data-action="home">처음 화면으로</button></div>
 <div class="device-screen"><header class="brand">${state.kind==='ice'?'<div class="br-mark" aria-label="배스킨라빈스 31">31</div>':''}<div><small>${p.brand}</small><h1>${state.kind==='train'?'승차권 자동발매':state.kind==='library'?'도서 검색 · 대출':state.kind==='ice'?'배스킨라빈스':'주문하기'}</h1></div><div class="status-light">● <span>이용 가능</span></div></header>
 <div class="screen">${body}</div>${bottom?`<div class="bottom">${bottom}</div>`:''}</div>
 <div class="machine"><div class="hardware-label">${state.kind==='library'?'LIBRARY SEARCH TERMINAL':'SELF SERVICE KIOSK'}<span>안내에 따라 이용해 주세요</span></div>
 ${isMember?`<button class="hardware-unit active-reader" data-action="member-scan" aria-label="체험용 회원증 대기">${photo('hardware',2,'회원증 인식부')}<span>체험용 회원증 대기</span></button>`:isPay?`<button class="hardware-unit active-reader" data-action="card" aria-label="체험용 카드 넣기">${photo('hardware',0,'카드 결제 단말기')}<span>체험용 카드 넣기</span></button>`:`<div class="hardware-unit">${photo('hardware',state.kind==='library'?2:0,state.kind==='library'?'회원증 인식부':'카드 결제 단말기')}<span>${state.kind==='library'?'회원증 인식부':'카드 투입구'}</span></div>`}
 <div class="hardware-unit">${photo('hardware',1,'출력물 배출구')}<span>${state.kind==='train'?'승차권 나오는 곳':'출력물 나오는 곳'}</span></div></div><footer>수업용 가상 키오스크 · 실제 결제는 이루어지지 않습니다</footer></section>`;
}
const foods=[['돈가스',8500],['우동',6500],['비빔밥',7500],['떡볶이',5000],['김밥',4000],['라면',4500],['볶음밥',7000],['만두',4500],['냉면',8000]];
function cartBottom(){return `<div class="summary"><span>${state.cart.length?state.cart.map(x=>x.name).join(', '):'선택한 상품이 없습니다.'}</span><b>${won(state.cart.reduce((s,x)=>s+x.price,0))}</b></div><div class="row"><button data-action="clear">전체 삭제</button>${state.kind==='food'?'<span class="small">남은 시간 <b id="time">'+state.seconds+'</b>초</span>':''}</div><button class="primary" data-action="checkout">결제하기</button>`;}
function render(){if(state.stage==='done')return done();if(state.stage==='pay')return pay();if(state.kind==='ice')ice();if(state.kind==='food')food();if(state.kind==='train')train();if(state.kind==='library')library();}
const choice=(label,extra=0)=>({label,extra});
const quantity=['밥 양 선택',[choice('보통'),choice('곱빼기 (+1,000원)',1000),choice('적게')]];
const noodles=['면 양 선택',[choice('보통'),choice('곱빼기 (+1,000원)',1000)]];
const usePlace=['이용 방법',[choice('매장에서 식사'),choice('포장')]];
const foodProfiles=[
 [['메뉴 구성',[choice('돈가스 단품'),choice('돈가스 + 미니우동 정식 (+2,500원)',2500)]],quantity,['소스 선택',[choice('기본 소스'),choice('소스 따로'),choice('소스 제외')]],usePlace],
 [['메뉴 구성',[choice('우동 단품'),choice('우동 + 김밥 4조각 세트 (+2,500원)',2500)]],noodles,['고명 추가',[choice('기본 고명'),choice('유부 추가 (+500원)',500),choice('새우튀김 추가 (+1,500원)',1500)]],usePlace],
 [['메뉴 구성',[choice('비빔밥 단품'),choice('비빔밥 + 된장국 + 계란찜 정식 (+2,000원)',2000)]],quantity,['고추장 선택',[choice('기본 고추장'),choice('고추장 따로'),choice('고추장 제외')]],usePlace],
 [['메뉴 구성',[choice('떡볶이 단품'),choice('떡볶이 + 튀김 + 순대 세트 (+3,500원)',3500)]],['맵기 선택',[choice('순한맛'),choice('보통맛'),choice('매운맛')]],['사리 추가',[choice('추가 안 함'),choice('치즈 추가 (+1,000원)',1000),choice('라면사리 추가 (+1,000원)',1000)]],usePlace],
 [['메뉴 구성',[choice('김밥 단품'),choice('김밥 + 라면 세트 (+3,500원)',3500)]],['김밥 종류',[choice('기본 김밥'),choice('참치 김밥 (+1,000원)',1000),choice('치즈 김밥 (+500원)',500)]],['국물 제공',[choice('기본 국물'),choice('국물 제외')]],usePlace],
 [['메뉴 구성',[choice('라면 단품'),choice('라면 + 공깃밥 세트 (+1,000원)',1000)]],['맵기 선택',[choice('보통맛'),choice('순한맛'),choice('매운맛')]],['토핑 추가',[choice('추가 안 함'),choice('계란 추가 (+500원)',500),choice('치즈 추가 (+500원)',500)]],usePlace],
 [['메뉴 구성',[choice('볶음밥 단품'),choice('볶음밥 + 미니우동 정식 (+2,000원)',2000)]],quantity,['토핑 추가',[choice('기본 토핑'),choice('계란 프라이 추가 (+500원)',500),choice('새우 추가 (+1,500원)',1500)]],usePlace],
 [['메뉴 구성',[choice('만두 단품'),choice('만두 + 우동 세트 (+4,500원)',4500)]],['조리 방법',[choice('찐만두'),choice('군만두')]],['간장 소스',[choice('간장 제공'),choice('간장 제외')]],usePlace],
 [['메뉴 구성',[choice('냉면 단품'),choice('냉면 + 만두 3개 세트 (+2,000원)',2000)]],['냉면 종류',[choice('물냉면'),choice('비빔냉면')]],noodles,usePlace]
];
function food(){
 if(state.stage==='options'){
  const stages=foodProfiles[state.item.index],q=stages[state.optionStep];
  const price=state.item.price+state.opts.reduce((sum,v,i)=>sum+(stages[i][1][v]?.extra||0),0);
  wrap(`<div class="step">${state.item.name} · 상세 주문 ${state.optionStep+1}/${stages.length}</div><div class="panel"><div class="detail-image compact">${photo('food',state.item.index,state.item.name)}</div><h2>${q[0]}</h2><div class="options">${q[1].map((o,i)=>`<button class="option ${state.choice===i?'selected':''}" data-choice="${i}">${o.label}</button>`).join('')}</div></div><p class="small">선택 후 다음 버튼을 눌러 주세요.</p><div class="row"><button data-action="food-prev">이전</button><button data-action="menu">주문 취소</button></div>`,`<div class="summary"><span>선택 금액 ${won(price)}</span><span class="small">남은 시간 <b id="time">${state.seconds}</b>초</span></div><button class="primary" data-action="food-next">${state.optionStep===3?'주문 담기':'다음'}</button>`);return;
 }
 wrap(`<div class="step">메뉴 선택 &gt; 상세 주문 &gt; 결제</div><div class="tabs">${['전체 메뉴','한식','분식','면 요리','추천 메뉴'].map((t,i)=>`<button data-tab="${i}" class="${state.tab===i?'on':''}">${t}</button>`).join('')}</div><div class="grid">${foods.map(([n,p],i)=>({n,p,i})).filter(x=>state.tab===0||state.tab===1&&[0,2,6].includes(x.i)||state.tab===2&&[3,4,7].includes(x.i)||state.tab===3&&[1,5,8].includes(x.i)||state.tab===4&&[0,1,2].includes(x.i)).map(({n,p,i})=>`<button class="product" data-food="${i}">${photo('food',i,n)}<strong>${n}</strong><span>${won(p)}</span></button>`).join('')}</div>`,cartBottom());
}
const trainFares={서울:54400,대전:33100,동대구:15600,울산:7500,경주:10100,밀양:7500};
function trainFare(){return Math.round((trainFares[state.destination]||0)*(state.child?.5:1)/100)*100*state.count;}
function trainRoute(){return state.destination==='밀양'?'구포 경유':'경주 경유';}
function train(){if(state.stage==='seat'){wrap(`<div class="step">승차권 발매 &gt; 좌석 지정</div><div class="panel"><h2>좌석 속성 지정</h2><p class="small">KTX · ${state.destination}행 · 10:30 출발 · 일반실<br>${trainRoute()} · ${state.child?'소아':'어른'} ${state.count}명<br>순방향 / 역방향 · 창측 / 내측</p><div class="seat-grid">${['1A 창측','1B 내측','1C 내측','1D 창측','2A 창측','2B 내측','2C 내측','2D 창측'].map((s,i)=>`<button data-seat="${s}" class="${state.seat===s?'selected':''}">${s}<br><small>${i<4?'역방향':'순방향'}</small></button>`).join('')}</div></div><button class="secondary" data-action="menu">재조회</button>`,`<div class="summary"><span>선택 좌석 ${state.seat||'—'}</span><b>${won(trainFare())}</b></div><button class="primary" data-action="train-pay">발권</button>`);return;}wrap(`<div class="step">승차권 발매 &gt; 여정 조회</div><div class="panel"><h2>출발역</h2><button class="option selected">부산</button></div><div class="panel"><h2>도착역</h2><div class="options">${['서울','대전','동대구','울산','경주','밀양'].map(s=>`<button class="option ${state.destination===s?'selected':''}" data-dest="${s}">${s}</button>`).join('')}</div></div><div class="panel"><h2>승차 인원</h2><div class="row"><span>${state.child?'소아 · 우대':'어른 · 일반'}</span><div><button data-count="-1">−</button> ${state.count} <button data-count="1">＋</button></div></div><p class="small">소아 / 경로 / 할인 대상은 우대 발매 메뉴를 이용해 주십시오.</p><button class="secondary" data-action="discount">우대 발매</button></div><div class="panel"><h2>승차 일시</h2><p>오늘 · 10:30</p><span class="small">KTX / 일반실 / 편도 · ${state.destination?trainRoute():'경주 경유'}</span></div>`,`<button class="primary" data-action="train-search">열차 조회</button>`);}
const books=['강아지똥','마당을 나온 암탉','만복이네 떡집','이상한 과자 가게','아홉 살 마음 사전','우주로 떠나는 여행','우리 동네 식물 도감','바다 생물 이야기','옛날 옛적 우리 역사','수학 탐정단','지구를 지켜라','책 먹는 여우'];
const libraryMeta=[
 ['권정생','길벗어린이','813.8','C-2',['대출중','대출가능']],
 ['황선미','사계절','813.8','C-3',['관내열람','대출가능']],
 ['김리리','비룡소','813.8','C-2',['대출중','대출중']],
 ['히로시마 레이코','길벗스쿨','833.8','D-1',['대출중','대출가능']],
 ['박성우','창비','181.7','A-1',['관내열람','대출가능']],
 ['도서관 편집부','우리책','443','A-3',['대출가능']],
 ['도서관 편집부','우리책','481','A-4',['대출중']],
 ['도서관 편집부','우리책','477','A-4',['대출가능']],
 ['도서관 편집부','우리책','911','E-1',['관내열람']],
 ['도서관 편집부','우리책','410','A-2',['대출가능']],
 ['도서관 편집부','우리책','539','A-4',['대출중','대출가능']],
 ['프란치스카 비어만','주니어김영사','853','D-2',['대출가능','대출중']]
];
const libraryData=books.map((title,i)=>{
 const [author,publisher,code,shelf,statuses]=libraryMeta[i];
 return {title,author,publisher,subject:i<5?'동화':i<8?'과학':i===8?'역사':i===9?'수학':'어린이',index:i,
 copies:statuses.map((status,j)=>({status,branch:i===1&&j===1?'중앙도서관':'우리동네도서관',room:j===0&&status==='관내열람'?'참고자료실':'어린이자료실',code:`${j===0&&status==='관내열람'?'참':'아'} ${code} ${author[0]}${i+10} c.${j+1}`,shelf:j?shelf.replace(/.$/,'4'):shelf,registration:`MD${String(i*2+j+1).padStart(6,'0')}`}))};
});
const escapeHtml=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const selectedRecord=()=>libraryData[books.indexOf(state.book)];
const selectedCopy=()=>selectedRecord()?.copies[state.copy||0];
const statusClass=t=>t==='대출가능'?'available':t==='대출중'?'unavailable':'reference';
const statusBadge=t=>`<span class="status-badge ${statusClass(t)}">${t}</span>`;
function libraryLogin(action,returnStage='detail'){
 state.memberAction=action;state.memberReturn=returnStage;
 if(state.member)return completeLibraryLogin();state.stage='member';render();
}
function completeLibraryLogin(){
 state.member=true;
 if(['loan','reserve','interloan'].includes(state.memberAction)){if(state.memberAction==='loan')selectedCopy().status='대출중';state.libraryOutcome=state.memberAction;state.stage='done';render();}
 else if(state.memberAction==='interest'){state.stage=state.memberReturn;render();modal('관심도서 등록','선택한 책을 관심도서에 등록했습니다.');}
 else{state.stage='service';render();}
}
function library(){
 if(state.stage==='member'){
  wrap(`<div class="step">${state.memberAction==='loan'?'대출 신청':state.memberAction==='reserve'?'대출 예약':'회원 서비스'} &gt; 이용자 확인</div><div class="panel"><h2>회원증을 인식해 주십시오</h2><p>회원증을 화면 아래 인식부에 올려 주세요.</p><p class="small">이용자 인증 후 선택한 서비스로 이동합니다.</p></div><button class="secondary" data-action="member-back">이전</button>`,`<button class="primary" data-action="member-scan">체험용 회원증 대기</button>`);return;
 }
 if(state.stage==='service'){
  const content={대출조회:'현재 대출 2권 / 대출 가능 3권<br>우주로 떠나는 여행 — 반납예정일 10월 12일<br>수학 탐정단 — 반납예정일 10월 15일',회원정보:'체험용 회원 · 어린이<br>회원 상태: 정상<br>대출 한도 5권 / 현재 대출 2권',전자자료:'어린이 전자책 12종<br>전자자료는 도서관 홈페이지에서 이용할 수 있습니다.',희망도서:'소장하지 않은 책은 안내 데스크에서 희망도서를 신청할 수 있습니다.',시설예약:'어린이 열람실: 자유 이용<br>모둠활동실: 안내 데스크 예약',관심도서:'선택한 자료를 관심도서에 등록할 수 있습니다.'};
  wrap(`<div class="step">회원 서비스 &gt; ${state.memberAction}</div><div class="panel"><h2>${state.memberAction}</h2><p>${content[state.memberAction]||'안내 데스크에서 이용 방법을 확인해 주세요.'}</p></div>`,`<button class="primary" data-action="library-back">자료 검색으로</button>`);return;
 }
 if(state.stage==='map'){
  const c=selectedCopy();
  wrap(`<div class="step">자료 위치 &gt; 서가배치도</div><div class="panel"><h2>${c.branch} · ${c.room}</h2><p>선택 자료: ${state.book}<br>청구기호: ${c.code}<br>서가: ${c.shelf}</p><table class="shelf-map"><thead><tr><th>구역</th><th>자료 분류</th><th>서가 번호</th></tr></thead><tbody><tr><td>A</td><td>사회·과학·수학</td><td>A-1 ~ A-4</td></tr><tr><td>C</td><td>국내 동화</td><td>C-1 ~ C-4</td></tr><tr><td>D</td><td>외국 동화</td><td>D-1 ~ D-4</td></tr><tr><td>E</td><td>역사</td><td>E-1 ~ E-4</td></tr></tbody></table><p class="small">${c.room==='참고자료실'?'참고자료실은 2층이며 관내 열람만 가능합니다.':'어린이자료실은 1층입니다. 구역 안에서는 청구기호 순으로 자료가 배치되어 있습니다.'}</p></div>`,`<button class="primary" data-action="library-detail">소장 정보로</button>`);return;
 }
 if(state.stage==='detail'){
  const r=selectedRecord(),c=selectedCopy();
  wrap(`<div class="step">자료 검색 &gt; 상세 정보 &gt; 소장자료</div><div class="panel catalog-detail"><div class="detail-image book-detail">${photo('books',r.index,r.title+' 체험용 표지')}</div><h2>${r.title}</h2><p>저자: ${r.author}<br>발행자: ${r.publisher}<br>자료 유형: 단행본<br>분류: ${r.subject}</p></div><div class="panel copies-panel"><h2>소장자료 ${r.copies.length}건</h2><p class="small">처리할 소장자료를 선택하십시오.</p><div class="copy-table-wrap"><table class="copy-table"><thead><tr><th>선택</th><th>소장처 / 자료실</th><th>청구기호 / 등록번호</th><th>자료 상태</th></tr></thead><tbody>${r.copies.map((v,j)=>`<tr class="${state.copy===j?'selected-copy':''}"><td><button class="copy-selector" data-copy="${j}" aria-label="소장자료 ${j+1} 선택">${state.copy===j?'●':'○'}</button></td><td>${v.branch}<br><small>${v.room}</small></td><td>${v.code}<br><small>${v.registration}</small></td><td>${statusBadge(v.status)}<br><small>${v.status==='대출중'?'반납예정 10/12':v.status==='관내열람'?'관외대출 불가':'서가 '+v.shelf}</small></td></tr>`).join('')}</tbody></table></div></div><div class="library-links">${['상호대차','관외대출','서가배치도','예약신청','관심도서','검색결과'].map(t=>`<button data-lib="${t}">${t}</button>`).join('')}</div><div class="panel"><h2>선택 자료 위치</h2><p>${c.branch} / ${c.room}<br>청구기호: ${c.code}<br>서가: ${c.shelf}</p><div class="row"><button data-action="book-print">소장정보 출력</button><button data-action="lib-borrow">대출 신청</button></div></div>`,`<button class="primary" data-action="library-back">검색 결과로</button>`);return;
 }
 const q=state.query.replace(/\s/g,'').toLowerCase();
 const fields=['all','title','author','publisher','subject'];
 const field=fields[state.searchTab];
 let list=libraryData.filter(r=>!q||(field==='all'?[r.title,r.author,r.publisher,r.subject]:[r[field]]).some(v=>v.replace(/\s/g,'').toLowerCase().includes(q)));
 if(state.libraryFilter==='available')list=list.filter(r=>r.copies.some(c=>c.status==='대출가능'&&c.branch==='우리동네도서관'));
 if(state.libraryFilter==='local')list=list.filter(r=>r.copies.some(c=>c.branch==='우리동네도서관'));
 list.sort((a,b)=>a.title.localeCompare(b.title,'ko'));
 wrap(`<div class="step">도서관 서비스 통합 안내</div><div class="library-links">${['통합검색','신간도서','추천도서','대출조회','회원정보','이용안내','전자자료','희망도서','시설예약'].map(t=>`<button data-lib="${t}">${t}</button>`).join('')}</div><div class="panel"><h2>자료 검색</h2><div class="tabs">${['전체','서명','저자','발행자','주제어'].map((t,i)=>`<button data-search-tab="${i}" class="${state.searchTab===i?'on':''}">${t}</button>`).join('')}</div><form id="search" class="search"><input aria-label="검색어" placeholder="검색어 입력" value="${escapeHtml(state.query)}"><button class="secondary" type="submit">검색</button></form><div class="filter-row"><label for="lib-filter">자료 범위</label><select id="lib-filter"><option value="all" ${state.libraryFilter==='all'?'selected':''}>전체 소장자료</option><option value="local" ${state.libraryFilter==='local'?'selected':''}>우리동네도서관</option><option value="available" ${state.libraryFilter==='available'?'selected':''}>대출가능 자료</option></select></div></div><div class="row"><span class="small">검색 결과 ${list.length}건 · 서명순</span><span class="small">소장 정보 / 단행본</span></div>${list.map(r=>`<button class="book" data-book="${r.index}">${photo('books',r.index,r.title+' 체험용 표지','book-photo')}<div class="book-info"><strong>${r.title}</strong><div>${r.author} / ${r.publisher}</div><span>소장 ${r.copies.length}권 · ${r.copies[0].room}</span></div><div class="book-state">${statusBadge(r.copies[0].status)}<small>소장정보 &gt;</small></div></button>`).join('')||'<div class="panel no-results"><h2>검색 결과가 없습니다.</h2><p>검색어 및 검색항목을 확인하십시오.</p></div>'}`);
}
function libraryAction(t){
 if(['검색결과','통합검색'].includes(t)){state.stage='menu';render();return;}
 if(t==='신간도서'||t==='추천도서'){state.query='';state.searchTab=1;state.libraryFilter='all';state.stage='menu';render();modal(t,t==='신간도서'?'최근 등록된 소장자료를 표시합니다.':'어린이 추천자료를 표시합니다.');return;}
 if(t==='서가배치도'){state.stage='map';render();return;}
 if(t==='관외대출')return libraryBorrow();
 if(t==='예약신청'){
  if(selectedCopy().status!=='대출중')return modal('예약 신청','대출 중인 자료에 한해 예약할 수 있습니다.');
  return libraryLogin('reserve');
 }
 if(t==='상호대차'){
  if(selectedCopy().branch==='우리동네도서관')return modal('상호대차','타 도서관 소장자료만 신청할 수 있습니다.\n처리할 소장자료를 확인하십시오.');
  return libraryLogin('interloan');
 }
 if(t==='관심도서')return libraryLogin('interest');
 if(t==='이용안내')return modal('이용 안내','도서 검색은 회원증 없이 이용할 수 있습니다.\n대출가능 자료를 선택하고 자료실과 청구기호를 확인해 주세요.\n회원 서비스는 체험용 회원증으로 진행할 수 있습니다.');
 return libraryLogin(t,'menu');
}
function libraryBorrow(){
 const c=selectedCopy();
 if(c.status!=='대출가능')return modal('대출 불가',c.status==='대출중'?'선택한 소장자료는 대출 중입니다.\n반납예정일: 10월 12일\n다른 소장자료를 선택하거나 예약을 신청하십시오.':'선택한 자료는 관내열람 자료입니다.\n도서관 안에서만 읽을 수 있습니다.');
 if(c.branch!=='우리동네도서관')return modal('소장처 확인','다른 도서관에 있는 자료입니다.\n해당 도서관을 방문하거나 상호대차를 신청하십시오.');
 return libraryLogin('loan');
}
function libraryDone(){
 const r=selectedRecord(),c=selectedCopy();const action=state.libraryOutcome;
 const headings={print:'소장 정보 출력 완료',loan:'대출 처리 완료',reserve:'예약 신청 완료',interloan:'상호대차 신청 완료'};
 wrap(`<div class="ticket"><div>${headings[action]}</div><h2>${r.title}</h2><p>${c.branch}<br>${c.room} / 서가 ${c.shelf}<br>청구기호: ${c.code}<br>자료 상태: ${c.status}</p><p>${action==='print'?'출력한 위치 정보를 확인해 주세요.':action==='loan'?'반납예정일: 10월 19일':action==='reserve'?'예약 순위: 1번<br>자료가 반납되면 안내됩니다.':'수령 도서관: 우리동네도서관<br>자료 도착 시 안내됩니다.'}</p><div class="barcode"></div></div>`,`<button class="primary" data-action="library-back">자료 검색으로</button>`);
}
function pay(){wrap(`<div class="step">주문 확인 &gt; 결제 수단 선택</div><div class="panel"><h2>${state.kind==='train'?'승차권':'주문'} 확인</h2>${state.cart.map(x=>`<div class="row"><span>${x.name}${x.description?`<small class="order-description">${x.description}</small>`:''}</span><b>${won(x.price)}</b></div>`).join('')}<hr><div class="row"><b>합계</b><b>${won(state.cart.reduce((s,x)=>s+x.price,0))}</b></div></div><div class="panel"><h2>결제 수단</h2><button class="option selected" data-action="card">신용 / 체크카드</button><p class="small">카드 투입구에 카드를 넣어 주세요.</p></div><p class="small">체험용 카드로 결제를 진행할 수 있습니다.</p><button class="secondary" data-action="menu">이전</button>`,`<p class="payment-prompt">아래 카드 단말기를 눌러 체험용 카드를 넣어 주세요.</p>`);}
function done(){clearInterval(timer);if(state.kind==='library')return libraryDone();wrap(`<div class="ticket"><div>${state.kind==='train'?'승차권 발매 완료':state.kind==='library'?'소장 정보 출력 완료':'주문 완료'}</div><h2>${state.kind==='library'?state.book:state.kind==='train'?'부산 → '+state.destination:'주문 번호'}</h2>${state.kind==='library'?'<p>어린이자료실 B-3<br>청구기호: 아 813.8 ㄱ'+(books.indexOf(state.book)+1)+'</p>':state.kind==='train'?`<p>KTX · 오늘 10:30 · 일반실<br>${trainRoute()}<br>${state.seat} · ${state.child?'소아':'어른'} ${state.count}명<br>운임 ${won(trainFare())}</p>`:'<div class="number">'+(++serial)+'</div><p>전광판에 번호가 나오면<br>음식을 받아 주세요.</p>'}<div class="barcode"></div></div><p style="text-align:center">이용해 주셔서 감사합니다.</p>`,`<button class="primary" data-action="home">처음 화면으로</button>`);}
function modal(title,message,callback){const el=document.createElement('div');el.className='overlay';el.style.setProperty('--accent',places[state.kind]?.color||'#253f5d');el.innerHTML=`<div class="dialog" role="dialog" aria-modal="true"><h2>${title}</h2><p>${message}</p><button class="primary">확인</button></div>`;app.append(el);el.querySelector('button').onclick=()=>{el.remove();callback?.();};el.querySelector('button').focus();}
app.addEventListener('submit',e=>{if(e.target.id==='search'){e.preventDefault();state.query=e.target.querySelector('input').value.trim();state.searched=true;render();}});
app.addEventListener('change',e=>{if(e.target.id==='lib-filter'){state.libraryFilter=e.target.value;render();}});
app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.place)return start(d.place);
 if(d.copy!==undefined){state.copy=+d.copy;return render();}
 if(d.searchTab!==undefined){state.query=document.querySelector('#search input')?.value||state.query;state.searchTab=+d.searchTab;return render();}
 if(state.kind==='ice'&&handleIceClick(d))return;
 if(d.tab!==undefined){state.tab=+d.tab;return render();}
 if(d.food!==undefined){const f=foods[+d.food];state.item={name:f[0],price:f[1],index:+d.food};state.optionStep=0;state.choice=null;state.opts=[];state.stage='options';return render();}
 if(d.choice!==undefined){state.choice=+d.choice;state.opts[state.optionStep]=state.choice;return render();}
 if(d.dest){state.destination=d.dest;return render();}
 if(d.count){state.count=Math.min(6,Math.max(1,state.count+(+d.count)));return render();}
 if(d.seat){state.seat=d.seat;return render();}
 if(d.book!==undefined){state.book=books[+d.book];state.copy=0;state.stage='detail';return render();}
 if(d.lib)return libraryAction(d.lib);
 switch(d.action){case 'home':home();break;case 'menu':state.stage='menu';render();break;case 'clear':state.cart=[];render();break;case 'checkout':if(state.kind==='ice'){if(!state.cart.length)return modal('상품 선택','주문할 상품을 먼저 선택해 주세요.');state.stage='br-review';render();break;}if(!state.cart.length)return modal('상품 선택','주문할 상품을 먼저 선택해 주세요.');state.stage='pay';render();break;case 'food-prev':if(state.optionStep===0){state.stage='menu';}else{state.optionStep--;state.choice=state.opts[state.optionStep]??null;}render();break;
 case 'food-next':{
 if(state.choice===null)return modal('항목 선택','항목을 선택해 주세요.');
 state.opts[state.optionStep]=state.choice;state.optionStep++;state.choice=state.opts[state.optionStep]??null;
 if(state.optionStep===4){const stages=foodProfiles[state.item.index];const selected=state.opts.map((v,i)=>stages[i][1][v]);state.cart.push({...state.item,name:state.item.name,description:selected.map(v=>v.label).join(' / '),price:state.item.price+selected.reduce((sum,v)=>sum+v.extra,0)});state.stage='menu';}
 render();break;}
 case 'train-search':if(!state.destination)return modal('도착역 확인','도착역을 선택해 주세요.');state.stage='seat';render();break;case 'train-pay':if(!state.seat)return modal('좌석 확인','좌석을 지정해 주세요.');state.cart=[{name:'KTX 부산 → '+state.destination+' · '+(state.child?'소아':'어른')+' '+state.count+'명',price:trainFare()}];state.stage='pay';render();break;case 'discount':modal('우대 발매','소아: 만 6세 이상 만 13세 미만\n경로: 만 65세 이상\n소아 운임으로 적용하시겠습니까?',()=>{state.count=1;state.child=true;render();modal('적용 완료','소아 1명으로 선택했습니다.');});break;case 'card':state.stage='done';render();break;case 'library-back':state.stage='menu';render();break;case 'book-print':state.libraryOutcome='print';state.stage='done';render();break;case 'lib-borrow':libraryBorrow();break;case 'member-scan':completeLibraryLogin();break;case 'member-back':state.stage=state.memberReturn;render();break;case 'library-detail':state.stage='detail';render();break;}
});
home();
