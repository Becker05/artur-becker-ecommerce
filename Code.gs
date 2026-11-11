// Configure antes de implantar. A planilha permanece privada.
const SPREADSHEET_ID = 'COLE_O_ID_DA_PLANILHA';
const TAB_NAME = 'Leads';
const HEADERS = ['request_id','Recebido em','Nome','E-mail','Telefone','Investimento mensal','Situações','Página','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const INVESTMENTS = ['Ainda não invisto em anúncios','Até R$ 3.000 por mês','De R$ 3.001 a R$ 10.000 por mês','De R$ 10.001 a R$ 30.000 por mês','Mais de R$ 30.000 por mês'];
const SITUATIONS = ['Tenho Pixel/API instalados, mas não sei se os dados estão chegando corretamente','Meta Ads, Google Ads e Google Analytics mostram resultados diferentes e não sei exatamente em quais números confiar','Quero entender melhor o que acontece com o cliente dentro da loja, do acesso até a compra','Já acompanho tudo, mas quero validar se minha configuração pode ser melhorada'];
function validId(id) { return /^[a-f0-9-]{36}$/.test(id || ''); }
function sheet() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tab = book.getSheetByName(TAB_NAME) || book.insertSheet(TAB_NAME);
  if(tab.getLastRow()===0) {tab.appendRow(HEADERS);tab.setFrozenRows(1);}
  if(tab.getRange(1,1,1,HEADERS.length).getValues()[0].join('|')!==HEADERS.join('|')) throw new Error('Cabeçalho incompatível: use uma aba Leads nova.');
  return tab;
}
function exists(tab,id) {
  return tab.getLastRow()>1 && !!tab.getRange(2,1,tab.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext();
}
function safeCell(value) {
  const text=String(value || '').slice(0,2000);
  return /^[=+\-@\t\r\n]/.test(text)?"'"+text:text;
}
function doPost(e) {
  try {
    const p=e.parameter || {};
    const simple = p.form_version === 'lp2_v2';
    const difficulties = [
      'As compras da loja e dos anúncios mostram números diferentes',
      'Tenho o pixel instalado, mas não sei se está funcionando',
      'Não sei quais anúncios trazem vendas',
      'Tenho outra dúvida sobre os dados da loja'
    ];
    const situations = simple ? [p.dificuldade] : JSON.parse(p.situacoes || '[]');
    const validName = p.nome && p.nome.trim() && p.nome.length <= 160;
    const validPhone = p.telefone && p.telefone.length <= 40 && /^(?:55)?[1-9]\d{9,10}$/.test(p.telefone.replace(/\D/g, ''));
    if (!validId(p.request_id) || p.website_check) throw new Error('Dados inválidos');
    if (simple) {
      if (!validName || !validPhone || (p.email && (p.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))) || !difficulties.includes(p.dificuldade)) throw new Error('Dados inválidos');
    } else if (!p.nome || p.nome.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '') || (p.email || '').length > 254 || !p.telefone || p.telefone.length > 40 || !INVESTMENTS.includes(p.investimento) || !Array.isArray(situations) || !situations.length || situations.length > 4 || situations.some(s => !SITUATIONS.includes(s))) {
      throw new Error('Dados inválidos');
    }
    const lock=LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const tab=sheet();
      if(!exists(tab,p.request_id)) tab.appendRow([p.request_id,new Date(),safeCell(p.nome),safeCell(p.email),safeCell(p.telefone),safeCell(simple ? '' : p.investimento),safeCell(situations.join(' | ')),...['page','utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k=>safeCell(p[k]))]);
      SpreadsheetApp.flush();
    } finally {lock.releaseLock();}
    return ContentService.createTextOutput('received');
  } catch(error) {
    console.error('Falha ao receber solicitação: '+error.message);
    return ContentService.createTextOutput('error');
  }
}
function doGet(e) {
  const id=(e.parameter || {}).id;
  let saved=false;
  if(validId(id)) {
    try {saved=exists(sheet(),id);} catch(error) {console.error(error.message);}
  }
  // Sem dados pessoais. Callback fixo; parâmetros não são executados como código.
  return ContentService.createTextOutput('window.diagnosticoAck('+JSON.stringify({id:validId(id)?id:'',saved:!!saved})+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
