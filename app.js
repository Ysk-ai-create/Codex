'use strict';
const EQUIPMENT={
 '受水槽':[
  ['外観・漏水','タンク周辺、継ぎ目、配管接続部に水漏れや著しい腐食がないか目視で確認します。'],
  ['異音・振動','ポンプ運転時に普段と異なる音や大きな振動がないか確認します。危険な場合は無理に接近しないでください。'],
  ['周囲の清掃状態','点検通路に障害物がなく、周辺に著しい汚れがないか確認します。']],
 '消防設備':[
  ['消火器の設置状態','所定位置に設置され、転倒・著しい損傷・使用期限の問題がないか確認します。'],
  ['表示・標識','消火器や避難経路の表示が見やすく、障害物で隠れていないか確認します。'],
  ['警報設備の外観','感知器・発信機などに破損や障害物がないか目視で確認します。機能試験は有資格者等の適切な手順で実施してください。']],
 '共用灯':[
  ['点灯状態','点灯・消灯の状態やちらつきがないか確認します。'],
  ['器具の破損','カバーの割れ、落下のおそれ、著しい汚れがないか確認します。'],
  ['周辺の安全','照明付近に障害物や危険な配線露出がないか確認します。']],
 'エレベーター':[
  ['かご内の外観','かご内の破損・汚損・異常表示がないか目視で確認します。'],
  ['扉の外観','扉付近に障害物や目立つ損傷がないか確認します。専門的な動作試験は行わないでください。'],
  ['連絡先表示','非常時の連絡先や注意表示が読み取れるか確認します。']]
};
const STORAGE_KEY='inspection-demo-v1';
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function records(){try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(d)?d:[]}catch{return []}}
function save(data){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function notify(t){$('toast').textContent=t;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',3500)}
function status(r){return r.results.some(x=>x.value==='要対応')?'要対応':r.results.some(x=>x.value==='該当なし')?'確認済':'完了'}
function badge(t){return `<span class="badge ${t==='要対応'?'bad':t==='確認済'?'warn':''}">${safe(t)}</span>`}
function renderChecks(){const name=$('equipment').value;$('checklist').innerHTML=`<h2>${safe(name)}の点検項目</h2>`+EQUIPMENT[name].map(([title,help],i)=>`<div class="checkrow"><div class="checktitle"><strong>${safe(title)}</strong><button type="button" class="help" data-help="${i}" aria-label="${safe(title)}のヘルプ">?</button></div><div class="choices">${['良好','要対応','該当なし'].map(v=>`<label><input type="radio" name="check${i}" value="${v}" ${v==='良好'?'checked':''}>${v}</label>`).join('')}</div></div>`).join('');document.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>{let [t,h]=EQUIPMENT[name][+b.dataset.help];$('helpTitle').textContent=t;$('helpBody').textContent=h;$('helpDialog').showModal()})}
function render(){const all=records();const n=all.length;const issues=all.filter(r=>status(r)==='要対応').length;const today=new Date().toLocaleDateString('sv-SE');const todayCount=all.filter(r=>r.date===today).length;$('stats').innerHTML=[['登録済み点検',n+'件'],['要対応',issues+'件'],['本日の点検',todayCount+'件'],['登録設備種別',Object.keys(EQUIPMENT).length+'種類']].map(([k,v])=>`<div class="stat">${k}<strong>${v}</strong></div>`).join('');$('equipmentStatus').innerHTML=Object.keys(EQUIPMENT).map(k=>{let list=all.filter(r=>r.equipment===k);return `<div class="equipmentrow"><strong>${safe(k)}</strong>　${list.length}件　${list.length?badge(status(list.at(-1))):badge('未点検')}</div>`}).join('');const list=all.slice().reverse();$('recent').innerHTML=list.length?list.slice(0,5).map(row).join(''):'点検結果はまだありません。';$('historyList').innerHTML=list.length?list.map(r=>row(r,true)).join(''):'点検結果はまだありません。';document.querySelectorAll('[data-report]').forEach(b=>b.onclick=()=>report(b.dataset.report));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('この記録を削除しますか？')){save(records().filter(r=>r.id!==b.dataset.delete));render()}})}
function row(r,buttons=false){return `<div class="record"><div><strong>${safe(r.property)} / ${safe(r.equipment)}</strong><br><small>${safe(r.date)}・${safe(r.inspector)}</small>　${badge(status(r))}</div><div><button data-report="${safe(r.id)}">報告書を表示・PDF保存</button> ${buttons?`<button data-delete="${safe(r.id)}">削除</button>`:''}</div></div>`}
function report(id){const r=records().find(x=>x.id===id);if(!r)return;const win=window.open('','_blank');if(!win){alert('ポップアップがブロックされています。許可して再度お試しください。');return}const rows=r.results.map(x=>`<tr><td>${safe(x.title)}</td><td>${safe(x.value)}</td></tr>`).join('');win.document.write(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>設備点検報告書</title><style>body{font-family:system-ui,'Yu Gothic',sans-serif;max-width:800px;margin:30px auto;color:#222}h1{border-bottom:3px solid #126b91;padding-bottom:15px}table{border-collapse:collapse;width:100%;margin:20px 0}td,th{border:1px solid #bbb;padding:12px;text-align:left}th{background:#edf4f8}button{padding:12px;background:#126b91;color:white;border:0;border-radius:7px}@media print{button{display:none}}</style></head><body><h1>設備点検報告書（デモ）</h1><p>物件名：${safe(r.property)}</p><p>点検箇所：${safe(r.equipment)}</p><p>点検日：${safe(r.date)}　担当者：${safe(r.inspector)}</p><p>判定：${safe(status(r))}</p><h2>点検結果</h2><table><tr><th>点検項目</th><th>結果</th></tr>${rows}</table><h2>備考</h2><p>${safe(r.notes).replace(/\n/g,'<br>')||'なし'}</p><p>※サンプル帳票。正式な法定点検報告書ではありません。</p><button onclick="window.print()">印刷・PDFとして保存</button></body></html>`);win.document.close()}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==b.dataset.tab));render()});$('equipment').innerHTML=Object.keys(EQUIPMENT).map(k=>`<option>${safe(k)}</option>`).join('');$('equipment').onchange=renderChecks;$('date').value=new Date().toLocaleDateString('sv-SE');$('closeHelp').onclick=()=>$('helpDialog').close();$('inspectionForm').onsubmit=e=>{e.preventDefault();const eq=$('equipment').value;const results=EQUIPMENT[eq].map(([title],i)=>({title,value:document.querySelector(`input[name="check${i}"]:checked`).value}));const r={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),property:$('property').value.trim(),equipment:eq,date:$('date').value,inspector:$('inspector').value.trim(),notes:$('notes').value.trim(),results};if(!r.property||!r.inspector||!r.date)return;const all=records();all.push(r);try{save(all)}catch{alert('ブラウザの保存容量を超えました。履歴を削除してください。');return}notify('点検結果を登録しました');$('notes').value='';document.querySelector('[data-tab="dashboard"]').click()};renderChecks();render();
