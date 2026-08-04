const VERSION = "100";
const DATA_VERSION = "Palworld 1.0 / 2026-07-15 community game-data snapshot";
const DATA_SOURCES = {
  pals: "https://raw.githubusercontent.com/bowenchen-1/palworld-guide/bbe68288a4404ea22467d53b73aee15a70abaa97/data/sources/paldb-1.0-20260715.json",
  localization: "https://raw.githubusercontent.com/zaigie/palworld-server-tool/f45a48ef25ce08a5311a27e55b17062ba0bb4362/web/src/assets/pal.json",
};
const CACHE_KEYS = {
  pals: `pal-breeding-note:pals:${VERSION}`,
  localization: `pal-breeding-note:localization:${VERSION}`,
  records: room => `pal-breeding-records:${room}`,
  meta: room => `pal-breeding-meta:${room}`,
  currentUser: room => `pal-breeding-current-user:${room}`,
};
const DEFAULT_USERS = ["福冨", "森井"];
const DEFAULT_COLORS = ["#50d3a5", "#63b9ef", "#f5c85b", "#a78bfa", "#ff9d68", "#ff7384"];
const UNKNOWN_PAL_ICON = "assets/unknown-pal-v8.png";
const PLAIN_EGG_ICON = "assets/plain-egg.png";
const MUTATION_EGG_ICON = "assets/mutation-egg-v59.svg";
const ELEMENTS = ["無属性", "炎属性", "水属性", "草属性", "雷属性", "氷属性", "地属性", "闇属性", "竜属性"];
const WORKS = ["火おこし", "水やり", "種まき", "発電", "手作業", "採集", "伐採", "採掘", "製薬", "冷却", "運搬", "牧場"];
const ELEMENT_MAP = { "无":"無属性", "無":"無属性", "火":"炎属性", "炎":"炎属性", "水":"水属性", "草":"草属性", "雷":"雷属性", "冰":"氷属性", "氷":"氷属性", "地":"地属性", "暗":"闇属性", "闇":"闇属性", "龙":"竜属性", "龍":"竜属性", "竜":"竜属性" };
const WORK_MAP = { "生火":"火おこし", "火おこし":"火おこし", "浇水":"水やり", "水やり":"水やり", "播种":"種まき", "種まき":"種まき", "发电":"発電", "発電":"発電", "手工":"手作業", "手作業":"手作業", "采集":"採集", "採集":"採集", "伐木":"伐採", "伐採":"伐採", "采矿":"採掘", "採掘":"採掘", "制药":"製薬", "製薬":"製薬", "冷却":"冷却", "搬运":"運搬", "運搬":"運搬", "牧场":"牧場", "牧場":"牧場" };
const JP_NAME_OVERRIDES = {
  "Faleris Aqua": "イシス",
  "Bulldoggy": "ドスコイヌ",
  "Queen Bee": "クインビーナ",
  "Beakon": "ライバード",
};
const SELF_ONLY_EN = new Set([
  "Jetragon", "Frostallion", "Paladius", "Necromus", "Bellanoir", "Bellanoir Libero", "Blazamut Ryu", "Xenolord",
  "Relaxaurus Lux", "Incineram Noct", "Mau Cryst", "Vanwyrm Cryst", "Eikthyrdeer Terra", "Elphidran Aqua", "Pyrin Noct",
  "Mammorest Cryst", "Mossanda Lux", "Dinossom Lux", "Jolthog Cryst", "Frostallion Noct", "Kingpaca Cryst", "Lyleen Noct",
  "Leezpunk Ignis", "Blazehowl Noct", "Robinquill Terra", "Broncherry Aqua", "Surfent Terra", "Gobfin Ignis", "Suzaku Aqua",
  "Reptyro Cryst", "Hangyu Cryst", "Lyleen", "Faleris", "Grizzbolt", "Orserk", "Shadowbeak"
]);
const GENDER_DEPENDENT_PAIR = new Set(["Katress", "Wixen"]);
const EGG_BASES = [
  { name:"平凡なタマゴ", key:"plain", icon:"assets/eggs/plain.png" },
  { name:"熱を帯びたタマゴ", key:"scorching", icon:"assets/eggs/scorching.png" },
  { name:"しめったタマゴ", key:"damp", icon:"assets/eggs/damp.png" },
  { name:"新緑のタマゴ", key:"verdant", icon:"assets/eggs/verdant.png" },
  { name:"ビリビリのタマゴ", key:"electric", icon:"assets/eggs/electric.png" },
  { name:"ゴツゴツしたタマゴ", key:"rocky", icon:"assets/eggs/rocky.png" },
  { name:"凍てつくタマゴ", key:"frozen", icon:"assets/eggs/frozen.png" },
  { name:"暗黒タマゴ", key:"dark", icon:"assets/eggs/dark.png" },
  { name:"竜のタマゴ", key:"dragon", icon:"assets/eggs/dragon.png" },
];
const EGG_TYPES = EGG_BASES.flatMap(base => [
  { ...base, size:"通常", name:base.name },
  { ...base, size:"デカ", name:base.name.replace("タマゴ", "デカタマゴ") },
  { ...base, size:"キョダイ", name:base.name.replace("タマゴ", "キョダイタマゴ") },
]);

const state = {
  roomId: resolveRoomId(), currentView: "records", currentUser: "", users: [], userColors: {}, worldName: "", records: [], pals: [],
  palById: new Map(), palByKey: new Map(), palByName: new Map(), dataState: "loading", dataError: "", firebaseState: "loading", firebase: null,
  selectedRecordId: "", selectedPalId: "", pickerTarget: "", pickerValues: {}, breedingMode: "parents", matrix: new Map(), reverseMatrix: new Map(),
  matrixReady: false, paldexLimit: 60, brokenPalIds: new Set(), recordSearch: "", recordStatus: "", recordSort: "updatedDesc", reviewFilter: "",
};
const PAGE_META = {
  records: ["BREEDING RECORDS", "配合記録", "このワールドで試した配合を、みんなで記録・共有します。"],
  breeding: ["BREEDING CALCULATOR", "配合検索", "1.0配合データを調べ、必要な組み合わせをそのまま記録できます。"],
  paldex: ["PALDECK", "パル図鑑", "パル画像・属性・作業適性と配合関係をまとめて確認します。"],
  review: ["REVIEW WORKBOARD", "確認作業", "入力や修正が必要な配合記録だけを整理して表示します。"],
  favorites: ["MY FAVORITES", "お気に入り", "現在のユーザーが保存した配合記録です。"],
  settings: ["WORLD SETTINGS", "設定", "ワールド・ユーザー・データの状態を管理します。"],
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const byId = id => document.getElementById(id);
function resolveRoomId(){const params=new URLSearchParams(location.hash.replace(/^#/,""));let room=params.get("room")?.trim();if(!room){room=crypto.randomUUID().replace(/-/g,"").slice(0,12);params.set("room",room);history.replaceState(null,"",`${location.pathname}${location.search}#${params}`);}return room;}
function normalizeText(value){return String(value||"").normalize("NFKC").replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60)).toLowerCase().replace(/[\s\u3000・_\-ーｰ'’.]/g,"");}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function safeJsonParse(value,fallback){try{return JSON.parse(value);}catch{return fallback;}}
function unique(list){return Array.from(new Set(list.filter(Boolean)));}
function pairKey(a,b){return [String(a),String(b)].sort().join("::");}
function formatDate(value,withYear=false){const date=new Date(Number(value||0));if(Number.isNaN(date.getTime()))return "—";return new Intl.DateTimeFormat("ja-JP",withYear?{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}:{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(date);}
function hashColor(name,index=0){if(DEFAULT_COLORS[index])return DEFAULT_COLORS[index];let sum=0;for(const c of String(name))sum+=c.charCodeAt(0);return DEFAULT_COLORS[sum%DEFAULT_COLORS.length];}
function normalizePalNumber(value){const raw=String(value||"").trim().toUpperCase();const match=raw.match(/^(\d+)([A-Z]*)$/);return match?`${match[1].padStart(3,"0")}${match[2]}`:raw;}
function palIconUrl(number){return `https://raw.githubusercontent.com/mlg404/palworld-paldex-api/main/public/images/paldeck/${normalizePalNumber(number)}.png`;}
function dispatchChange(element){element?.dispatchEvent(new Event("change",{bubbles:true}));element?.dispatchEvent(new Event("input",{bubbles:true}));}
function toast(message,type="normal"){const el=document.createElement("div");el.className=`toast${type==="error"?" is-error":""}`;el.textContent=message;byId("toastRegion").appendChild(el);setTimeout(()=>el.remove(),3400);}
async function fetchJsonCached(url,cacheKey){try{const response=await fetch(url,{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();localStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),data}));return{data,source:"network"};}catch(error){const cached=safeJsonParse(localStorage.getItem(cacheKey),null);if(cached?.data)return{data:cached.data,source:"cache",error};throw error;}}
function buildTranslationMap(localization){const en=localization?.en||{},ja=localization?.ja||localization?.jp||{},map=new Map();for(const[id,enNameRaw]of Object.entries(en)){const enName=String(enNameRaw||"").replace(/\(BOSS\)|\(Raid\)/gi,"").trim(),jaName=String(ja[id]||"").replace(/（ボス）|\(BOSS\)|（レイド）|\(Raid\)/gi,"").trim();if(enName&&jaName&&!map.has(enName))map.set(enName,jaName);}return map;}
function parseElements(raw){return unique(String(raw||"").split(/[\/／,，・]/).map(v=>ELEMENT_MAP[v.trim()]||"")).filter(Boolean);}
function parseWorks(raw){const result=[];for(const part of String(raw||"").split(/[；;]/)){const match=part.trim().match(/^(.+?)\s*(?:Lv\.?|レベル)?\s*(\d+)$/i);if(!match)continue;const name=WORK_MAP[match[1].trim()]||match[1].trim();if(WORKS.includes(name))result.push({name,level:Number(match[2])});}return result;}
async function loadPalData(){state.dataState="loading";renderConnectionStates();try{const[palResult,locResult]=await Promise.all([fetchJsonCached(DATA_SOURCES.pals,CACHE_KEYS.pals),fetchJsonCached(DATA_SOURCES.localization,CACHE_KEYS.localization)]);const translations=buildTranslationMap(locResult.data),records=Array.isArray(palResult.data?.records)?palResult.data.records:[];state.pals=records.map((record,order)=>{const enName=String(record.name||"").trim(),name=JP_NAME_OVERRIDES[enName]||translations.get(enName)||enName,id=normalizePalNumber(record.number)||`pal-${order}`;return{id,no:id,order,name,enName,aliases:unique([name,enName]),elements:parseElements(record.elements),works:parseWorks(record.work),power:Number(record.breedingPower),rarity:Number(record.rarity||0),icon:palIconUrl(id),sourceUrl:String(record.sourceUrl||""),selfOnly:SELF_ONLY_EN.has(enName)};}).filter(p=>p.name&&Number.isFinite(p.power));rebuildPalMaps();state.dataState=palResult.source==="network"?"ready":"cache";state.dataError=palResult.error?"ネットワーク取得に失敗したため保存済みデータを使用":"";buildBreedingMatrix();}catch(error){console.error("Pal data load failed",error);state.dataState="error";state.dataError="Palworld 1.0データを取得できませんでした。記録機能は利用できます。";buildFallbackPalsFromRecords();}populateFilters();renderAll();renderConnectionStates();}
function rebuildPalMaps(){state.palById=new Map(state.pals.map(p=>[p.id,p]));state.palByName=new Map();state.palByKey=new Map();for(const pal of state.pals){for(const alias of pal.aliases)state.palByName.set(normalizeText(alias),pal);state.palByKey.set(pal.id,pal);}}
function buildFallbackPalsFromRecords(){const names=unique(state.records.flatMap(r=>[r.parentA,r.parentB,r.resultPal]));state.pals=names.map((name,order)=>({id:`fallback-${order}`,no:"—",order,name,enName:name,aliases:[name],elements:[],works:[],power:NaN,rarity:0,icon:UNKNOWN_PAL_ICON,sourceUrl:"",selfOnly:false}));rebuildPalMaps();}
function getPal(value){if(!value)return null;return state.palById.get(String(value))||state.palByName.get(normalizeText(value))||null;}
function canonicalPalName(value){return getPal(value)?.name||String(value||"").trim();}
function buildBreedingMatrix(){state.matrix.clear();state.reverseMatrix.clear();state.matrixReady=false;const normalCandidates=state.pals.filter(p=>!p.selfOnly&&Number.isFinite(p.power));if(!normalCandidates.length)return;const closest=avg=>{let best=normalCandidates[0],distance=Math.abs(best.power-avg);for(let i=1;i<normalCandidates.length;i++){const p=normalCandidates[i],d=Math.abs(p.power-avg);if(d<distance||(d===distance&&p.order<best.order)){best=p;distance=d;}}return best;};for(let i=0;i<state.pals.length;i++){const a=state.pals[i];for(let j=i;j<state.pals.length;j++){const b=state.pals[j];let child,note="";if(a.id===b.id)child=a;else if(GENDER_DEPENDENT_PAIR.has(a.enName)&&GENDER_DEPENDENT_PAIR.has(b.enName)){child=null;note="性別依存：キャットメイジ系とフォックスメイジ系で結果が分岐します。性別対応は保留中です。";}else child=closest(Math.floor((a.power+b.power+1)/2));const key=pairKey(a.id,b.id);state.matrix.set(key,{a:a.id,b:b.id,childId:child?.id||"",note,special:Boolean(note)});if(child){const list=state.reverseMatrix.get(child.id)||[];list.push({a:a.id,b:b.id,childId:child.id,note,special:false});state.reverseMatrix.set(child.id,list);}}}state.matrixReady=true;renderBreedingSearch();renderPalDetail();renderSystemStatus();}
function normalizeRecord(record,id=""){if(!record)return null;const parentA=canonicalPalName(record.parentA),parentB=canonicalPalName(record.parentB),resultPal=canonicalPalName(record.resultPal);return{id:String(id||record.id||crypto.randomUUID()),parentA,parentB,resultPal,eggType:String(record.eggType||"").trim(),mutation:Boolean(record.mutation??record.isMutation??record.mutated),status:resultPal?"verified":"pending",recorder:String(record.recorder||"").trim()||state.users[0]||DEFAULT_USERS[0],note:String(record.note||""),favorites:normalizeFavorites(record.favorites,record.favorite,record.recorder),updatedAt:Number(record.updatedAt||Date.now())};}
function normalizeFavorites(value,legacy,recorder){const out={};if(value&&typeof value==="object"&&!Array.isArray(value))for(const[name,active]of Object.entries(value))if(active)out[name]=true;if(!Object.keys(out).length&&legacy&&recorder)out[recorder]=true;return out;}
function stripRecordId(record){const{id,...rest}=record;return rest;}
function loadLocalState(){const meta=safeJsonParse(localStorage.getItem(CACHE_KEYS.meta(state.roomId)),{})||{};state.worldName=String(meta.worldName||"");const tombstones=new Set(Array.isArray(meta.recorderTombstonesV60)?meta.recorderTombstonesV60:[]);state.users=unique(Array.isArray(meta.recorders)?meta.recorders:DEFAULT_USERS).filter(name=>!tombstones.has(name));if(!state.users.length)state.users=[...DEFAULT_USERS];state.userColors={...(meta.recorderColors||{})};state.users.forEach((name,index)=>state.userColors[name]||=hashColor(name,index));state.currentUser=localStorage.getItem(CACHE_KEYS.currentUser(state.roomId))||localStorage.getItem("palBoardRecorder")||state.users[0];if(!state.users.includes(state.currentUser))state.currentUser=state.users[0];const records=safeJsonParse(localStorage.getItem(CACHE_KEYS.records(state.roomId)),[]);state.records=Array.isArray(records)?records.map(r=>normalizeRecord(r)).filter(Boolean):[];}
function persistLocal(){localStorage.setItem(CACHE_KEYS.records(state.roomId),JSON.stringify(state.records));localStorage.setItem(CACHE_KEYS.meta(state.roomId),JSON.stringify({worldName:state.worldName,recorders:state.users,recorderColors:state.userColors}));localStorage.setItem(CACHE_KEYS.currentUser(state.roomId),state.currentUser);localStorage.setItem("palBoardRecorder",state.currentUser);}
async function initFirebase(){const config=window.firebaseConfig;if(!config?.databaseURL){state.firebaseState="local";renderConnectionStates();return;}try{const[appMod,dbMod]=await Promise.all([import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js")]);const app=appMod.initializeApp(config),db=dbMod.getDatabase(app);state.firebase={db,dbMod};const roomRef=dbMod.ref(db,`rooms/${state.roomId}`);dbMod.onValue(roomRef,snapshot=>{const room=snapshot.val()||{},recordsRaw=room.records||{};state.records=Object.entries(recordsRaw).filter(([id])=>!id.startsWith("sample-")).map(([id,r])=>normalizeRecord(r,id)).filter(Boolean);const meta=room.meta||{},tombstones=new Set(Array.isArray(meta.recorderTombstonesV60)?meta.recorderTombstonesV60:[]),remoteUsers=unique(Array.isArray(meta.recorders)?meta.recorders:state.users).filter(name=>!tombstones.has(name));if(remoteUsers.length)state.users=remoteUsers;state.worldName=typeof meta.worldName==="string"?meta.worldName:state.worldName;state.userColors={...state.userColors,...(meta.recorderColors||{})};state.users.forEach((name,index)=>state.userColors[name]||=hashColor(name,index));if(!state.users.includes(state.currentUser))state.currentUser=state.users[0];state.firebaseState="online";persistLocal();if(!state.pals.length)buildFallbackPalsFromRecords();renderAll();renderConnectionStates();},error=>{console.error("Firebase listener failed",error);state.firebaseState="error";toast("Firebaseへ接続できないため、ローカル保存で動作します。","error");renderConnectionStates();renderAll();});}catch(error){console.error("Firebase init failed",error);state.firebaseState="local";renderConnectionStates();}}
async function saveRecordToStore(record){const index=state.records.findIndex(r=>r.id===record.id);if(index>=0)state.records[index]=record;else state.records.unshift(record);persistLocal();renderAll();if(state.firebase){const{db,dbMod}=state.firebase;try{await dbMod.set(dbMod.ref(db,`rooms/${state.roomId}/records/${record.id}`),stripRecordId(record));}catch(error){console.error(error);toast("共有保存に失敗しました。端末内には保存されています。","error");}}}
async function deleteRecordFromStore(id){state.records=state.records.filter(r=>r.id!==id);if(state.selectedRecordId===id)state.selectedRecordId="";persistLocal();renderAll();if(state.firebase){const{db,dbMod}=state.firebase;try{await dbMod.remove(dbMod.ref(db,`rooms/${state.roomId}/records/${id}`));}catch(error){console.error(error);toast("共有データの削除に失敗しました。","error");}}}
async function saveMeta(){persistLocal();renderAll();if(!state.firebase)return;const{db,dbMod}=state.firebase;try{await dbMod.update(dbMod.ref(db,`rooms/${state.roomId}/meta`),{worldName:state.worldName,recorders:state.users,recorderColors:state.userColors,recorderTombstonesV60:[],updatedAt:Date.now()});}catch(error){console.error(error);toast("設定の共有保存に失敗しました。","error");}}
