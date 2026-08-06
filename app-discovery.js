const GUIDE_MODE_KEY = room => `pal-breeding-guide-mode:${room}`;
const HINT_POSITION_DEFINITIONS = [
  {key:"first",label:"先頭"},
  {key:"front2",label:"前から2"},
  {key:"front3",label:"前から3"},
  {key:"middle",label:"中央"},
  {key:"back3",label:"後ろから3"},
  {key:"back2",label:"後ろから2"},
  {key:"last",label:"末尾"},
];

state.guideUnlocked = localStorage.getItem(GUIDE_MODE_KEY(state.roomId)) === "1";
state.hintMode = "forward";
state.hintProgress = createHintProgress();
state.reverseHintProgress = new Map();
state.hintForwardSelectionKey = "";
state.hintReverseSelectionKey = "";
PAGE_META.hints = ["BREEDING HINTS", "配合ヒント", "答えを直接見ずに、選んだ位置の文字や手がかりを少しずつ確認します。"];

function createHintProgress(){
  return {elements:false,number:0,romaji:[],japanese:[],silhouette:false,answer:false};
}

function discoveredPalIdSet(){
  const ids = new Set();
  for(const record of state.records){
    for(const value of [record.parentA, record.parentB, record.resultPal]){
      const pal = getPal(value);
      if(pal) ids.add(pal.id);
    }
  }
  return ids;
}

function discoveredPals(){
  const ids = discoveredPalIdSet();
  return state.pals.filter(pal => ids.has(pal.id));
}

function availablePalsForPaldex(){
  return state.guideUnlocked ? state.pals : discoveredPals();
}

function pickerPalsForTarget(target){
  if(String(target).startsWith("record")) return state.pals;
  if(state.guideUnlocked) return state.pals;
  if(String(target).startsWith("breed") || String(target).startsWith("hint")) return discoveredPals();
  return state.pals;
}

function resetHintProgress(){
  state.hintProgress = createHintProgress();
  state.reverseHintProgress = new Map();
  state.hintForwardSelectionKey = "";
  state.hintReverseSelectionKey = "";
}

function hintCharacters(value){
  return Array.from(String(value || "")).filter(character => !/\s/.test(character));
}

const ROMAJI_SINGLE = Object.freeze({
  "ア":"A","イ":"I","ウ":"U","エ":"E","オ":"O",
  "ァ":"A","ィ":"I","ゥ":"U","ェ":"E","ォ":"O",
  "カ":"KA","キ":"KI","ク":"KU","ケ":"KE","コ":"KO",
  "ガ":"GA","ギ":"GI","グ":"GU","ゲ":"GE","ゴ":"GO",
  "サ":"SA","シ":"SI","ス":"SU","セ":"SE","ソ":"SO",
  "ザ":"ZA","ジ":"ZI","ズ":"ZU","ゼ":"ZE","ゾ":"ZO",
  "タ":"TA","チ":"TI","ツ":"TU","テ":"TE","ト":"TO",
  "ダ":"DA","ヂ":"DI","ヅ":"DU","デ":"DE","ド":"DO",
  "ナ":"NA","ニ":"NI","ヌ":"NU","ネ":"NE","ノ":"NO",
  "ハ":"HA","ヒ":"HI","フ":"HU","ヘ":"HE","ホ":"HO",
  "バ":"BA","ビ":"BI","ブ":"BU","ベ":"BE","ボ":"BO",
  "パ":"PA","ピ":"PI","プ":"PU","ペ":"PE","ポ":"PO",
  "マ":"MA","ミ":"MI","ム":"MU","メ":"ME","モ":"MO",
  "ヤ":"YA","ユ":"YU","ヨ":"YO","ャ":"YA","ュ":"YU","ョ":"YO",
  "ラ":"RA","リ":"RI","ル":"RU","レ":"RE","ロ":"RO",
  "ワ":"WA","ヰ":"WI","ヱ":"WE","ヲ":"WO","ン":"N",
  "ヴ":"VU","ヵ":"KA","ヶ":"KE",
});

const ROMAJI_DIGRAPHS = Object.freeze({
  "キャ":"KYA","キュ":"KYU","キョ":"KYO","キェ":"KYE",
  "ギャ":"GYA","ギュ":"GYU","ギョ":"GYO","ギェ":"GYE",
  "シャ":"SYA","シュ":"SYU","ショ":"SYO","シェ":"SYE",
  "ジャ":"ZYA","ジュ":"ZYU","ジョ":"ZYO","ジェ":"ZYE",
  "チャ":"TYA","チュ":"TYU","チョ":"TYO","チェ":"TYE",
  "ヂャ":"DYA","ヂュ":"DYU","ヂョ":"DYO","ヂェ":"DYE",
  "ニャ":"NYA","ニュ":"NYU","ニョ":"NYO","ニェ":"NYE",
  "ヒャ":"HYA","ヒュ":"HYU","ヒョ":"HYO","ヒェ":"HYE",
  "ビャ":"BYA","ビュ":"BYU","ビョ":"BYO","ビェ":"BYE",
  "ピャ":"PYA","ピュ":"PYU","ピョ":"PYO","ピェ":"PYE",
  "ミャ":"MYA","ミュ":"MYU","ミョ":"MYO","ミェ":"MYE",
  "リャ":"RYA","リュ":"RYU","リョ":"RYO","リェ":"RYE",
  "テャ":"TYA","テュ":"TYU","テョ":"TYO","ティ":"TI",
  "デャ":"DYA","デュ":"DYU","デョ":"DYO","ディ":"DI",
  "ツァ":"TSA","ツィ":"TSI","ツェ":"TSE","ツォ":"TSO",
  "ファ":"FA","フィ":"FI","フェ":"FE","フォ":"FO","フャ":"FYA","フュ":"FYU","フョ":"FYO",
  "ウァ":"WA","ウィ":"WI","ウェ":"WE","ウォ":"WO",
  "クァ":"KWA","クィ":"KWI","クェ":"KWE","クォ":"KWO",
  "グァ":"GWA","グィ":"GWI","グェ":"GWE","グォ":"GWO",
  "ヴァ":"VA","ヴィ":"VI","ヴェ":"VE","ヴォ":"VO","ヴャ":"VYA","ヴュ":"VYU","ヴョ":"VYO",
  "イェ":"YE","スィ":"SI","ズィ":"ZI","トゥ":"TU","ドゥ":"DU",
});

function toKatakana(value){
  return Array.from(String(value || "").normalize("NFKC")).map(character=>{
    const code=character.charCodeAt(0);
    return code>=0x3041&&code<=0x3096?String.fromCharCode(code+0x60):character;
  }).join("");
}

function romajiConsonantHint(value){
  const source=toKatakana(value).replace(/亜種/g,"アシュ").replace(/変異/g,"ヘンイ");
  const result=[];
  for(let index=0;index<source.length;index+=1){
    const character=source[index];
    if(character==="ッ"){
      result.push("T");
      continue;
    }
    if(character==="ー"){
      result.push("ー");
      continue;
    }
    const pair=source.slice(index,index+2);
    const digraph=ROMAJI_DIGRAPHS[pair];
    const roman=digraph||ROMAJI_SINGLE[character]||"";
    if(digraph) index+=1;
    if(roman){
      const letters=Array.from(roman.toUpperCase());
      const consonants=letters.filter(letter=>!/[AEIOU]/.test(letter));
      result.push(...(consonants.length?consonants:letters));
      continue;
    }
    if(/[A-Za-z0-9]/.test(character)) result.push(character.toUpperCase());
  }
  return result;
}

function romajiHintSlotCount(){
  return Math.max(7,...state.pals.map(pal=>romajiConsonantHint(pal.name).length));
}

function hintPositionIndex(length,key){
  const slot=HINT_POSITION_DEFINITIONS.findIndex(position=>position.key===key);
  if(slot<0) return -1;
  if(length<=HINT_POSITION_DEFINITIONS.length) return slot<length?slot:-1;
  const last=length-1;
  if(key==="first") return 0;
  if(key==="front2") return 1;
  if(key==="front3") return 2;
  if(key==="middle") return Math.floor(last/2);
  if(key==="back3") return last-2;
  if(key==="back2") return last-1;
  return last;
}

function hintCharacterAt(value,key){
  const characters=hintCharacters(value),index=hintPositionIndex(characters.length,key);
  return index>=0&&index<characters.length?characters[index]:"×";
}

function fixedNumberHint(value,revealed){
  const characters=hintCharacters(value);
  return Array.from({length:4},(_,index)=>index<revealed&&index<characters.length?characters[index]:"?").join(" ");
}

function positionHintPanel(type,title,value,revealed,scope,candidateId=""){
  const selected=new Set(Array.isArray(revealed)?revealed:[]),characters=hintCharacters(value),sequential=characters.length<=HINT_POSITION_DEFINITIONS.length;
  const buttons=HINT_POSITION_DEFINITIONS.map((position,slot)=>{
    const unavailable=hintPositionIndex(characters.length,position.key)<0,isRevealed=selected.has(position.key),visible=isRevealed||unavailable;
    const attribute=scope==="reverse"
      ? `data-reverse-position="${escapeHtml(candidateId)}|${type}|${position.key}"`
      : `data-forward-position="${type}|${position.key}"`;
    const label=sequential?`${slot+1}文字目`:position.label;
    return `<button class="hint-position${isRevealed?" is-revealed":""}${unavailable?" is-unavailable":""}" type="button" ${attribute} ${visible?"disabled":""}><span>${label}</span><strong>${visible?escapeHtml(unavailable?"×":hintCharacterAt(value,position.key)):"?"}</strong></button>`;
  }).join("");
  return `<section class="hint-letter-panel"><div class="hint-letter-panel__heading"><strong>${title}</strong><span>${sequential?"開きたい文字を選択・名前のない位置は×":"開きたい場所を選択・文字数は非表示"}</span></div><div class="hint-position-grid">${buttons}</div></section>`;
}

function romajiHintPanel(value,revealed,scope,candidateId=""){
  const selected=new Set(Array.isArray(revealed)?revealed:[]),tokens=romajiConsonantHint(value),slotCount=romajiHintSlotCount();
  const buttons=Array.from({length:slotCount},(_,index)=>{
    const key=`slot-${index}`,isRevealed=selected.has(key),missing=isRevealed&&index>=tokens.length;
    const attribute=scope==="reverse"
      ? `data-reverse-position="${escapeHtml(candidateId)}|romaji|${key}"`
      : `data-forward-position="romaji|${key}"`;
    const style=missing?' style="border-color:rgba(255,104,122,.5);background:rgba(255,104,122,.08)"':'';
    const strongStyle=missing?' style="color:#ff7889"':'';
    return `<button class="hint-position${isRevealed&&!missing?" is-revealed":""}${missing?" is-missing":""}" type="button" ${attribute} ${isRevealed?"disabled":""}${style} aria-label="ローマ字子音の${index+1}文字目を開く"><span>${index+1}文字目</span><strong${strongStyle}>${isRevealed?escapeHtml(missing?"×":tokens[index]):"?"}</strong></button>`;
  }).join("");
  return `<section class="hint-letter-panel hint-letter-panel--romaji"><div class="hint-letter-panel__heading"><strong>ヒント3・ローマ字の子音</strong><span>子音を1文字ずつ開示・母音だけの文字は母音を表示</span></div><div class="hint-position-grid hint-position-grid--romaji" style="grid-template-columns:repeat(auto-fit,minmax(58px,1fr))">${buttons}</div></section>`;
}

function hintSilhouette(pal){
  const src=pal?.icon||UNKNOWN_PAL_ICON,id=pal?.id||"";
  return `<img src="${escapeHtml(src)}" alt="候補パルのシルエット" class="hint-result-image hint-result-image--silhouette" loading="lazy" data-pal-image="${escapeHtml(id)}">`;
}

function forwardHintCombination(){
  const a = getPal(state.pickerValues.hintParentA);
  const b = getPal(state.pickerValues.hintParentB);
  if(!a || !b || !state.matrixReady) return {a,b,combo:null,child:null};
  const combo = state.matrix.get(pairKey(a.id,b.id)) || null;
  return {a,b,combo,child:getPal(combo?.childId)};
}

function hintStepButton(attribute,title,value,disabled=false){
  return `<button class="hint-step${disabled?" is-disabled":""}" type="button" ${attribute} ${disabled?"disabled":""}><span>${title}</span><strong>${value}</strong></button>`;
}

function openHintTrial(parentA,parentB){
  const existing=recordStateForPair(parentA,parentB);
  if(existing){
    state.selectedRecordId=existing.id;
    switchView("records");
    toast("既存の配合記録を開きました");
    return;
  }
  openRecordDialog("",{parentA,parentB,resultPal:""});
}

function renderForwardHints(board){
  const {a,b,combo,child}=forwardHintCombination();
  if(!a || !b){
    board.innerHTML=`<div class="hint-empty"><img src="${PLAIN_EGG_ICON}" alt=""><h3>親パルを2体選択</h3><p>このルームで発見済みのパルから親を選ぶと、結果パルのヒントを段階的に確認できます。</p></div>`;
    return;
  }
  if(!state.matrixReady){
    board.innerHTML=`<div class="hint-empty"><h3>配合データを準備しています</h3></div>`;
    return;
  }
  if(!child){
    board.innerHTML=`<div class="hint-empty"><h3>ヒントを作成できません</h3><p>${escapeHtml(combo?.note||"この組み合わせの結果データがありません。")}</p></div>`;
    return;
  }
  const recorded=recordStateForPair(a.name,b.name);
  if(recorded?.resultPal){
    board.innerHTML=`<div class="hint-discovered"><span class="section-kicker">DISCOVERED</span><h3>この配合は発見済みです</h3><div class="hint-recipe">${palChip(a.name)}<span>＋</span>${palChip(b.name)}<span>→</span>${palChip(recorded.resultPal,{result:true})}</div><button class="button button--ghost" type="button" data-hint-open-record="${escapeHtml(recorded.id)}">配合記録を開く</button></div>`;
    $('[data-hint-open-record]',board)?.addEventListener("click",event=>{state.selectedRecordId=event.currentTarget.dataset.hintOpenRecord;switchView("records");});
    return;
  }

  const progress=state.hintProgress;
  const elementText=progress.elements?(child.elements.join("・")||"属性データなし"):"未開封";
  const numberText=`No.${fixedNumberHint(child.no,progress.number)}`;
  const visual=progress.silhouette?hintSilhouette(child):`<div class="hint-result-question">?</div>`;
  const pendingNotice=recorded?`<div class="hint-trial-status" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid rgba(235,192,80,.22);border-radius:14px;background:rgba(235,192,80,.055)"><span class="status-badge">確認中として登録済み</span><p style="margin:0;color:var(--text-soft);font-size:11px;line-height:1.55">この親ペアは既に記録されています。答えが分かったら既存記録へ結果を入力できます。</p></div>`:"";
  const planAction=recorded
    ? `<button class="button button--ghost" type="button" data-hint-edit-record="${escapeHtml(recorded.id)}">確認中の記録を開く</button>`
    : `<button class="button button--secondary" type="button" data-forward-plan="${escapeHtml(a.id)}|${escapeHtml(b.id)}">この親ペアを試す予定に追加</button>`;
  const answer=progress.answer?`<div class="hint-answer">${palChip(child.name,{result:true})}${recorded?`<button class="button button--primary" type="button" data-hint-edit-record="${escapeHtml(recorded.id)}">結果を入力する</button>`:`<button class="button button--primary" type="button" data-forward-record="${escapeHtml(a.id)}|${escapeHtml(b.id)}|${escapeHtml(child.id)}">この配合を記録</button>`}</div>`:"";
  board.innerHTML=`<div class="hint-mystery">${pendingNotice}<div class="hint-recipe hint-recipe--parents">${palChip(a.name)}<span>＋</span>${palChip(b.name)}<span>→</span><div class="hint-result-visual">${visual}</div></div><div class="hint-steps hint-steps--compact">${hintStepButton('data-hint-action="elements"',"ヒント1・属性",elementText,progress.elements)}${hintStepButton('data-hint-action="number"',"ヒント2・図鑑番号",numberText,progress.number>=4)}${hintStepButton('data-hint-action="silhouette"',"ヒント5・シルエット",progress.silhouette?"表示済み":"画像の形を見る",progress.silhouette)}</div><div class="hint-letter-groups">${romajiHintPanel(child.name,progress.romaji,"forward")}${positionHintPanel("japanese","ヒント4・日本語名",child.name,progress.japanese,"forward")}</div><div class="hint-final"><p>ローマ字ヒントは子音だけを表示します。小さい「っ」はT、小さい「ゃ・ゅ・ょ」はYを含み、伸ばし棒は「ー」のままです。名前が続かない位置は、クリック後に赤い×が表示されます。</p><div class="hint-final__actions" style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">${planAction}${progress.answer?"":`<button class="button button--ghost" type="button" data-hint-action="answer">答えを見る</button>`}</div>${answer}</div></div>`;

  $$('[data-hint-action]',board).forEach(button=>button.addEventListener("click",()=>{
    const action=button.dataset.hintAction;
    if(action==="elements")progress.elements=true;
    if(action==="number")progress.number=Math.min(4,progress.number+1);
    if(action==="silhouette")progress.silhouette=true;
    if(action==="answer")progress.answer=true;
    renderHints();
  }));
  $$('[data-forward-position]',board).forEach(button=>button.addEventListener("click",()=>{
    const[type,key]=button.dataset.forwardPosition.split("|");
    if(!progress[type].includes(key))progress[type].push(key);
    renderHints();
  }));
  $('[data-forward-plan]',board)?.addEventListener("click",event=>{
    const[aId,bId]=event.currentTarget.dataset.forwardPlan.split("|");
    const parentA=getPal(aId),parentB=getPal(bId);
    if(parentA&&parentB)openHintTrial(parentA.name,parentB.name);
  });
  $$('[data-hint-edit-record]',board).forEach(button=>button.addEventListener("click",()=>openRecordDialog(button.dataset.hintEditRecord,{focus:"result"})));
  $('[data-forward-record]',board)?.addEventListener("click",event=>handleComboRecord(event.currentTarget.dataset.forwardRecord));
  attachImageFallbacks(board);
}

function reverseHintSelection(){
  return {
    target:getPal(state.pickerValues.hintReverseTarget),
    known:getPal(state.pickerValues.hintReverseParentA),
  };
}

function reverseHintCandidates(target,known){
  if(!target||!known||!state.matrixReady)return[];
  const byCandidate=new Map();
  for(const combo of state.reverseMatrix.get(target.id)||[]){
    let candidateId="";
    if(combo.a===known.id)candidateId=combo.b;
    else if(combo.b===known.id)candidateId=combo.a;
    if(!candidateId)continue;
    const pal=getPal(candidateId);
    if(!pal||byCandidate.has(pal.id))continue;
    const record=recordStateForPair(known.name,pal.name);
    const discovered=Boolean(record?.resultPal&&normalizeText(record.resultPal)===normalizeText(target.name));
    byCandidate.set(pal.id,{pal,combo,record,discovered});
  }
  return Array.from(byCandidate.values()).sort((left,right)=>Number(right.discovered)-Number(left.discovered)||left.pal.order-right.pal.order);
}

function reverseProgressFor(candidateId){
  if(!state.reverseHintProgress.has(candidateId))state.reverseHintProgress.set(candidateId,createHintProgress());
  return state.reverseHintProgress.get(candidateId);
}

function reverseHintCard(item,index,target,known){
  if(item.discovered){
    return `<article class="reverse-hint-card reverse-hint-card--discovered"><header class="reverse-hint-card__header"><span class="section-kicker">候補 ${index+1}</span><strong>発見済み</strong></header><div class="hint-recipe">${palChip(known.name)}<span>＋</span>${palChip(item.pal.name)}<span>→</span>${palChip(target.name,{result:true})}</div><button class="button button--ghost" type="button" data-reverse-open-record="${escapeHtml(item.record.id)}">配合記録を開く</button></article>`;
  }
  const progress=reverseProgressFor(item.pal.id);
  const elementText=progress.elements?(item.pal.elements.join("・")||"属性データなし"):"未開封";
  const numberText=`No.${fixedNumberHint(item.pal.no,progress.number)}`;
  const visual=progress.silhouette?hintSilhouette(item.pal):`<div class="hint-result-question">?</div>`;
  const action=value=>`data-reverse-action="${escapeHtml(item.pal.id)}|${value}"`;
  const existingLabel=item.record?(item.record.resultPal?"既存記録あり":"確認中として登録済み"):"";
  const answer=progress.answer?`<div class="hint-answer">${palChip(item.pal.name)}${item.record?`<button class="button button--primary" type="button" data-reverse-edit-record="${escapeHtml(item.record.id)}">既存記録を開く</button>`:`<button class="button button--primary" type="button" data-reverse-record="${escapeHtml(item.pal.id)}">この組み合わせを記録</button>`}</div>`:"";
  return `<article class="reverse-hint-card" data-reverse-candidate="${escapeHtml(item.pal.id)}"><header class="reverse-hint-card__header"><div><span class="section-kicker">候補 ${index+1}</span><strong>もう片方の親パル</strong></div><div style="display:flex;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap">${existingLabel?`<span class="status-badge">${existingLabel}</span>`:""}${item.combo.special?`<span class="issue-badge">特殊配合候補</span>`:""}</div></header><div class="hint-reverse-equation">${palChip(known.name)}<span>＋</span><div class="hint-result-visual">${visual}</div><span>→</span>${palChip(target.name,{result:true})}</div><div class="hint-steps hint-steps--compact">${hintStepButton(action("elements"),"ヒント1・属性",elementText,progress.elements)}${hintStepButton(action("number"),"ヒント2・図鑑番号",numberText,progress.number>=4)}${hintStepButton(action("silhouette"),"ヒント5・シルエット",progress.silhouette?"表示済み":"画像の形を見る",progress.silhouette)}</div><div class="hint-letter-groups">${romajiHintPanel(item.pal.name,progress.romaji,"reverse",item.pal.id)}${positionHintPanel("japanese","ヒント4・日本語名",item.pal.name,progress.japanese,"reverse",item.pal.id)}</div><div class="hint-final"><p>候補ごとにヒントの開示状態を分けています。ローマ字の子音枠は、全パルで最も長い名前に合わせています。</p>${progress.answer?"":`<button class="button button--ghost" type="button" ${action("answer")}>答えを見る</button>`}${answer}</div></article>`;
}

function renderReverseHints(board){
  const {target,known}=reverseHintSelection();
  if(!target||!known){
    board.innerHTML=`<div class="hint-empty"><img src="${PLAIN_EGG_ICON}" alt=""><h3>目標パルと片親を選択</h3><p>両方を選択すると、成立するもう片方の親候補を候補ごとに表示します。</p></div>`;
    return;
  }
  if(!state.matrixReady){
    board.innerHTML=`<div class="hint-empty"><h3>配合データを準備しています</h3></div>`;
    return;
  }
  const candidates=reverseHintCandidates(target,known);
  if(!candidates.length){
    board.innerHTML=`<div class="hint-empty"><img src="${PLAIN_EGG_ICON}" alt=""><h3>該当する親候補がありません</h3><p>選択した目標パルと片親の組み合わせでは、利用できる配合候補を確認できませんでした。</p></div>`;
    return;
  }
  board.innerHTML=`<div class="reverse-hint-summary"><div><span class="section-kicker">REVERSE HINTS</span><h3>${candidates.length}件の親候補</h3><p>候補ごとに独立して、ローマ字の子音・日本語名・属性・図鑑番号・シルエットを確認できます。</p></div><div class="reverse-hint-summary__recipe">${palChip(known.name)}<span>＋</span><strong>?</strong><span>→</span>${palChip(target.name,{result:true})}</div></div><div class="reverse-hint-list">${candidates.map((item,index)=>reverseHintCard(item,index,target,known)).join("")}</div>`;

  $$('[data-reverse-action]',board).forEach(button=>button.addEventListener("click",()=>{
    const[candidateId,action]=button.dataset.reverseAction.split("|");
    const progress=reverseProgressFor(candidateId);
    if(action==="elements")progress.elements=true;
    if(action==="number")progress.number=Math.min(4,progress.number+1);
    if(action==="silhouette")progress.silhouette=true;
    if(action==="answer")progress.answer=true;
    renderHints();
  }));
  $$('[data-reverse-position]',board).forEach(button=>button.addEventListener("click",()=>{
    const[candidateId,type,key]=button.dataset.reversePosition.split("|");
    const progress=reverseProgressFor(candidateId);
    if(!progress[type].includes(key))progress[type].push(key);
    renderHints();
  }));
  $$('[data-reverse-open-record]',board).forEach(button=>button.addEventListener("click",()=>{state.selectedRecordId=button.dataset.reverseOpenRecord;switchView("records");}));
  $$('[data-reverse-edit-record]',board).forEach(button=>button.addEventListener("click",()=>openRecordDialog(button.dataset.reverseEditRecord,{focus:"result"})));
  $$('[data-reverse-record]',board).forEach(button=>button.addEventListener("click",()=>{
    const candidate=getPal(button.dataset.reverseRecord);
    if(candidate)openRecordDialog("",{parentA:known.name,parentB:candidate.name,resultPal:target.name});
  }));
  attachImageFallbacks(board);
}

function forwardHintSelectionKey(){
  const a=getPal(state.pickerValues.hintParentA),b=getPal(state.pickerValues.hintParentB);
  return a&&b?pairKey(a.id,b.id):"";
}

function reverseHintSelectionKey(){
  const {target,known}=reverseHintSelection();
  return target&&known?`${target.id}|${known.id}`:"";
}

function syncHintProgressForSelection(){
  const forwardKey=forwardHintSelectionKey();
  if(forwardKey!==state.hintForwardSelectionKey){
    state.hintForwardSelectionKey=forwardKey;
    state.hintProgress=createHintProgress();
  }
  const reverseKey=reverseHintSelectionKey();
  if(reverseKey!==state.hintReverseSelectionKey){
    state.hintReverseSelectionKey=reverseKey;
    state.reverseHintProgress=new Map();
  }
}

function renderHints(){
  const board=byId("hintBoard");
  if(!board)return;
  syncHintProgressForSelection();
  const reverse=state.hintMode==="reverse";
  $$('[data-hint-mode]').forEach(button=>{
    const active=button.dataset.hintMode===state.hintMode;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-selected",String(active));
  });
  byId("hintForwardPanel")?.classList.toggle("is-hidden",reverse);
  byId("hintReversePanel")?.classList.toggle("is-hidden",!reverse);
  renderPickerShell("hintParentA");
  renderPickerShell("hintParentB");
  renderPickerShell("hintReverseTarget");
  renderPickerShell("hintReverseParentA");
  if(reverse)renderReverseHints(board);else renderForwardHints(board);
}

function toggleGuideMode(){
  state.guideUnlocked=!state.guideUnlocked;
  localStorage.setItem(GUIDE_MODE_KEY(state.roomId),state.guideUnlocked?"1":"0");
  if(!state.guideUnlocked){
    const allowed=new Set(discoveredPals().map(pal=>pal.id));
    for(const key of ["breedParentA","breedParentB","breedTarget","hintParentA","hintParentB","hintReverseTarget","hintReverseParentA"]){
      if(state.pickerValues[key]&&!allowed.has(state.pickerValues[key]))state.pickerValues[key]="";
    }
  }
  state.selectedPalId="";
  state.paldexLimit=60;
  resetHintProgress();
  renderAll();
  toast(state.guideUnlocked?"全パル解放モードを有効にしました":"発見記録モードに戻しました");
}

function renderGuideModeControl(){
  const button=byId("guideModeToggle");
  if(!button)return;
  button.classList.toggle("is-active",state.guideUnlocked);
  button.setAttribute("aria-pressed",String(state.guideUnlocked));
  button.title=state.guideUnlocked?"発見記録モードへ戻す":"表示モード";
}

function bindHintModeControls(){
  $$('[data-hint-mode]').forEach(button=>{
    if(button.dataset.hintBound)return;
    button.dataset.hintBound="1";
    button.addEventListener("click",()=>{state.hintMode=button.dataset.hintMode;renderHints();});
  });
}

bindHintModeControls();
