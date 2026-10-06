const STORAGE_KEY = 'samenThuisV2';
const QUOTE_KEY = 'samenThuisV2-quote';
const PAGES = ['today','agenda','tasks','challenges','programs','mealplan','groceries','deals','weather','stock','home','car','budget','dates','travel','extras','settings'];
const pageTitles = {today:'Vandaag',agenda:'Agenda',tasks:'Taken',challenges:'Challenges',programs:'Programma\'s',mealplan:'Weekmenu',groceries:'Boodschappen',deals:'Acties & aanbiedingen',weather:'Weer',stock:'Voorraad',home:'Woning',car:'Auto',budget:'Budget',dates:'Date Ideeën',travel:'Reizen',extras:'Extra',settings:'Instellingen'};
const PEOPLE = ['Kees','Daphne'];
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const todayKey = () => new Date().toISOString().slice(0,10);

function defaultState(){
  return {version:2,currentPage:'today',theme:'light',appearance:'normal',minimalColor:'#315f86',focus:'',tasks:[
    {id:uid(),text:'Wasmachine aanzetten',person:'Kees',category:'Huishouden',due:todayKey(),done:false,createdAt:Date.now()},
    {id:uid(),text:'Boodschappenlijst controleren',person:'Samen',category:'Boodschappen',due:todayKey(),done:false,createdAt:Date.now()}
  ],agenda:[],challenges:[
    {id:uid(),title:'3× bewegen deze week',category:'Sport',target:3,progress:1,points:50,done:false,checkins:[]},
    {id:uid(),title:'30 minuten lezen',category:'Lezen',target:1,progress:0,points:20,done:false,checkins:[]},
    {id:uid(),title:'Samen iets leuks doen',category:'Samen',target:1,progress:0,points:30,done:false,checkins:[]}
  ],programs:[],deals:[],meals:[],groceries:[],stock:[],home:[],budget:{monthly:0,spent:0,items:[]},dates:[],travel:[],car:{model:'',plate:'',year:'',mileage:'',apkDate:'',insuranceDate:'',maintenance:[],fuel:[],costs:[]},extras:[],history:[],dailyAnswers:{},priceReferences:[],priceReferenceSource:'',priceReferenceUpdatedAt:''};
}
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?merge(defaultState(),JSON.parse(raw)):defaultState()}catch{return defaultState()}}
function merge(base,saved){return {...base,...saved,tasks:Array.isArray(saved.tasks)?saved.tasks:base.tasks,challenges:Array.isArray(saved.challenges)?saved.challenges:base.challenges,programs:Array.isArray(saved.programs)?saved.programs:base.programs,meals:Array.isArray(saved.meals)?saved.meals:base.meals,groceries:Array.isArray(saved.groceries)?saved.groceries:base.groceries,agenda:Array.isArray(saved.agenda)?saved.agenda:base.agenda,deals:Array.isArray(saved.deals)?saved.deals:base.deals,stock:Array.isArray(saved.stock)?saved.stock:base.stock,home:Array.isArray(saved.home)?saved.home:base.home,dates:Array.isArray(saved.dates)?saved.dates:base.dates,travel:Array.isArray(saved.travel)?saved.travel:base.travel,extras:Array.isArray(saved.extras)?saved.extras:base.extras,budget:saved.budget||base.budget,car:saved.car||base.car,history:Array.isArray(saved.history)?saved.history:base.history,dailyAnswers:saved.dailyAnswers||base.dailyAnswers,priceReferences:Array.isArray(saved.priceReferences)?saved.priceReferences:base.priceReferences,priceReferenceSource:saved.priceReferenceSource||base.priceReferenceSource,priceReferenceUpdatedAt:saved.priceReferenceUpdatedAt||base.priceReferenceUpdatedAt}}
let state=loadState();
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
function saveState(message='Opgeslagen'){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); if(message) toast(message); return true}catch{toast('Opslag niet beschikbaar');return false}}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function toast(message){const r=$('#toast-region');if(!r)return;const t=document.createElement('div');t.className='toast';t.textContent=message;r.append(t);setTimeout(()=>t.remove(),2400)}
function showPage(page){if(!PAGES.includes(page))page='today';state.currentPage=page;PAGES.forEach(p=>$(`#page-${p}`)?.classList.toggle('is-active',p===page));$$('[data-page-link]').forEach(x=>x.classList.toggle('is-active',x.dataset.pageLink===page))}
function renderPage(page){({today:renderToday,tasks:renderTasksPage,challenges:renderChallenges,programs:renderPrograms,agenda:renderAgenda,mealplan:renderMeals,groceries:renderGroceries,deals:renderDeals,weather:renderWeather,stock:renderStock,home:renderHome,car:renderCar,budget:renderBudget,dates:renderDates,travel:renderTravel,extras:renderExtras,settings:renderSettings}[page]||function(){})()} 
function personAvatar(person){return person==='Daphne'?'D':'K'}
function taskMarkup(task,index){return `<li class="task-row ${task.done?'is-done':''}" draggable="true" data-id="${task.id}" data-index="${index}"><span class="drag">⠿</span><input class="task-check" type="checkbox" ${task.done?'checked':''} title="Afvinken"><span class="person-badge">${personAvatar(task.person)}</span><div class="task-content"><span class="task-text">${esc(task.text)}</span><small>${esc(task.category)} · ${task.due}</small></div><button class="icon-button delete-task" data-id="${task.id}" type="button">✕</button></li>`}

async function loadBrainyQuote(){
  try{
    const response=await fetch('https://www.brainyquote.com/link/quotebr.rss',{cache:'no-store'});
    if(!response.ok)return;
    const xml=new DOMParser().parseFromString(await response.text(),'application/xml');
    const item=xml.querySelector('item');
    if(!item)return;
    const title=item.querySelector('title')?.textContent?.trim()||'';
    const descriptionHtml=item.querySelector('description')?.textContent||'';
    const description=new DOMParser().parseFromString(descriptionHtml,'text/html').body.textContent.trim();
    if(!title&&!description)return;
    const genericTitle=/^(today'?s )?quote/i.test(title);
    const quote=genericTitle?description:title;
    const author=genericTitle||description===title?'':description;
    const markup=`<blockquote>${esc(quote)}</blockquote>${author?`<p>${esc(author)}</p>`:''}`;
    localStorage.setItem(QUOTE_KEY,JSON.stringify({date:todayKey(),markup}));
    if(state.currentPage==='today')renderToday();
  }catch(e){}
}
function renderQuote(){
  let cache;
  try{cache=JSON.parse(localStorage.getItem(QUOTE_KEY)||'null')}catch{cache=null}
  const quote=cache?.markup&&cache.date===todayKey()?`<div class="quote-content">${cache.markup}</div>`:'<p class="quote-offline">Quote wordt opgehaald zodra er verbinding is.</p>';
  return `<section class="panel quote-panel"><div class="panel-heading"><div><p class="eyebrow">DAGELIJKSE INSPIRATIE</p><h2>Quote van de dag</h2></div><span class="panel-icon">✦</span></div><blockquote id="daily-quote">${quote}</blockquote><p style="text-align:center;font-size:0.8rem;color:#666;margin-top:12px">Bron: <a href="https://www.brainyquote.com/link/quotebr.rss" target="_blank">BrainyQuote RSS</a></p></section>`;
}

function renderDailyQuestion(){
  const today=todayKey();
  const answers=state.dailyAnswers[today]||{};
  const bothAnswered=Boolean(answers.Kees&&answers.Daphne);
  const personButton=person=>answers[person]?`<button class="button button-secondary button-small" disabled>${bothAnswered?`${person}: antwoord vast`:`${person} beantwoord`}</button>`:`<button class="button button-primary button-small" data-answer-person="${person}">${person}</button>`;
  const displayAnswers=bothAnswered?`<div class="answer-grid"><article><span>Kees</span><p>${esc(answers.Kees)}</p></article><article><span>Daphne</span><p>${esc(answers.Daphne)}</p></article></div>`:'';
  return `<section class="panel question-panel"><div class="panel-heading"><div><p class="eyebrow">EVEN SAMEN STILSTAAN</p><h2>Vraag van de dag</h2></div><span class="panel-icon">♡</span></div><p id="daily-question"></p>${displayAnswers}<div class="button-row">${personButton('Kees')}${personButton('Daphne')}</div></section>`;
}

function openQuestion(person){
  const today=todayKey();
  const answers=state.dailyAnswers[today]||{};
  if(answers.Kees&&answers.Daphne){toast('Beide antwoorden staan vast');return}
  if(answers[person]){toast(`${person} heeft vandaag al geantwoord`);return}
  const dialog=$('#question-dialog');
  $('#question-title').textContent=`${person}, jouw antwoord`;
  $('#question-text').textContent=$('#daily-question').textContent;
  $('#question-person').value=person;
  $('#question-answer').value=answers[person]||'';
  dialog.showModal();
  $('#question-answer').focus();
}

function renderToday(){
  const today=todayKey();
  $('#today-date-label').textContent=new Date().toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
  $('#daily-question').textContent='Wat zou vandaag voor jou een fijne dag maken?';
  const open=state.tasks.filter(t=>!t.done);
  $('#task-list').innerHTML=open.slice(0,5).map(taskMarkup).join('')||'<li class="empty-row">Geen openstaande taken 🎉</li>';
  $('#task-count').textContent=open.length;
  $('#today-stats').innerHTML=`<article class="stat-tile"><span>Open taken</span><strong>${open.length}</strong><small>${state.tasks.length?`${state.tasks.filter(t=>t.done).length} afgerond`:'Nog geen taken'}</small></article>`;
  const challenge=state.challenges.find(c=>!c.done)||state.challenges[0];
  $('#today-challenge').innerHTML=challenge?`<div class="dashboard-challenge"><span class="tag">${esc(challenge.category||'Challenge')}</span><strong>${esc(challenge.title)}</strong><small>${challenge.progress}/${challenge.target} · ${challenge.points} 🏆</small></div>`:'';
  const agenda=state.agenda.filter(a=>!a.date||a.date>=today).sort((a,b)=>(a.date||'').localeCompare(b.date||'')).slice(0,3);
  $('#today-agenda').innerHTML=agenda.length?agenda.map(a=>`<div class="list-item"><strong>${esc(a.title)}</strong><small>${a.date||'Geen datum'} · ${personAvatar(a.person)}</small></div>`).join(''):'<p class="empty-row">Geen afspraken gepland</p>';
  $('#dashboard-grocery-count').textContent=`${state.groceries.filter(g=>!g.done).length} producten op de lijst`;
  const meals=state.meals.filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  $('#meal-preview').innerHTML=meals.length?meals.map(x=>`<div class="meal-item"><span class="meal-date">${x.date}</span><span>${esc(x.name)}</span></div>`).join(''):'<p class="empty-row">Plan je weekmenu</p>';
}

function addTask(text,person='Samen',category='Huishouden',due=todayKey()){
  if(!text.trim())return;
  state.tasks.unshift({id:uid(),text:text.trim(),person,category,due,done:false,createdAt:Date.now()});
  renderToday();
  renderTasksPage();
  saveState('Taak toegevoegd');
}

function renderTasksPage(){
  const list=$('#all-task-list');
  if(!list)return;
  list.innerHTML=state.tasks.map(taskMarkup).join('')||'<li class="empty-row">Nog geen taken.</li>';
  $('#task-open-count').textContent=state.tasks.filter(t=>!t.done).length;
}

function toggleTask(id){
  const t=state.tasks.find(x=>x.id===id);
  if(!t)return;
  t.done=!t.done;
  if(t.done)state.history.unshift({type:'task',text:t.text,at:new Date().toISOString()});
  renderToday();
  renderTasksPage();
  saveState(t.done?'Taak afgerond':'Taak geopend');
}

function deleteTask(id){
  state.tasks=state.tasks.filter(x=>x.id!==id);
  renderToday();
  renderTasksPage();
  saveState('Taak verwijderd');
}

function renderAgenda(){
  const el=$('#agenda-list');
  const items=[...state.agenda].sort((a,b)=>a.date.localeCompare(b.date));
  el.innerHTML=items.map((x,i)=>`<li class="list-card"><div><strong>${esc(x.title)}</strong><small>${x.date} · ${personAvatar(x.person)}</small></div><button class="icon-button" data-delete-item="agenda" data-id="${x.id}">✕</button></li>`).join('')||'<li class="empty-row">Geen afspraken.</li>';
}

function renderChallenges(){
  const el=$('#challenge-list');
  el.innerHTML=state.challenges.map(c=>{
    c.checkins=c.checkins||[];
    const streak=calcStreak(c.checkins);
    return `<article class="challenge-card"><div class="challenge-icon">🏆</div><div class="challenge-content"><strong>${esc(c.title)}</strong><small>${c.category}</small><div class="progress-bar"><div class="progress-fill" style="width:${(c.progress/c.target)*100}%"></div></div><p style="margin-top:8px;font-size:0.85rem">${c.progress}/${c.target} · ${c.points} punten · 🔥 Streak: ${streak}</p></div><button class="button button-small button-primary" data-check-challenge="${c.id}">Check-in vandaag</button></article>`;
  }).join('');
}

function calcStreak(days=[]){
  let n=0,d=new Date();
  if(!days.includes(todayKey()))d.setDate(d.getDate()-1);
  while(days.includes(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1)}
  return n;
}

function renderPrograms(){
  const el=$('#program-list');
  if(!el)return;
  el.innerHTML=state.programs.map(p=>`<article class="challenge-card"><div class="challenge-icon">📆</div><div class="challenge-content"><strong>${esc(p.title)}</strong><small>${p.category}</small></div><button class="icon-button" data-delete-item="programs" data-id="${p.id}">✕</button></article>`).join('')||'<li class="empty-row">Geen programma\'s.</li>';
}

function renderDeals(){
  const el=$('#deal-list');
  if(!el)return;
  const today=todayKey();
  el.innerHTML=state.deals.filter(d=>!d.valid||d.valid>=today).map(d=>`<li class="list-card"><div><strong>${esc(d.product)}</strong><small>${esc(d.store)} · €${Number(d.price).toFixed(2)}</small></div><button class="icon-button" data-delete-item="deals" data-id="${d.id}">✕</button></li>`).join('')||'<li class="empty-row">Geen aanbiedingen.</li>';
}

function renderWeather(){
  const el=$('#weather-current');
  if(!el)return;
  if(!weatherLoaded){el.innerHTML='<div class="empty-row">Haal weergegevens op om de verwachting te bekijken.</div>';return}
}

let weatherLoaded=null;
async function loadWeather(){
  const status=$('#weather-status');
  status.textContent='Weergegevens ophalen…';
  try{
    let lat=Number($('#weather-lat').value),lon=Number($('#weather-lon').value);
    const place=$('#weather-place').value.trim();
    const weatherUrl=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min`;
    const [r]=await Promise.all([fetch(weatherUrl)]);
    if(!r.ok)throw Error('Weerbron niet bereikbaar');
    const d=await r.json();
    weatherLoaded={current:[{icon:'🌡️',label:'Temperatuur',value:`${d.current.temperature_2m}°C`}]};
    status.textContent='Weergegevens geladen';
    renderWeather();
  }catch(e){
    status.textContent='Weer kon niet worden geladen.';
    weatherLoaded=null;
    renderWeather();
  }
}

function renderMeals(){
  const el=$('#meal-list');
  el.innerHTML=state.meals.sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`<li class="list-card"><div><strong>${esc(x.name)}</strong><small>${x.date} · ${personAvatar(x.person)}</small></div><button class="icon-button" data-delete-item="meals" data-id="${x.id}">✕</button></li>`).join('')||'<li class="empty-row">Geen maaltijden gepland.</li>';
}

function renderGroceries(){
  const el=$('#grocery-list');
  el.innerHTML=state.groceries.map(x=>`<li class="task-row ${x.done?'is-done':''}" data-id="${x.id}"><input class="grocery-check" type="checkbox" ${x.done?'checked':''} title="Afvinken"><span class="person-badge">${personAvatar(x.person)}</span><div class="task-content"><span class="task-text">${esc(x.name)}</span><small>${esc(x.category)}</small></div><button class="icon-button delete-task" data-id="${x.id}" type="button">✕</button></li>`).join('')||'<li class="empty-row">Geen boodschappen.</li>';
  renderPriceReferenceCard15('groceries');
}

function renderStock(){
  const el=$('#stock-list');
  el.innerHTML=state.stock.map(x=>`<li class="list-card ${Number(x.amount)<=Number(x.min||0)?'warning':''}"><div><strong>${esc(x.name)}</strong><small>${x.amount} ${x.unit} ${x.min?`(min: ${x.min})`:''}(min: 0)'}</small></div><button class="icon-button" data-delete-item="stock" data-id="${x.id}">✕</button></li>`).join('')||'<li class="empty-row">Geen voorraad.</li>';
  renderPriceReferenceCard15('stock');
}

function renderHome(){
  const el=$('#home-list');
  el.innerHTML=state.home.map(x=>`<li class="list-card"><div><strong>${esc(x.title)}</strong><small>${esc(x.type)} · ${personAvatar(x.person)} · ${esc(x.frequency)}</small></div><button class="icon-button" data-delete-item="home" data-id="${x.id}">✕</button></li>`).join('')||'<li class="empty-row">Geen wooningstaken.</li>';
}

function renderBudget(){
  const b=state.budget;
  $('#budget-spent').textContent=`€ ${Number(b.spent||0).toFixed(2)}`;
  $('#budget-limit').textContent=`€ ${Number(b.monthly||0).toFixed(2)}`;
  const pct=b.monthly?Math.min(100,(b.spent/b.monthly)*100):0;
  $('#budget-progress').style.width=pct+'%';
  $('#budget-list').innerHTML=(b.items||[]).map(x=>`<li class="list-card"><div><strong>${esc(x.description)}</strong><small>€${Number(x.amount).toFixed(2)}</small></div><button class="icon-button" data-delete-item="budget" data-id="${x.id}">✕</button></li>`).join('')||'<li class="empty-row">Geen uitgaven.</li>';
}

function renderDates(){
  renderSimpleList('#dates-list',state.dates,'dates','Ideeën toevoegen voor jullie volgende moment samen.');
}

function renderTravel(){
  renderSimpleList('#travel-list',state.travel,'travel','Voeg hier jullie reizen in.');
}

function renderExtras(){
  renderSimpleList('#extras-list',state.extras,'extras','Notities en ideeën.');
}

function renderSimpleList(selector,items,type,empty){
  const el=$(selector);
  el.innerHTML=items.map(x=>`<li class="list-card"><div><strong>${esc(x.title)}</strong><small>${esc(x.note||x.date||'')}</small></div><button class="icon-button" data-delete-item="${type}" data-id="${x.id}">✕</button></li>`).join('')||`<li class="empty-row">${empty}</li>`;
}

function renderCar(){
  const c=state.car||{};
  $('#car-model-display').textContent=c.model||'Nog niet ingevuld';
  $('#car-plate-display').textContent=c.plate||'—';
  $('#car-year-display').textContent=c.year||'—';
  $('#car-model').value=c.model||'';
  $('#car-plate').value=c.plate||'';
  $('#car-year').value=c.year||'';
}

function renderSettings(){
  const backup=JSON.stringify(state,null,2);
  $('#settings-summary').textContent=`${state.tasks.length} taken · ${state.groceries.length} boodschappen · ${state.meals.length} maaltijden`;
  $('#export-btn').onclick=()=>exportData();
  $('#import-file').onchange=e=>importData(e.target.files[0]);
}

function addGeneric(type,obj){
  state[type].push({id:uid(),...obj});
  renderPage(state.currentPage);
  saveState();
}

function removeGeneric(type,id){
  if(type==='budget'){
    state.budget.items=state.budget.items.filter(x=>x.id!==id);
    state.budget.spent=state.budget.items.reduce((s,x)=>s+Number(x.amount||0),0);
  }else{
    state[type]=state[type].filter(x=>x.id!==id);
  }
  renderPage(state.currentPage);
  saveState();
}

function applyTheme(){
  const root=document.documentElement;
  const appearance=state.appearance||'normal';
  const color=state.minimalColor||'#315f86';
  root.dataset.theme=state.theme;
  root.dataset.appearance=appearance;
  root.style.setProperty('--custom-color',color);
}

function closeMenu(){
  $('.sidebar')?.classList.remove('is-open');
  $('#mobile-scrim')?.classList.remove('is-visible');
  $('#menu-toggle')?.setAttribute('aria-expanded','false');
}

function bindForms(){
  $('#focus-form')&&($('#focus-form').onsubmit=e=>{e.preventDefault();state.focus=$('#focus-input').value.trim();$('#focus-input').value='';renderToday();saveState('Focus opgeslagen')});
  
  $('#task-form')&&($('#task-form').onsubmit=e=>{e.preventDefault();addTask($('#task-input').value,$('#task-person').value,$('#task-category').value,$('#task-due').value||todayKey());$('#task-input').value=''});
  
  $('#agenda-form')&&($('#agenda-form').onsubmit=e=>{e.preventDefault();addGeneric('agenda',{title:$('#agenda-title').value,date:$('#agenda-date').value,person:$('#agenda-person').value});e.target.reset()});
  
  $('#challenge-form')&&($('#challenge-form').onsubmit=e=>{e.preventDefault();addGeneric('challenges',{title:$('#challenge-title').value,category:$('#challenge-category').value,target:Number($('#challenge-target').value)||1,progress:0,points:Number($('#challenge-points').value)||10,done:false,checkins:[]});e.target.reset()});
  
  $('#deal-form')&&($('#deal-form').onsubmit=e=>{e.preventDefault();addGeneric('deals',{product:$('#deal-product').value.trim(),store:$('#deal-store').value.trim(),price:Number($('#deal-price').value),valid:$('#deal-valid').value});e.target.reset()});
  
  $('#program-form')&&($('#program-form').onsubmit=e=>{e.preventDefault();addGeneric('programs',{title:$('#program-title').value.trim(),category:$('#program-category').value.trim(),steps:$('#program-steps').value.split('\n').map(s=>s.trim()).filter(Boolean)});e.target.reset()});
  
  $('#meal-form')&&($('#meal-form').onsubmit=e=>{e.preventDefault();addGeneric('meals',{name:$('#meal-name').value,date:$('#meal-date').value,person:$('#meal-person').value});e.target.reset()});
  
  $('#grocery-form')&&($('#grocery-form').onsubmit=e=>{e.preventDefault();addGeneric('groceries',{name:$('#grocery-name').value,category:$('#grocery-category').value,person:$('#grocery-person').value,done:false});e.target.reset()});
  
  $('#stock-form')&&($('#stock-form').onsubmit=e=>{e.preventDefault();addGeneric('stock',{name:$('#stock-name').value,amount:$('#stock-amount').value,unit:$('#stock-unit').value,min:$('#stock-min').value});e.target.reset()});
  
  $('#home-form')&&($('#home-form').onsubmit=e=>{e.preventDefault();addGeneric('home',{title:$('#home-title').value,type:$('#home-type').value,person:$('#home-person').value,frequency:$('#home-frequency').value});e.target.reset()});
  
  $('#car-profile-form')&&($('#car-profile-form').onsubmit=e=>{e.preventDefault();state.car=state.car||{};Object.assign(state.car,{model:$('#car-model').value.trim(),plate:$('#car-plate').value.trim(),year:$('#car-year').value});renderCar();saveState()});
  
  $('#budget-form')&&($('#budget-form').onsubmit=e=>{e.preventDefault();const amount=Number($('#budget-amount').value)||0;state.budget.monthly=Number($('#budget-monthly').value)||state.budget.monthly;state.budget.items=state.budget.items||[];state.budget.items.push({id:uid(),description:$('#budget-desc').value,amount});state.budget.spent=(state.budget.spent||0)+amount;renderBudget();saveState();e.target.reset()});
  
  $('#simple-form')&&($('#simple-form').onsubmit=e=>{e.preventDefault();const page=state.currentPage;const map={dates:'dates',travel:'travel',extras:'extras'};const key=map[page];if(!key)return;addGeneric(key,{title:$('#simple-title').value,note:$('#simple-note').value});e.target.reset()});
  
  $$('.price-search-form').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const input=f.querySelector('input');const q=input.value.trim();if(!q)return;toast('Prijzen zoeken…');try{const found=await searchPrijsfavoriet(q);if(!found.length){toast('Geen prijzen gevonden');return}addPriceReferences(found);toast(`${found.length} prijzen toegevoegd`)}catch{toast('Prijsfavoriet niet bereikbaar')}input.value=''});
  $('#question-form')&&($('#question-form').onsubmit=e=>{e.preventDefault();const person=$('#question-person').value;const answer=$('#question-answer').value.trim();if(!answer)return;state.dailyAnswers=state.dailyAnswers||{};state.dailyAnswers[todayKey()]=state.dailyAnswers[todayKey()]||{};state.dailyAnswers[todayKey()][person]=answer;renderToday();saveState(`${person} antwoord opgeslagen`);$('#question-dialog').close()});
}

function handleClicks(e){
  if(e.target.closest('[data-page-link]')){const page=e.target.closest('[data-page-link]').dataset.pageLink;showPage(page);renderPage(page);closeMenu();return}
  if(e.target.closest('[data-delete-item]')){const btn=e.target.closest('[data-delete-item]');removeGeneric(btn.dataset.deleteItem,btn.dataset.id);return}
  if(e.target.classList.contains('delete-task')){deleteTask(e.target.dataset.id);return}
  if(e.target.hasAttribute('data-answer-person')){openQuestion(e.target.dataset.answerPerson);return}
  if(e.target.hasAttribute('data-check-challenge')){const c=state.challenges.find(x=>x.id===e.target.dataset.checkChallenge);if(c){c.checkins=c.checkins||[];if(!c.checkins.includes(todayKey()))c.checkins.push(todayKey());c.progress=Math.min(c.target,c.checkins.length);renderChallenges();saveState('Challenge geupdatet')}return}
  if(e.target.hasAttribute('data-remove-price')){state.priceReferences=state.priceReferences.filter(x=>x.id!==e.target.dataset.removePrice);renderPriceCards15();saveState('Prijs verwijderd');return}
  if(e.target.closest('[data-close-dialog]')){$('#question-dialog').close();return}
  if(e.target.id==='menu-toggle'){$('.sidebar').classList.toggle('is-open');$('#mobile-scrim').classList.toggle('is-visible');return}
  if(e.target.id==='mobile-scrim'){closeMenu();return}
}

function handleChanges(e){
  if(e.target.classList.contains('task-check')){toggleTask(e.target.closest('[data-id]').dataset.id);return}
  if(e.target.classList.contains('grocery-check')){const g=state.groceries.find(x=>x.id===e.target.closest('[data-id]').dataset.id);if(g)g.done=e.target.checked;renderGroceries();saveState();return}
  if(e.target.id==='theme-select'){state.theme=e.target.value;applyTheme();saveState();return}
  if(e.target.id==='appearance-select'){state.appearance=e.target.value;applyTheme();saveState();return}
  if(e.target.id==='minimal-color'){state.minimalColor=e.target.value;applyTheme();saveState();$('#minimal-color-row').hidden=state.appearance!=='minimal';return}
}

function setupDnD(){
  let dragged=null;
  let draggedFrom=-1;
  document.addEventListener('dragstart',e=>{
    const row=e.target.closest('.task-row[draggable]');
    if(row){dragged=row;draggedFrom=parseInt(row.dataset.index);e.dataTransfer.effectAllowed='move'}
  });
  document.addEventListener('dragover',e=>{
    if(dragged){e.preventDefault();e.dataTransfer.dropEffect='move'}
  });
  document.addEventListener('drop',e=>{
    if(!dragged)return;
    e.preventDefault();
    const dropZone=e.target.closest('.task-row[draggable]');
    if(!dropZone)return;
    const draggedTo=parseInt(dropZone.dataset.index);
    if(draggedFrom===draggedTo)return;
    const [removed]=[...state.tasks].splice(draggedFrom,1);
    state.tasks.splice(draggedTo,0,removed);
    renderTasksPage();
    saveState('Taak verplaatst');
  });
  document.addEventListener('dragend',()=>{dragged=null;draggedFrom=-1});
}

function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`samen-thuis-backup-${todayKey()}.json`;
  a.click();
  toast('Backup gedownload');
}

function importData(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      state=merge(defaultState(),JSON.parse(reader.result));
      applyTheme();
      renderPage(state.currentPage);
      saveState('Backup geïmporteerd');
      renderSettings();
    }catch(e){
      toast('Backup kon niet worden geladen');
    }
  };
  reader.readAsText(file);
}

function init(){
  applyTheme();
  bindForms();
  setupDnD();
  document.addEventListener('click',handleClicks);
  document.addEventListener('change',handleChanges);
  showPage(state.currentPage);
  renderPage(state.currentPage);
  loadBrainyQuote();
  $('#minimal-color-row').hidden=state.appearance!=='minimal';
  if($('#theme-select'))$('#theme-select').value=state.theme;
  if($('#appearance-select'))$('#appearance-select').value=state.appearance;
  if($('#minimal-color'))$('#minimal-color').value=state.minimalColor;
}

document.addEventListener('DOMContentLoaded',init);


/* Prijsfavoriet API integratie */
const PRIJSFAVORIET_URL='https://www.prijsfavoriet.nl';
const priceNorm15=(s='')=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const euro15=n=>n==null||isNaN(n)?'–':new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(Number(n));
function normalizePriceResults15(data){
  const list=Array.isArray(data)?data:(data&&(data.products||data.results||data.items))||[];
  const out=[];
  list.forEach(p=>{
    const product=p.product||p.name||p.title;
    const offers=Array.isArray(p.prices)?p.prices:Array.isArray(p.offers)?p.offers:Array.isArray(p.stores)?p.stores:[p];
    offers.forEach(o=>{
      const price=Number(String(o.price??o.prijs??o.floorPrice??'').replace(',','.'));
      if(!product||!isFinite(price)||price<=0)return;
      out.push({id:uid(),product:String(product),brand:p.brand||p.merk||'',store:o.store||o.supermarket||o.winkel||p.store||'',quantity:p.quantity||p.unit||o.quantity||'stuk',floorPrice:price,goodDealPrice:null,updatedAt:todayKey()});
    });
  });
  return out;
}
async function searchPrijsfavoriet(query){
  const res=await fetch(`${PRIJSFAVORIET_URL}/api/search?q=${encodeURIComponent(query)}`,{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error('Prijsfavoriet fout');
  return normalizePriceResults15(await res.json());
}
function addPriceReferences(items){
  state.priceReferences=state.priceReferences||[];
  items.forEach(n=>{const i=state.priceReferences.findIndex(x=>priceNorm15(x.product)===priceNorm15(n.product)&&(x.store||'')===(n.store||''));if(i>=0)state.priceReferences[i]={...n,id:state.priceReferences[i].id};else state.priceReferences.push(n)});
  state.priceReferenceSource='Prijsfavoriet';
  state.priceReferenceUpdatedAt=todayKey();
  renderPriceCards15();
  saveState();
}
function bestRefs15(title=''){
  const q=priceNorm15(title);
  if(!q)return [];
  const exact=[],loose=[];
  (state.priceReferences||[]).forEach(r=>{
    const p=priceNorm15(r.product);
    if(!p)return;
    if(q===p||q.includes(p)||p.includes(q))exact.push(r);
    else{const words=p.split(' ').filter(w=>w.length>3);if(words.length&&words.some(w=>q.includes(w)))loose.push(r)}
  });
  return (exact.length?exact:loose).sort((a,b)=>(a.floorPrice??999)-(b.floorPrice??999));
}
function priceBadge15(ref){
  if(!ref)return '';
  return `<span class="tag green">Bodem ${euro15(ref.floorPrice)} / ${esc(ref.quantity||'stuk')}</span>`+(ref.store?` <span class="tag">${esc(ref.store)}</span>`:'')+(ref.goodDealPrice!=null?` <span class="tag">Goede deal ≤ ${euro15(ref.goodDealPrice)}</span>`:'');
}
function renderPriceReferenceCard15(page=state.currentPage){
  const el=$(`#price-reference-${page}`);
  if(!el)return;
  const items=page==='groceries'?state.groceries:state.stock;
  const matched=items.map(item=>({item,refs:bestRefs15(item.name||item.title||'')})).filter(x=>x.refs.length);
  el.innerHTML=`<div class="panel-heading"><div><p class="eyebrow">PRIJSFAVORIET</p><h3>Prijsreferentie</h3></div><span class="tag green">${(state.priceReferences||[]).length} prijzen</span></div>
  <form class="price-search-form form-grid"><input placeholder="Zoek productprijs, bijv. melk" required><button class="button button-primary">Zoek prijzen</button></form>
  <p class="muted">Bron: ${esc(state.priceReferenceSource||'Prijsfavoriet')} · bijgewerkt ${esc(state.priceReferenceUpdatedAt||'onbekend')}.</p>
  ${matched.length?`<ul class="data-list">${matched.slice(0,12).map(x=>`<li class="list-card"><div><strong>${esc(x.item.name||x.item.title)}</strong><small>${priceBadge15(x.refs[0])}${x.refs.length>1?` · ${x.refs.length} passende referenties`:''}</small></div></li>`).join('')}</ul>`:'<p class="muted">Nog geen producten gekoppeld aan prijsreferenties.</p>'}
  ${(state.priceReferences||[]).length?`<ul class="data-list">${state.priceReferences.slice(0,20).map(r=>`<li class="list-card"><div><strong>${esc(r.product)}</strong><small>${priceBadge15(r)}</small></div><button class="icon-button" type="button" data-remove-price="${r.id}">✕</button></li>`).join('')}</ul>`:''}`;
  bindForms();
}
function renderPriceCards15(){renderPriceReferenceCard15('groceries');renderPriceReferenceCard15('stock')}
