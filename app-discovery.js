const GUIDE_MODE_KEY = room => `pal-breeding-guide-mode:${room}`;

state.guideUnlocked = localStorage.getItem(GUIDE_MODE_KEY(state.roomId)) === "1";
state.hintProgress = { elements:false, number:0, english:0, japanese:0, silhouette:false, answer:false };
PAGE_META.hints = ["BREEDING HINTS", "配合ヒント", "答えを直接見ずに、少しずつ手がかりをめくって配合結果を推理します。"];

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
  state.hintProgress = { elements:false, number:0, english:0, japanese:0, silhouette:false, answer:false };
}

function maskHintText(value, visibleCount, mask="•"){
  let revealed = 0;
  return Array.from(String(value || "")).map(character => {
    if(/\s/.test(character)) return character;
    if(revealed < visibleCount){ revealed += 1; return character; }
    revealed += 1;
    return mask;
  }).join("");
}

function currentHintCombination(){
  const a = getPal(state.pickerValues.hintParentA);
  const b = getPal(state.pickerValues.hintParentB);
  if(!a || !b || !state.matrixReady) return { a, b, combo:null, child:null };
  const combo = state.matrix.get(pairKey(a.id,b.id)) || null;
  return { a, b, combo, child:getPal(combo?.childId) };
}

function hintStepButton(action, title, value, disabled=false){
  return `<button class="hint-step${disabled?" is-disabled":""}" type="button" data-hint-action="${action}" ${disabled?"disabled":""}><span>${title}</span><strong>${value}</strong></button>`;
}

function renderHints(){
  const board = byId("hintBoard");
  if(!board) return;
  renderPickerShell("hintParentA");
  renderPickerShell("hintParentB");
  const {a,b,combo,child} = currentHintCombination();
  if(!a || !b){
    board.innerHTML = `<div class="hint-empty"><img src="${PLAIN_EGG_ICON}" alt=""><h3>親パルを2体選択</h3><p>このルームで発見済みのパルから親を選ぶと、結果パルのヒントを段階的に確認できます。</p></div>`;
    return;
  }
  if(!state.matrixReady){
    board.innerHTML = `<div class="hint-empty"><h3>配合データを準備しています</h3></div>`;
    return;
  }
  if(!child){
    board.innerHTML = `<div class="hint-empty"><h3>ヒントを作成できません</h3><p>${escapeHtml(combo?.note || "この組み合わせの結果データがありません。")}</p></div>`;
    return;
  }
  const recorded = recordStateForPair(a.name,b.name);
  if(recorded?.resultPal){
    board.innerHTML = `<div class="hint-discovered"><span class="section-kicker">DISCOVERED</span><h3>この配合は発見済みです</h3><div class="hint-recipe">${palChip(a.name)}<span>＋</span>${palChip(b.name)}<span>→</span>${palChip(recorded.resultPal,{result:true})}</div><button class="button button--ghost" type="button" data-hint-open-record="${escapeHtml(recorded.id)}">配合記録を開く</button></div>`;
    $('[data-hint-open-record]',board)?.addEventListener("click",event=>{state.selectedRecordId=event.currentTarget.dataset.hintOpenRecord;switchView("records");});
    return;
  }
  const progress = state.hintProgress;
  const numberText = progress.number ? `No.${maskHintText(child.no,progress.number,"?")}` : "???";
  const englishText = progress.english ? maskHintText(child.enName,progress.english,"_") : "_ _ _";
  const japaneseText = progress.japanese ? maskHintText(child.name,progress.japanese,"○") : "○○○";
  const elementText = progress.elements ? (child.elements.join("・") || "属性データなし") : "未開封";
  const silhouette = progress.silhouette ? `<img ${palImageAttrs(child,"hint-result-image hint-result-image--silhouette")}>` : `<div class="hint-result-question">?</div>`;
  const answer = progress.answer ? `<div class="hint-answer">${palChip(child.name,{result:true})}</div>` : "";
  board.innerHTML = `<div class="hint-mystery"><div class="hint-recipe hint-recipe--parents">${palChip(a.name)}<span>＋</span>${palChip(b.name)}<span>→</span><div class="hint-result-visual">${silhouette}</div></div><div class="hint-steps">${hintStepButton("elements","ヒント1・属性",elementText,progress.elements)}${hintStepButton("number","ヒント2・図鑑番号",numberText,progress.number>=String(child.no).length)}${hintStepButton("english","ヒント3・英語名",englishText,progress.english>=Array.from(child.enName).filter(c=>! /\s/.test(c)).length)}${hintStepButton("japanese","ヒント4・日本語名",japaneseText,progress.japanese>=Array.from(child.name).filter(c=>! /\s/.test(c)).length)}${hintStepButton("silhouette","ヒント5・シルエット",progress.silhouette?"表示済み":"画像の形を見る",progress.silhouette)}</div><div class="hint-final"><p>数字・英字・日本語名は、ボタンを押すたびに1文字ずつめくれます。</p><button class="button button--ghost" type="button" data-hint-action="answer">答えを見る</button>${answer}</div></div>`;
  $$('[data-hint-action]',board).forEach(button=>button.addEventListener("click",()=>{
    const action=button.dataset.hintAction;
    if(action==="elements") progress.elements=true;
    if(action==="number") progress.number+=1;
    if(action==="english") progress.english+=1;
    if(action==="japanese") progress.japanese+=1;
    if(action==="silhouette") progress.silhouette=true;
    if(action==="answer") progress.answer=true;
    renderHints();
  }));
  attachImageFallbacks(board);
}

function toggleGuideMode(){
  state.guideUnlocked = !state.guideUnlocked;
  localStorage.setItem(GUIDE_MODE_KEY(state.roomId),state.guideUnlocked?"1":"0");
  state.selectedPalId="";
  state.paldexLimit=60;
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
