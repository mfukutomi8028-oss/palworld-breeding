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
PAGE_META.hints = ["BREEDING HINTS", "配合ヒント", "答えを直接見ずに、選んだ位置の文字や手がかりを少しずつ確認します。"];

function createHintProgress(){
  return {elements:false,number:0,english:[],japanese:[],silhouette:false,answer:false};
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
}

function hintCharacters(value){
  return Array.from(String(value || "")).filter(character => !/\s/.test(character));
}

function hintPositionIndex(length,key){
  const last=Math.max(0,length-1);
  if(key==="first")return 0;
  if(key==="front2")return Math.min(1,last);
  if(key==="front3")return Math.min(2,last);
  if(key==="middle")return Math.floor(last/2);
  if(key==="back3")return Math.max(0,last-2);
  if(key==="back2")return Math.max(0,last-1);
  return last;
}

function hintCharacterAt(value,key){
  const characters=hintCharacters(value);
  if(!characters.length)return "—";
  return characters[hintPositionIndex(characters.length,key)] || "—";
}

function fixedNumberHint(value,revealed){
  const characters=hintCharacters(value);
  return Array.from({length:4},(_,index)=>index<revealed&&index<characters.length?characters[index]:"?").join(" ");
}

function positionHintPanel(type,title,value,revealed,scope,candidateId=""){
  const selected=new Set(Array.isArray(revealed)?revealed:[]);
  const buttons=HINT_POSITION_DEFINITIONS.map(position=>{
    const isRevealed=selected.has(position.key);
    const attribute=scope==="reverse"
      ? `data-reverse-position="${escapeHtml(candidateId)}|${type}|${position.key}"`
      : `data-forward-position="${type}|${position.key}"`;
    return `<button class="hint-position${isRevealed?" is-revealed":""}" type="button" ${attribute} ${isRevealed?"disabled":""}><span>${position.label}</span><strong>${isRevealed?escapeHtml(hintCharacterAt(value,position.key)):"?"}</strong></button>`;
  }).join("");
  return `<section class="hint-letter-panel"><div class="hint-letter-panel__heading"><strong>${title}</strong><span>開きたい場所を選択・文字数は非表示</span></div><div class="hint-position-grid">${buttons}</div></section>`;
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
  const answer=progress.answer?`<div class="hint-answer">${palChip(child.name,{result:true})}<button class="button button--primary" type="button" data-forward-record="${escapeHtml(a.id)}|${escapeHtml(b.id)}|${escapeHtml(child.id)}">この配合を記録</button></div>`:"";
  board.innerHTML=`<div class="hint-mystery"><div class="hint-recipe hint-recipe--parents">${palChip(a.name)}<span>＋</span>${palChip(b.name)}<span>→</span><div class="hint-result-visual">${visual}</div></div><div class="hint-steps hint-steps--compact">${hintStepButton('data-hint-action="elements"',"ヒント1・属性",elementText,progress.elements)}${hintStepButton('data-hint-action="number"',"ヒント2・図鑑番号",numberText,progress.number>=4)}${hintStepButton('data-hint-action="silhouette"',"ヒント5・シルエット",progress.silhouette?"表示済み":"画像の形を見る",progress.silhouette)}</div><div class="hint-letter-groups">${positionHintPanel("english","ヒント3・英語名",child.enName,progress.english,"forward")}${positionHintPanel("japanese","ヒント4・日本語名",child.name,progress.japanese,"forward")}</div><div class="hint-final"><p>英語名・日本語名は固定された7か所から選んで1文字ずつ開きます。名前の文字数は表示しません。</p>${progress.answer?"":`<button class="button button--ghost" type="button" data-hint-action="answer">答えを見る</button>`}${answer}</div></div>`;

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
  const answer=progress.answer?`<div class="hint-answer">${palChip(item.pal.name)}<button class="button button--primary" type="button" data-reverse-record="${escapeHtml(item.pal.id)}">この組み合わせを記録</button></div>`:"";
  return `<article class="reverse-hint-card" data-reverse-candidate="${escapeHtml(item.pal.id)}"><header class="reverse-hint-card__header"><div><span class="section-kicker">候補 ${index+1}</span><strong>もう片方の親パル</strong></div>${item.combo.special?`<span class="issue-badge">特殊配合候補</span>`:""}</header><div class="hint-reverse-equation">${palChip(known.name)}<span>＋</span><div class="hint-result-visual">${visual}</div><span>→</span>${palChip(target.name,{result:true})}</div><div class="hint-steps hint-steps--compact">${hintStepButton(action("elements"),"ヒント1・属性",elementText,progress.elements)}${hintStepButton(action("number"),"ヒント2・図鑑番号",numberText,progress.number>=4)}${hintStepButton(action("silhouette"),"ヒント5・シルエット",progress.silhouette?"表示済み":"画像の形を見る",progress.silhouette)}</div><div class="hint-letter-groups">${positionHintPanel("english","ヒント3・英語名",item.pal.enName,progress.english,"reverse",item.pal.id)}${positionHintPanel("japanese","ヒント4・日本語名",item.pal.name,progress.japanese,"reverse",item.pal.id)}</div><div class="hint-final"><p>この候補だけのヒント開示状況として保存されています。</p>${progress.answer?"":`<button class="button button--ghost" type="button" ${action("answer")}>答えを見る</button>`}${answer}</div></article>`;
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
  board.innerHTML=`<div class="reverse-hint-summary"><div><span class="section-kicker">REVERSE HINTS</span><h3>${candidates.length}件の親候補</h3><p>候補ごとに独立して、開きたい位置の文字や属性・図鑑番号・シルエットを確認できます。</p></div><div class="reverse-hint-summary__recipe">${palChip(known.name)}<span>＋</span><strong>?</strong><span>→</span>${palChip(target.name,{result:true})}</div></div><div class="reverse-hint-list">${candidates.map((item,index)=>reverseHintCard(item,index,target,known)).join("")}</div>`;

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
  $$('[data-reverse-record]',board).forEach(button=>button.addEventListener("click",()=>{
    const candidate=getPal(button.dataset.reverseRecord);
    if(candidate)openRecordDialog("",{parentA:known.name,parentB:candidate.name,resultPal:target.name});
  }));
  attachImageFallbacks(board);
}

function renderHints(){
  const board=byId("hintBoard");
  if(!board)return;
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
  const reset=byId("hintReset");
  if(reset&&!reset.dataset.reverseHintBound){
    reset.dataset.reverseHintBound="1";
    reset.addEventListener("click",()=>{
      if(state.hintMode==="reverse"){
        state.pickerValues.hintReverseTarget="";
        state.pickerValues.hintReverseParentA="";
      }
      resetHintProgress();
      renderHints();
    });
  }
}

bindHintModeControls();
