const brSizes=[
 {name:'싱글레귤러',english:'SINGLE REGULAR',price:3900,tastes:1,weight:115,pack:false},
 {name:'싱글킹',english:'SINGLE KING',price:4700,tastes:1,weight:145,pack:false},
 {name:'더블주니어',english:'DOUBLE JUNIOR',price:5100,tastes:2,weight:150,pack:false},
 {name:'트리플 주니어',english:'TRIPLE JUNIOR',price:7200,tastes:3,weight:225,pack:false},
 {name:'더블레귤러',english:'DOUBLE REGULAR',price:7300,tastes:2,weight:230,pack:false},
 {name:'파인트',english:'PINT',price:9800,tastes:3,weight:336,pack:true},
 {name:'쿼터',english:'QUARTER',price:18500,tastes:4,weight:643,pack:true},
 {name:'패밀리',english:'FAMILY',price:26000,tastes:5,weight:989,pack:true},
 {name:'하프갤론',english:'HALF GALLON',price:31500,tastes:6,weight:1237,pack:true}
];
function brSizePhoto(i,extra=''){
 return `<div class="photo br-size-photo ${extra}" role="img" aria-label="${brSizes[i].name}" style="background-image:url('assets/br/sizes.png');background-size:300% 300%;background-position:${i%3*50}% ${Math.floor(i/3)*50}%"></div>`;
}
function brImage(item,extra=''){return `<img class="br-photo ${extra}" src="${item.image}" alt="${item.name}" draggable="false">`;}
function brSelectedProduct(){return state.brDraft.type==='cake'?brCakes[state.brDraft.index]:brSizes[state.brDraft.index];}
function brProductPhoto(draft=state.brDraft){return draft.type==='cake'?brImage(brCakes[draft.index]):brSizePhoto(draft.index);}
function brSteps(active){return `<div class="br-steps">${['상품 선택','맛 선택','추가 선택','주문 확인'].map((t,i)=>`<span class="${i===active?'active':''}"><b>${i+1}</b>${t}</span>`).join('')}</div>`;}
function brSummary(){const total=state.cart.reduce((sum,x)=>sum+x.price,0);return `<div class="br-cart-head"><span>주문 내역 <b>${state.cart.length}</b></span><button data-action="clear">전체 삭제</button></div><div class="br-cart-mini">${state.cart.length?state.cart.map((x,i)=>`<div><span>${x.name} × ${x.brDraft?.quantity||1}</span><b>${won(x.price)}</b><button data-br-delete="${i}" aria-label="${x.name} 삭제">×</button></div>`).join(''):'<p>상품을 선택해 주세요.</p>'}</div><div class="br-total"><span>총 결제금액</span><b>${won(total)}</b></div><button class="primary" data-action="checkout">주문 확인 / 결제</button>`;}
function brChooseProduct(index,type){
 state.brDraft={index,type,flavors:[],container:type==='cake'||brSizes[index]?.pack?'핸드팩':'',use:type==='cake'||brSizes[index]?.pack?'포장':'',packTime:null,spoons:null,candles:0,quantity:1};
 state.brFlavorPage=0;state.brFlavorFilter=0;state.brEditing=null;
 state.stage=type==='cake'?'br-extra':brSizes[index].pack?'br-flavors':'br-container';render();
}
function brFlavorsForFilter(){
 const lists=[brFlavors,brFlavors.filter(x=>/초콜릿|초코|봉봉|외계인|쿠키|훠지|리본/.test(x.name)),brFlavors.filter(x=>/딸기|스트로베리|체리|샤베트|망고|바나나|멜론|콜라다|산딸기/.test(x.name)),brFlavors.filter(x=>/요거트|치즈|바닐라|그린티|말차|피스타치오/.test(x.name))];
 return lists[state.brFlavorFilter||0];
}
function brExtraOptions(label,key,items){return `<section class="br-option-group"><h2>${label}</h2><div class="br-small-options">${items.map(([value,text])=>`<button class="${state.brDraft[key]===value?'selected':''}" data-br-option="${key}" data-value="${value}">${text}</button>`).join('')}</div></section>`;}
function ice(){
 const draft=state.brDraft;
 if(state.stage==='br-review')return brReview();
 if(state.stage==='br-container'){
 const p=brSelectedProduct();wrap(`${brSteps(0)}<div class="br-selection-title"><h2>${p.name}</h2><b>${won(p.price)}</b></div><div class="br-detail-photo">${brProductPhoto()}</div><h2 class="br-heading">CONE & CUP</h2><div class="options"><button class="option ${draft.container==='콘'?'selected':''}" data-br-container="콘">콘<br><small>와플 콘</small></button><button class="option ${draft.container==='컵'?'selected':''}" data-br-container="컵">컵<br><small>종이컵</small></button></div><p class="small">${p.tastes}가지 맛 · ${p.weight}g</p>`,`<div class="br-nav"><button class="secondary" data-action="menu">상품 목록</button><button class="primary" data-br-next="container">맛 선택</button></div>`);return;
 }
 if(state.stage==='br-flavors'){
 const p=brSelectedProduct(),items=brFlavorsForFilter(),page=state.brFlavorPage||0,pages=Math.max(1,Math.ceil(items.length/12));
 wrap(`${brSteps(1)}<div class="br-selection-title"><h2>${p.name} · ${draft.container}</h2><b>${won(p.price)}</b></div><div class="br-flavor-count">플레이버 선택 <b>${draft.flavors.length} / ${p.tastes}</b><span>${p.tastes}가지 맛을 선택하십시오.</span></div><div class="tabs br-flavor-tabs">${['전체 31','초콜릿·쿠키','과일·샤베트','우유·요거트'].map((t,i)=>`<button data-br-filter="${i}" class="${state.brFlavorFilter===i?'on':''}">${t}</button>`).join('')}</div><div class="br-flavor-grid">${items.slice(page*12,page*12+12).map(f=>{const index=brFlavors.indexOf(f),picked=draft.flavors.indexOf(index);return `<button class="br-flavor ${picked>=0?'picked':''}" data-br-flavor="${index}">${brImage(f)}${picked>=0?`<b class="br-pick-number">${picked+1}</b>`:''}<strong>${f.name}</strong></button>`;}).join('')}</div><div class="br-pagination"><button data-br-page="${page-1}" ${page===0?'disabled':''}>이전</button><span>${page+1} / ${pages}</span><button data-br-page="${page+1}" ${page+1>=pages?'disabled':''}>다음</button></div>`,`<div class="br-selected-flavors">${Array.from({length:p.tastes},(_,i)=>draft.flavors[i]!==undefined?`<button data-br-remove="${i}" aria-label="${brFlavors[draft.flavors[i]].name} 선택 취소">${brImage(brFlavors[draft.flavors[i]])}<span>${brFlavors[draft.flavors[i]].name}</span><b>×</b></button>`:`<div><b>${i+1}</b><span>맛 선택</span></div>`).join('')}</div><div class="br-nav"><button class="secondary" data-br-back="flavors">이전</button><button class="primary" data-br-next="flavors">추가 선택</button></div>`);return;
 }
 if(state.stage==='br-extra'){
 const p=brSelectedProduct();wrap(`${brSteps(2)}<div class="br-selection-title"><h2>${p.name}</h2><b>${won(p.price)}</b></div>${draft.type==='cake'?`<div class="br-cake-detail">${brProductPhoto()}</div>`:''}${draft.type!=='cake'&&!p.pack?brExtraOptions('이용 방법','use',[['매장','매장에서 먹기'],['포장','포장하기']]):'<div class="br-pack-note">HAND PACK · 포장 주문</div>'}${draft.use==='포장'?brExtraOptions('포장 소요시간','packTime',[[10,'10분 이내'],[20,'20분 이내'],[30,'30분 이내']]):''}${brExtraOptions('스푼 수량','spoons',[[0,'필요 없음'],[1,'1개'],[2,'2개'],[3,'3개'],[4,'4개'],[5,'5개'],[6,'6개']])}${draft.type==='cake'?brExtraOptions('생일 초','candles',[[0,'필요 없음'],[1,'1개'],[2,'2개'],[3,'3개'],[5,'5개']]):''}<section class="br-option-group"><h2>상품 수량</h2><div class="br-quantity"><button data-br-quantity="-1">−</button><b>${draft.quantity}</b><button data-br-quantity="1">＋</button></div></section>`,`<div class="br-total"><span>상품 금액</span><b>${won(p.price*draft.quantity)}</b></div><div class="br-nav"><button class="secondary" data-br-back="extra">이전</button><button class="primary" data-br-next="extra">${state.brEditing===null?'주문 담기':'변경 완료'}</button></div>`);return;
 }
 const category=state.brCategory||0;
 const products=brSizes.map((p,i)=>({...p,index:i,type:'size'})).filter(p=>category===0||category===1&&!p.pack||category===2&&p.pack);
 const cakes=category===0||category===3?brCakes.map((p,i)=>({...p,index:i,type:'cake'})):[];
 wrap(`<div class="br-promotion"><div><small>HAPPY ICE CREAM</small><strong>31가지 맛, 골라 담는 즐거움</strong><span>아이스크림 · 핸드팩 · 케이크</span></div><div class="br-promo-scoops">${brFlavors.slice(0,3).map(f=>brImage(f)).join('')}</div></div>${brSteps(0)}<div class="tabs br-category-tabs">${['전체 상품','콘·컵','핸드팩','아이스크림 케이크'].map((t,i)=>`<button data-br-category="${i}" class="${category===i?'on':''}">${t}</button>`).join('')}</div><div class="br-products">${products.map(p=>`<button class="br-product" data-br-size="${p.index}">${brSizePhoto(p.index)}<strong>${p.name}</strong><span class="br-english">${p.english}</span><small>${p.tastes}가지 맛 · ${p.weight.toLocaleString()}g</small><b>${won(p.price)}</b></button>`).join('')}${cakes.map(p=>`<button class="br-product cake-product" data-br-cake="${p.index}">${brImage(p)}<strong>${p.name}</strong><small>아이스크림 케이크</small><b>${won(p.price)}</b></button>`).join('')}</div><p class="br-price-note">케이크 가격은 수업용 체험 가격입니다.</p>`,brSummary());
}
function brReview(){
 const total=state.cart.reduce((sum,x)=>sum+x.price,0);
 wrap(`${brSteps(3)}<h2 class="br-heading">주문 내역을 확인해 주세요.</h2><div class="br-review-list">${state.cart.map((x,i)=>`<article><div class="br-review-photo">${brProductPhoto(x.brDraft)}</div><div class="br-review-description"><h3>${x.name}</h3><p>${x.description}</p><b>${won(x.price)}</b><div class="br-review-actions"><button data-br-edit="${i}">변경</button><button data-br-delete="${i}">삭제</button></div></div></article>`).join('')||'<p>선택한 상품이 없습니다.</p>'}</div><div class="br-loyalty"><span>해피포인트</span><button data-br-reward="true">${state.brReward?'체험용 적립 선택 완료':'적립 선택'}</button></div><div class="br-option-group"><h2>영수증</h2><div class="br-small-options"><button data-br-receipt="yes" class="${state.brReceipt==='yes'?'selected':''}">출력</button><button data-br-receipt="no" class="${state.brReceipt==='no'?'selected':''}">출력 안 함</button></div></div>`,`<div class="br-total"><span>총 결제금액</span><b>${won(total)}</b></div><div class="br-nav"><button class="secondary" data-action="menu">메뉴 더 담기</button><button class="primary" data-br-pay="true">결제하기</button></div>`);
}
function handleIceClick(d){
 if(d.brCategory!==undefined){state.brCategory=+d.brCategory;return render(),true;}
 if(d.brSize!==undefined){brChooseProduct(+d.brSize,'size');return true;}
 if(d.brCake!==undefined){brChooseProduct(+d.brCake,'cake');return true;}
 if(d.brContainer){state.brDraft.container=d.brContainer;return render(),true;}
 if(d.brFilter!==undefined){state.brFlavorFilter=+d.brFilter;state.brFlavorPage=0;return render(),true;}
 if(d.brPage!==undefined){state.brFlavorPage=+d.brPage;return render(),true;}
 if(d.brFlavor!==undefined){const i=+d.brFlavor,selected=state.brDraft.flavors,index=selected.indexOf(i);if(index>=0)selected.splice(index,1);else if(selected.length<brSelectedProduct().tastes)selected.push(i);else modal('플레이버 선택','선택 가능한 맛의 수를 초과했습니다.\n변경할 맛의 선택을 먼저 취소해 주세요.');if(document.querySelector('.overlay'))return true;return render(),true;}
 if(d.brRemove!==undefined){state.brDraft.flavors.splice(+d.brRemove,1);return render(),true;}
 if(d.brOption){state.brDraft[d.brOption]=['spoons','packTime','candles'].includes(d.brOption)?+d.value:d.value;return render(),true;}
 if(d.brQuantity){state.brDraft.quantity=Math.max(1,Math.min(5,state.brDraft.quantity+(+d.brQuantity)));return render(),true;}
 if(d.brBack){if(d.brBack==='flavors')state.stage=brSelectedProduct().pack?'menu':'br-container';else state.stage=state.brDraft.type==='cake'?'menu':'br-flavors';return render(),true;}
 if(d.brNext){
 const draft=state.brDraft,p=brSelectedProduct();
 if(d.brNext==='container'){if(!draft.container)return modal('용기 선택','콘 또는 컵을 선택해 주세요.'),true;state.stage='br-flavors';}
 if(d.brNext==='flavors'){if(draft.flavors.length!==p.tastes)return modal('플레이버 확인',`${p.name}은 ${p.tastes}가지 맛을 선택해야 합니다.\n현재 ${draft.flavors.length}가지 맛을 선택했습니다.`),true;state.stage='br-extra';}
 if(d.brNext==='extra'){
 if(!draft.use)return modal('이용 방법','매장 또는 포장을 선택해 주세요.'),true;
 if(draft.use==='포장'&&draft.packTime===null)return modal('포장 시간','포장 소요시간을 선택해 주세요.'),true;
 if(draft.spoons===null)return modal('스푼 수량','스푼 수량을 선택해 주세요.'),true;
 const names=draft.flavors.map(i=>brFlavors[i].name),details=[draft.type==='cake'?'케이크':draft.container,names.join(' / '),draft.use,draft.use==='포장'?`포장 ${draft.packTime}분 이내`:'',`스푼 ${draft.spoons}개`,draft.type==='cake'?`초 ${draft.candles}개`:'',`${draft.quantity}개`].filter(Boolean);
 const item={name:p.name,price:p.price*draft.quantity,description:details.join(' · '),brDraft:structuredClone(draft)};
 if(state.brEditing===null)state.cart.push(item);else state.cart[state.brEditing]=item;
 state.stage='menu';state.brDraft=null;state.brEditing=null;
 }
 return render(),true;
 }
 if(d.brEdit!==undefined){const i=+d.brEdit;state.brDraft=structuredClone(state.cart[i].brDraft);state.brEditing=i;state.brFlavorFilter=0;state.brFlavorPage=0;state.stage=state.brDraft.type==='cake'?'br-extra':'br-flavors';return render(),true;}
 if(d.brDelete!==undefined){state.cart.splice(+d.brDelete,1);return render(),true;}
 if(d.brReward){modal('해피포인트 적립','체험용 해피포인트로 적립하시겠습니까?',()=>{state.brReward=true;render();});return true;}
 if(d.brReceipt){state.brReceipt=d.brReceipt;return render(),true;}
 if(d.brPay){if(!state.cart.length)return modal('주문 확인','주문할 상품이 없습니다.'),true;if(!state.brReceipt)return modal('영수증 선택','영수증 출력 여부를 선택해 주세요.'),true;state.stage='pay';return render(),true;}
 return false;
}
