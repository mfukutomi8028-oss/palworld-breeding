function renderBreedingSearch() {
  $$('[data-breeding-mode]').forEach(button => { const active = button.dataset.breedingMode === state.breedingMode; button.classList.toggle("is-active", active); button.setAttribute("aria-selected", String(active)); });
  byId("parentsSearchPanel").classList.toggle("is-hidden", state.breedingMode !== "parents");
  byId("targetSearchPanel").classList.toggle("is-hidden", state.breedingMode !== "target");
  renderPickerShell("breedParentA"); renderPickerShell("breedParentB"); renderPickerShell("breedTarget");
  const a = getPal(state.pickerValues.breedParentA), b = getPal(state.pickerValues.breedParentB), result = byId("pairChildResult");
  if (!a || !b) result.innerHTML = `<span>親を2体選択すると、記録済みの結果を表示します。</span>`;
  else if (!state.matrixReady) result.innerHTML = `<span>配合データを準備しています。</span>`;
  else if(!state.guideUnlocked){
    const existing=recordStateForPair(a.name,b.name);
    if(existing?.resultPal){
      result.innerHTML=`<div class="breed-result-card">${palChip(existing.resultPal,{result:true})}<div class="breed-result-card__meta"><span class="record-state-dot is-verified"></span><button class="button button--primary" type="button" data-open-record="${escapeHtml(existing.id)}">記録を開く</button></div></div>`;
    }else if(existing){
      result.innerHTML=`<div class="mystery-result"><strong>確認中</strong><span>この親ペアは記録されていますが、結果はまだ未確認です。</span><button class="button button--ghost" type="button" data-open-record="${escapeHtml(existing.id)}">記録を開く</button></div>`;
    }else{
      result.innerHTML=`<div class="mystery-result"><strong>このルームでは未発見</strong><span>答えを直接表示せず、配合ヒントで少しずつ確認できます。</span><button class="button button--ghost" type="button" data-open-hints-pair="${a.id}|${b.id}">配合ヒントを見る</button></div>`;
    }
  }else{
    const combo=state.matrix.get(pairKey(a.id,b.id));
    if(combo?.childId){
      const child=getPal(combo.childId),existing=recordStateForPair(a.name,b.name);
      result.innerHTML=`<div class="breed-result-card">${palChip(child.name,{result:true})}<div class="breed-result-card__meta">${combo.special?`<span class="issue-badge">特殊配合</span>`:""}<span class="record-state-dot ${existing?.resultPal?"is-verified":existing?"is-pending":""}"></span><button class="button button--primary" type="button" data-record-combo="${a.id}|${b.id}|${child.id}">${existing?"記録を開く":"この配合を記録"}</button></div></div>`;
    }else result.innerHTML=`<span>${escapeHtml(combo?.note||"この組み合わせの結果を計算できません。")}</span>`;
  }
  $$('[data-record-combo]',result).forEach(button=>button.addEventListener("click",()=>handleComboRecord(button.dataset.recordCombo)));
  $$('[data-open-record]',result).forEach(button=>button.addEventListener("click",()=>{state.selectedRecordId=button.dataset.openRecord;switchView("records");}));
  $$('[data-open-hints-pair]',result).forEach(button=>button.addEventListener("click",()=>{const[aId,bId]=button.dataset.openHintsPair.split("|");state.pickerValues.hintParentA=aId;state.pickerValues.hintParentB=bId;resetHintProgress();switchView("hints");}));
  renderTargetResults();
  byId("breedingDataNote").innerHTML = state.dataState === "error" ? `<strong>配合データを利用できません。</strong> ${escapeHtml(state.dataError)}` : state.guideUnlocked ? `<strong>全パル解放モード:</strong> ${DATA_VERSION}の完全配合データを表示しています。` : `<strong>発見記録モード:</strong> このルームで記録したパルと配合だけを表示しています。未発見の答えは配合ヒントで段階的に確認できます。`;
}

function handleComboRecord(value) {
  const [aId,bId,childId]=String(value).split("|"); const a=getPal(aId),b=getPal(bId),child=getPal(childId); if(!a||!b)return;
  const existing=recordStateForPair(a.name,b.name); if(existing){ state.currentView="records"; state.selectedRecordId=existing.id; renderAll(); return; }
  openRecordDialog("",{parentA:a.name,parentB:b.name,resultPal:child?.name||""});
}

function renderTargetResults() {
  const container=byId("targetParentResults"), target=getPal(state.pickerValues.breedTarget);
  if(!target){container.innerHTML=`<div class="empty-state" style="grid-column:1/-1;min-height:260px"><img src="${PLAIN_EGG_ICON}" alt=""><div><h3>目標パルを選択</h3><p>${state.guideUnlocked?"作りたいパルを選ぶと、完全配合データの親ペアを表示します。":"発見済みのパルを選ぶと、このルームで記録した親ペアを表示します。"}</p></div></div>`;return;}
  if(!state.matrixReady){container.innerHTML=`<div class="empty-state" style="grid-column:1/-1;min-height:240px"><div><h3>配合データを準備中</h3></div></div>`;return;}
  const q=normalizeText(byId("parentPairSearch").value);
  if(!state.guideUnlocked){
    let records=state.records.filter(record=>record.resultPal&&normalizeText(record.resultPal)===normalizeText(target.name)).filter(record=>!q||normalizeText(`${record.parentA} ${record.parentB}`).includes(q));
    if(!records.length){container.innerHTML=`<div class="empty-state" style="grid-column:1/-1;min-height:260px"><img src="${PLAIN_EGG_ICON}" alt=""><div><h3>記録済みの親ペアがありません</h3><p>このルームで発見した配合を登録すると、ここに表示されます。</p></div></div>`;return;}
    container.innerHTML=records.map(record=>`<article class="combo-card">${palChip(record.parentA)}<span class="combo-card__plus">＋</span>${palChip(record.parentB)}<div class="combo-card__actions"><span class="record-state-dot is-verified"></span><button class="button button--ghost" type="button" data-open-record="${escapeHtml(record.id)}">開く</button></div></article>`).join("");
    $$('[data-open-record]',container).forEach(button=>button.addEventListener("click",()=>{state.selectedRecordId=button.dataset.openRecord;switchView("records");}));
    attachImageFallbacks(container);return;
  }
  let combos=(state.reverseMatrix.get(target.id)||[]).filter(c=>{const a=getPal(c.a),b=getPal(c.b);return !q||normalizeText(`${a?.name} ${b?.name} ${a?.enName} ${b?.enName}`).includes(q);});
  combos.sort((x,y)=>{const rx=recordStateForPair(getPal(x.a)?.name,getPal(x.b)?.name),ry=recordStateForPair(getPal(y.a)?.name,getPal(y.b)?.name);return Number(Boolean(ry))-Number(Boolean(rx));});
  const visible=combos.slice(0,120); if(!visible.length){container.innerHTML=`<div class="empty-state" style="grid-column:1/-1;min-height:260px"><img src="${PLAIN_EGG_ICON}" alt=""><div><h3>候補がありません</h3><p>検索条件を変更してください。</p></div></div>`;return;}
  container.innerHTML=visible.map(c=>{const a=getPal(c.a),b=getPal(c.b),existing=recordStateForPair(a.name,b.name);return `<article class="combo-card">${palChip(a.name)}<span class="combo-card__plus">＋</span>${palChip(b.name)}<div class="combo-card__actions">${c.special?`<span class="issue-badge">特殊</span>`:""}<span class="record-state-dot ${existing?.resultPal?"is-verified":existing?"is-pending":""}" title="${existing?.resultPal?"記録済み":existing?"確認中":"未記録"}"></span><button class="button button--ghost" type="button" data-record-combo="${a.id}|${b.id}|${target.id}">${existing?"開く":"記録"}</button></div></article>`;}).join("")+(combos.length>visible.length?`<div class="data-note" style="grid-column:1/-1">${combos.length}件中${visible.length}件を表示しています。親パル名で絞り込んでください。</div>`:"");
  $$('[data-record-combo]',container).forEach(button=>button.addEventListener("click",()=>handleComboRecord(button.dataset.recordCombo))); attachImageFallbacks(container);
}

function populateFilters(){byId("paldexElement").innerHTML=`<option value="">すべて</option>${ELEMENTS.map(v=>`<option>${v}</option>`).join("")}`;byId("paldexWork").innerHTML=`<option value="">すべて</option>${WORKS.map(v=>`<option>${v}</option>`).join("")}`;}

function filteredPals(){const q=normalizeText(byId("paldexSearch")?.value),element=byId("paldexElement")?.value,work=byId("paldexWork")?.value;return availablePalsForPaldex().filter(p=>(!q||normalizeText(`${p.name} ${p.enName} ${p.no}`).includes(q))&&(!element||p.elements.includes(element))&&(!work||p.works.some(w=>w.name===work)));}

function renderPaldex(){
  const pals=filteredPals(),available=availablePalsForPaldex();
  if(state.selectedPalId&&!available.some(p=>p.id===state.selectedPalId))state.selectedPalId="";
  byId("paldexCount").textContent=state.guideUnlocked?`${pals.length}体`:`発見 ${pals.length} / ${state.pals.length}体`;
  const visible=pals;
  byId("paldexGrid").innerHTML=visible.length?visible.map(p=>`<button class="pal-card-button${state.selectedPalId===p.id?" is-selected":""}" type="button" data-pal-detail="${p.id}"><span class="pal-card-button__no">No.${escapeHtml(p.no)}</span><img ${palImageAttrs(p)}><strong>${escapeHtml(p.name)}</strong><div class="element-list">${p.elements.map(e=>`<span class="element-tag">${e}</span>`).join("")}</div></button>`).join(""):`<div class="empty-state paldex-empty"><img src="${PLAIN_EGG_ICON}" alt=""><div><h3>まだ発見したパルがいません</h3><p>配合記録へ親または結果パルを登録すると、図鑑に追加されます。</p></div></div>`;
  byId("paldexLoadMore").hidden=true;
  $$('[data-pal-detail]',byId("paldexGrid")).forEach(button=>button.addEventListener("click",()=>{state.selectedPalId=button.dataset.palDetail;renderPaldex();renderPalDetail();if(matchMedia("(max-width:680px)").matches)openPalModal();}));attachImageFallbacks(byId("paldexGrid"));renderPalDetail();
}

function renderPalDetail(root=byId("palDetail")){
  if(!root)return;
  const available=availablePalsForPaldex(),pal=getPal(state.selectedPalId)||available[0];
  if(!pal){root.innerHTML=`<div class="detail-empty"><strong>発見したパルを選択してください</strong><p>配合記録に登場したパルだけが図鑑へ追加されます。</p></div>`;return;}
  let parents=[],children=[];
  if(state.guideUnlocked){
    parents=(state.reverseMatrix.get(pal.id)||[]).slice(0,8);
    if(state.matrixReady){for(const combo of state.matrix.values()){if((combo.a===pal.id||combo.b===pal.id)&&combo.childId){const partner=getPal(combo.a===pal.id?combo.b:combo.a),child=getPal(combo.childId);if(partner&&child)children.push({partner,child});if(children.length>=8)break;}}}
  }else{
    parents=state.records.filter(record=>record.resultPal&&normalizeText(record.resultPal)===normalizeText(pal.name)).slice(0,8).map(record=>({a:getPal(record.parentA)?.id,b:getPal(record.parentB)?.id,childId:pal.id}));
    children=state.records.filter(record=>record.resultPal&&(normalizeText(record.parentA)===normalizeText(pal.name)||normalizeText(record.parentB)===normalizeText(pal.name))).slice(0,8).map(record=>({partner:getPal(normalizeText(record.parentA)===normalizeText(pal.name)?record.parentB:record.parentA),child:getPal(record.resultPal)})).filter(item=>item.partner&&item.child);
  }
  const roomRecords=state.records.filter(r=>[r.parentA,r.parentB,r.resultPal].some(n=>normalizeText(n)===normalizeText(pal.name)));
  root.innerHTML=`<div class="pal-detail-hero"><img ${palImageAttrs(pal)}><span class="section-kicker">PALDECK No.${escapeHtml(pal.no)}</span><h2>${escapeHtml(pal.name)}</h2><p>${escapeHtml(pal.enName)}</p><div class="element-list">${pal.elements.map(e=>`<span class="element-tag">${e}</span>`).join("")}</div></div><div class="pal-detail-body"><section class="detail-section"><h3>作業適性</h3><div class="work-list">${pal.works.length?pal.works.map(w=>`<span class="work-tag">${w.name} Lv.${w.level}</span>`).join(""):`<span class="work-tag">データなし</span>`}</div></section><section class="detail-section"><h3>${state.guideUnlocked?"このパルを作れる配合":"このルームで発見した作り方"}</h3><div class="relation-list">${parents.length?parents.map(c=>relationRow(getPal(c.a),getPal(c.b),pal)).join(""):`<p class="form-help">記録済みの配合はありません。</p>`}</div></section><section class="detail-section"><h3>${state.guideUnlocked?"このパルを親にした配合":"このルームで発見した派生先"}</h3><div class="relation-list">${children.length?children.map(c=>relationRow(pal,c.partner,c.child)).join(""):`<p class="form-help">記録済みの派生配合はありません。</p>`}</div></section><section class="detail-section"><h3>このルームの関連記録</h3><p>${roomRecords.length}件</p><button class="button button--primary button--block" type="button" data-add-pal-record="${pal.id}">このパルを親Aにして記録</button></section></div>`;
  $('[data-add-pal-record]',root)?.addEventListener("click",()=>openRecordDialog("",{parentA:pal.name}));attachImageFallbacks(root);
}

function relationRow(a,b,c){return `<div class="relation-row">${palChip(a?.name)}<span>＋</span>${palChip(b?.name)}<span>→</span>${palChip(c?.name,{result:true})}</div>`;}

function openPalModal(){const dialog=byId("palModal"),body=byId("palModalBody");body.innerHTML=`<button class="icon-button" style="position:absolute;right:12px;top:12px;z-index:2" type="button" data-close-dialog="palModal"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button><div class="pal-detail-panel"></div>`;renderPalDetail($('.pal-detail-panel',body));bindDialogClose(body);dialog.showModal();}
