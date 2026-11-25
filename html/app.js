'use strict';

const svgPaths = {
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>',
  flame:'<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-6 0 3-2 4-2 4S16 7 10 2c1 5-5 7-5 13a7 7 0 0 0 7 7Z"/>',
  reset:'<path d="M3 11a9 9 0 1 1 3 7"/><path d="M3 3v8h8"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  layers:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
  monitor:'<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M8 22h8m-4-4v4"/>',
  gauge:'<path d="M12 14l4-4"/><path d="M4.9 19a9 9 0 1 1 14.2 0H4.9Z"/><path d="M12 4v2m-7 5 2 1m12-1-2 1"/>',
  check:'<path d="m5 12 5 5L20 7"/>',
  circle:'<circle cx="12" cy="12" r="9"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18h1.7a2 2 0 0 0 1.7-3c-.6-.9.1-2 1.2-2H18c4 0 5-5 3-8a9 9 0 0 0-9-5Z"/><circle cx="7" cy="12" r=".7"/><circle cx="10" cy="8" r=".7"/><circle cx="15" cy="8" r=".7"/><circle cx="18" cy="12" r=".7"/>',
  sliders:'<path d="M4 7h16M4 17h16M9 4v6m6 4v6"/>',
  person:'<circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  car:'<path d="M5 11 7 5h10l2 6M3 11h18v8H3zM5 19v2m14-2v2"/><path d="M6 15h2m8 0h2"/>',
  sparkle:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>'
};
const icon = (name) => `<svg aria-hidden="true" viewBox="0 0 24 24">${svgPaths[name] || svgPaths.circle}</svg>`;
const $ = id => document.getElementById(id);
document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});

const profiles = [
  {id:'default',name:'Nashville Domyślne',badge:'DOMYŚLNE',icon:'monitor',description:'Oryginalna grafika Project Nashville. Pełna jakość geometrii, standardowe efekty i domyślny LOD.',tags:['Pełne detale','Standardowa grafika','LOD 1.00x']},
  {id:'balanced',name:'Zbalansowany Boost',badge:'~5–10 FPS*',icon:'gauge',description:'Delikatnie niższy LOD przy zachowaniu dobrego wyglądu miasta. Dobry kompromis między płynnością i detalami.',tags:['Dobry balans','Płynniejszy obraz','LOD 0.85x']},
  {id:'performance',name:'Wysoka Wydajność',badge:'~15–25 FPS*',icon:'bolt',description:'Mniejszy zasięg detali oraz obniżone budżety modeli postaci i pojazdów, aby odciążyć rendering.',tags:['Niższy zasięg detali','Budżety modeli','LOD 0.65x']},
  {id:'potato',name:'Ultra Low / Potato',badge:'~30–45 FPS*',icon:'flame',description:'Dla słabszych komputerów. Agresywny LOD, ograniczone budżety modeli i wybrane dekoracje obrazu.',tags:['Tryb lekki','Mniej dekoracji','LOD 0.45x']}
];
const filters = [
  {id:'none',name:'Bez filtra',description:'Standardowe barwy i wygląd serwera.',preview:'none'},
  {id:'cinematic',name:'Filmowy',description:'Delikatny, bardziej filmowy charakter obrazu.',preview:'cinematic'},
  {id:'vivid',name:'Żywe kolory',description:'Mocniejsza stylizacja kolorystyczna.',preview:'vivid'},
  {id:'mono',name:'Czerń i biel',description:'Monochromatyczny klimat nagrań.',preview:'mono'},
  {id:'cold',name:'Chłodny klimat',description:'Subtelnie chłodniejszy odbiór sceny.',preview:'cold'}
];
const defaults={profil:'default',filtr:'none',lod:1,pedBudget:false,vehicleBudget:false,hideDecals:false};
let state={...defaults},activeTab='profiles',toastTimeout=null,open=false;

const nativeNui=typeof GetParentResourceName === 'function';
const resource=nativeNui?GetParentResourceName():'';
async function sendNui(endpoint,data={}){
  if(!nativeNui){
    // Podgląd w przeglądarce, bez połączenia z grą.
    if(endpoint==='profil') setPreviewProfile(data.id);
    if(endpoint==='filtr') state.filtr=data.id;
    if(endpoint==='zaawansowane') state={...state,...data,profil:'custom'};
    if(endpoint==='reset') state={...defaults};
    if(endpoint==='zamknij') hideUi();
    render();return {ok:true,settings:state};
  }
  try{
    const response=await fetch(`https://${resource}/${endpoint}`,{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(data)});
    if(!response.ok) throw new Error('Błąd komunikacji z klientem');
    const answer=await response.json();
    if(answer?.settings) state=normalise(answer.settings);
    if(!answer?.ok) throw new Error('Nie udało się zastosować ustawień');
    render();return answer;
  }catch(e){showToast('Nie udało się zapisać ustawień');return {ok:false};}
}
function setPreviewProfile(id){const p={default:[1,false,false,false],balanced:[.85,false,false,false],performance:[.65,true,true,false],potato:[.45,true,true,true]}[id];if(!p)return;state={...state,profil:id,lod:p[0],pedBudget:p[1],vehicleBudget:p[2],hideDecals:p[3]};}
function normalise(s){return {...defaults,...s};}
function showToast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),2100);}
function updateHeader(){const selected=profiles.find(p=>p.id===state.profil);$('currentProfile').textContent=(selected?.name||'Własny').toUpperCase();$('currentFilter').textContent=(filters.find(f=>f.id===state.filtr)?.name||'BRAK').toUpperCase();}
function matches(item,search){return `${item.name} ${item.description} ${(item.tags||[]).join(' ')}`.toLocaleLowerCase('pl').includes(search);}
function renderProfiles(){const search=$('searchInput').value.trim().toLocaleLowerCase('pl');const matchesProfiles=profiles.filter(item=>matches(item,search));$('profileList').innerHTML=matchesProfiles.length?matchesProfiles.map(p=>{
  const active=state.profil===p.id;
  return `<article class="profile-card ${active?'selected':''}"><div class="profile-icon">${icon(p.icon)}</div><div class="profile-main"><h3>${p.name}</h3><p>${p.description}</p><div class="features">${p.tags.map(t=>`<span class="feature">${t}</span>`).join('')}</div></div><div class="profile-right"><span class="fps-badge">${p.badge}</span><button class="choose-btn" data-profile="${p.id}" ${active?'disabled':''}>${icon(active?'check':'circle')}${active?'AKTYWNY':'WYBIERZ'}</button></div></article>`;
}).join(''):'<div class="empty">Nie znaleziono profili pasujących do wyszukiwania.</div>';
$('profileList').querySelectorAll('[data-profile]').forEach(b=>b.addEventListener('click',async()=>{const r=await sendNui('profil',{id:b.dataset.profile});if(r.ok)showToast('Profil graficzny został zmieniony');}));}
function renderFilters(){const search=$('searchInput').value.trim().toLocaleLowerCase('pl');const matchesFilters=filters.filter(item=>matches(item,search));$('filterGrid').innerHTML=matchesFilters.length?matchesFilters.map(f=>`<button class="filter-card ${state.filtr===f.id?'selected':''}" data-filter="${f.id}"><div class="filter-preview preview-${f.preview}">${icon('palette')}</div><div class="filter-copy"><strong>${f.name}</strong><p>${f.description}</p></div><div class="filter-check">${icon(state.filtr===f.id?'check':'circle')}</div></button>`).join(''):'<div class="empty">Nie znaleziono filtrów.</div>';
$('filterGrid').querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',async()=>{const r=await sendNui('filtr',{id:b.dataset.filter});if(r.ok)showToast('Filtr kolorów został zmieniony');}));}
function renderAdvanced(){const lod=Number(state.lod)||1;$('lodSlider').value=lod;$('lodValue').textContent=lod.toFixed(2)+'x';$('pedBudget').checked=!!state.pedBudget;$('vehicleBudget').checked=!!state.vehicleBudget;$('hideDecals').checked=!!state.hideDecals;}
function render(){updateHeader();renderProfiles();renderFilters();renderAdvanced();}
function selectTab(tab){activeTab=tab;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id===`${tab}Section`));}
function showUi(settings,fps){state=normalise(settings||state);open=true;const overlay=$('overlay');overlay.classList.add('visible');overlay.setAttribute('aria-hidden','false');$('fpsNumber').textContent=typeof fps==='number'?fps:'—';$('searchInput').value='';selectTab('profiles');render();}
function hideUi(){open=false;const overlay=$('overlay');overlay.classList.remove('visible');overlay.setAttribute('aria-hidden','true');}
window.addEventListener('message',e=>{const d=e.data||{};if(d.action==='open')showUi(d.settings,d.fps);if(d.action==='close')hideUi();if(d.action==='state'){state=normalise(d.settings);render();}if(d.action==='fps')$('fpsNumber').textContent=d.fps;});
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.tab)));
$('searchInput').addEventListener('input',()=>{if(activeTab==='profiles')renderProfiles();else if(activeTab==='filters')renderFilters();});
$('closeButton').addEventListener('click',()=>sendNui('zamknij'));
$('resetButton').addEventListener('click',async()=>{const r=await sendNui('reset');if(r.ok)showToast('Przywrócono ustawienia domyślne');});
$('potatoButton').addEventListener('click',async()=>{const r=await sendNui('profil',{id:'potato'});if(r.ok)showToast('Aktywowano tryb Potato');});
$('pvpButton').addEventListener('click',async()=>{const r=await sendNui('profil',{id:'performance'});if(r.ok)showToast('Włączono profil Wysoka Wydajność');});
$('lodSlider').addEventListener('input',e=>$('lodValue').textContent=Number(e.target.value).toFixed(2)+'x');
$('saveAdvanced').addEventListener('click',async()=>{const r=await sendNui('zaawansowane',{lod:Number($('lodSlider').value),pedBudget:$('pedBudget').checked,vehicleBudget:$('vehicleBudget').checked,hideDecals:$('hideDecals').checked});if(r.ok)showToast('Zapisano własny profil wydajności');});
if(!nativeNui){showUi(defaults,90);}
