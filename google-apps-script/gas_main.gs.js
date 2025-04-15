const spreadSheet = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID);

/** 
 * GET
 *
 * buscar evento por id • ?action=evento-por-id&ata=ID_EVENTO
 * refresh token • ?action=refreshToken&rtok=REFRESH_TOKEN&deviceid=DEVICE_ID
 * deslogar usuario • ?action=logout&logoutdeviceid=DEVICE_ID
 * listar eventos • ?action=user-event-list&user=USERNAME&atok=ACCESS_TOKEN 
 * deletar eventos • ?action=user-event-delete&user=USERNAME&atok=ACCESS_TOKEN&ev=EVENTO_ID&ev=EVENTO_ID&ev=EVENTO_ID
 * editar evento • ?action=user-event-edit&eventoid=ID_EVENTO&novostatus=NOVO_STATUS&bRestritoParaInLoco=BOOLEAN&bObterLocalDoParticipante=BOOLEAN&atok=ACCESS_TOKEN
 * buscar todos os participantes por evento • ?action=all-participant-event&eventoid=ID_EVENTO
 * buscar participante por matricula • ?action=find-participant-by-matricula&matricula=MATRICULA&eventoid=ID_EVENTO
 *
 * **/
const doGet = (e) => {
//  const lock = LockService.getScriptLock();
//  lock.tryLock(10000);
  try {
    const { parameter } = e;
    const {ata, eventoid, matricula, action, novostatus, user, deviceid, atok, rtok, 
    bRestritoParaInLoco, bObterLocalDoParticipante} = parameter;
    const eventos = e.parameters.ev;

    if (e.pathInfo == 'index')
      return HtmlService.createHtmlOutputFromFile("index").setTitle('AtaOnline | Doc');

    if (action === 'politica-de-privacidade')
      return politicaDePrivacidade();

    if (action === 'termos-de-uso')
      return termosDeUso();

    if (action === 'evento-por-id' && ata)
      return findByEvento(ata); 
    
    if (action === 'refreshToken')
      return renovarToken(rtok, deviceid);
  
    if (action === 'logout')
      return logoutDesativaSessao(deviceid)
      
    if (action === 'user-event-list' && atok)
        return listarEventosDoUsuario(atok, user)

    if (action === 'user-event-delete' && atok)
      return deletarEvento(atok, eventos);

    if (action === 'user-event-edit' && eventoid && novostatus && atok)
      return editStatusEvento(atok, eventoid, novostatus, bRestritoParaInLoco, bObterLocalDoParticipante);

    if (action === 'all-participant-event' && eventoid)
      return encontrarTodosParticipantesColunaParticipantesDTO(eventoid); 

    if (action === 'find-participant-by-matricula' && matricula && eventoid)
      return encontrarParticipantePorMatricula(matricula, eventoid); 

    throw new Error(`parâmetros não encontrada`);

  } catch (err) {
    return outputError('erro na requisição doGet', {error: err.name, message: err.message}); // details: err.stack - para debug
  }
//   finally {
//    lock.releaseLock();
//  }
}

/** 
 * POST
 * **/
const doPost = (e) => {
//  const lock = LockService.getScriptLock();
//  if (!lock.tryLock(10000))
//   return outputError('Serviço ocupado, tente novamente mais tarde.', 'lock.tryLock' )
  try {
    let data = JSON.parse(e.postData.contents);

    if (data.action === 'addParticipante')
      return addParticipanteNoEvento(data);

    if (data.action === 'authCredentials')
      return login(data.username, data.password, data.deviceid);
    
    if (data.action === 'refreshToken')
      return renovarToken(data.rtok, data.deviceid);

    if (data.action === 'createEvento')
      return createEvento(data.atok, data);

    //throw  error = {"status": 'error', "details": `parâmetros não encontrada`};
    throw new Error(`parâmetros não encontrada`);

  } catch (err) {
    return outputError('erro na requisição doPost' , {error: err.name, message: err.message}); // details: err.stack - para debug
  } 
//  finally {
//    lock.releaseLock();
//  }
}

/** Encontrar Evento */
function findByEvento(txtBuscado) {
  try { 
    let guiaEventos = spreadSheet.getSheetByName(env().SHEETNAME_EVENTOS);
    let col = "A";
    let textFinder = guiaEventos.getRange(col + ":" + col).createTextFinder(txtBuscado);
    let resultados = textFinder.findAll();

    if (resultados.length == 0 || resultados[0].getValue() !== txtBuscado){
      return outputError(`Nenhum resultado encontrado. Pesquisa: ${txtBuscado}`, "Object Not Found");
    }

    for (let i = 0; i < resultados.length; i++) {
      let resultado = resultados[i];
      let linha = resultado.getRow();      
      let colunaJ = guiaEventos.getRange("J" + linha).getValue();
      let e = JSON.parse(colunaJ);

      eventoEncontrado = new Evento(
        e.id, e.data, e.hora, e.local, e.titulo, e.descricao, e.status, e.bRestritoParaInLoco, 
        e.bObterLocalDoParticipante,e.idFolder, 'http***',{ lat: e.coords.lat, long: e.coords.long }, e.dono
      )
    };    
    return outputSuccess('Objeto encontrado', eventoEncontrado);

  } catch(e) {
    //throw  error = {'status': 'error', 'details': `erro ao buscar evento: ${txtBuscado} - erro: ${e}`};
    throw new Error(`erro ao buscar evento: ${txtBuscado} - erro: ${e}`);
  }  
}

/** Criar Evento */
function createEvento(atok, d) {

  if(!validarToken(atok)) return outputError('token expirado ou inválido');

  let uuid = gerarUuidParticionado();
  let dt = new Date(d.data).toISOString().split('T')[0].replaceAll('-','');
  let pasta = criarPastaParaEvento(`${dt}_${uuid}`);
  // let idPlanilha = criarFolhaNaPlanilhaParaNovoEvento(`${dt}_${uuid}`);
  let idPlanilha = dublicarAbaModeloParaNovoEvento(`${dt}_${uuid}`);
  try{
    const eventoCriado = new Evento(
      idPlanilha, 
      formatDate(d.data), 
      d.hora, 
      d.local, 
      d.titulo, 
      d.descricao, 
      d.status, 
      d.bRestritoParaInLoco,
      d.bObterLocalDoParticipante,
      pasta.folderId, 
      pasta.folderUrl, 
      { lat: d.coords.lat, long: d.coords.long },
      d.dono
    )
    return salvarNovoEventoNaPlanilha(eventoCriado);
  } catch(err) {
    console.error(err.message);
    return outputError('erro ao criar evento', err.message)
  }  
}

/** Editar Status do Evento  */
function editStatusEvento(atok, idEvento, statusNovo, bRestritoParaInLocoParam, bObterLocalDoParticipanteParam, column = 'A') {
  if(!validarToken(atok)) return authenticationError();

  // pega as string e converte para boolean
  const bRestritoParaInLoco = bRestritoParaInLocoParam === 'true';
  const bObterLocalDoParticipante = bObterLocalDoParticipanteParam === 'true';

  const aba = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName('EVENTOS');
  coluna = aba.getRange(`${column}:${column}`);
  var textFinder = coluna.createTextFinder(idEvento);
  textFinder.matchEntireCell(true);
  var resultados = textFinder.findAll();
  let flag = false;
  let eventoSelecionado = {};

  resultados.forEach(function(celula) {
    aba.getRange(celula.getRow(), 7).setValue(statusNovo);
    let colEventoJson = aba.getRange(celula.getRow(), 10).getValue();
    eventoSelecionado = JSON.parse(colEventoJson);
    
    const eventoEditadoStatus = new Evento(
      eventoSelecionado.id,
      eventoSelecionado.data,
      eventoSelecionado.hora,
      eventoSelecionado.local,
      eventoSelecionado.titulo,
      eventoSelecionado.descricao,
      statusNovo,
      bRestritoParaInLoco,
      bObterLocalDoParticipante,
      eventoSelecionado.idFolder,
      eventoSelecionado.urlFolder,
      { lat: eventoSelecionado.coords.lat, long: eventoSelecionado.coords.long },
      eventoSelecionado.dono
    );

    aba.getRange(celula.getRow(), 10).setValue(JSON.stringify(eventoEditadoStatus));
    flag = true;
  });

  if(!flag)
    return outputError('Evento não encontrado', 'Edição de evento não foi executada' );
  
  eventoEditadodeResposta = {
    id: eventoSelecionado.id,
    data: eventoSelecionado.data,
    hora: eventoSelecionado.hora,
    titulo: eventoSelecionado.titulo,
    status: statusNovo,
    bRestritoParaInLoco: bRestritoParaInLoco,
    bObterLocalDoParticipante: bObterLocalDoParticipante
  }
  return outputSuccess('Edição executada com sucesso', eventoEditadodeResposta);
}

/** Deletar um ou vários eventos do usuário */
function deletarEvento(atok = '', eventos = ["","",""]) {
  if(!validarToken(atok)) return authenticationError();
  const user = extrairUsuarioDoToken(atok);
  const eventosDeletado = [];
  eventos.forEach((evento) => {
    const eventoEncontrado = findByEventoId(evento);
    const eventoObj = JSON.parse(eventoEncontrado.evento[9]);
    if (eventoEncontrado.evento !== false &&
      eventoEncontrado.evento[10] === user.username && // evento[10] = Coluna K (Proprietario)
      verificarDataDoEvento(eventoObj.data)) {
        const sheet = spreadSheet.getSheetByName(env().SHEETNAME_EVENTOS);
        sheet.deleteRow(eventoEncontrado.positionRow);
        deletarAba(eventoEncontrado.evento[0]);
        deletarPastaPorId(eventoObj.idFolder);
        eventosDeletado.push(eventoEncontrado.evento[0]);
        console.log('evento deletado')
    }
  })
  const response = {
    eventos: eventos,
    numberOfDeletedEvents: eventosDeletado.length,
    deletedEvents: eventosDeletado,
    username: user.username
  }
  if(eventosDeletado.length > 0)
    return outputSuccess('Evento deletado com sucesso', response);
  else 
    return outputSuccess('Nenhum evento foi deletado', response); // Retornado outputSuccess para retornar o objeto response. Mas o content.numberOfDeletedEvents tem o valor = 0.
}

/** Impedir que seja deletado um evento de data passada, e assim não perder informações */
function verificarDataDoEvento(dataEventoString) {
  const [dia, mes, ano] = dataEventoString.split("-").map(Number);
  const dataConvertida = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  console.log(dataConvertida);
  if (dataConvertida > hoje) return true
  else return false
}

/** deletar aba(folha) da planilha */
function deletarAba(id) {
  const folha = spreadSheet.getSheetByName(id);
  if (folha) {
    spreadSheet.deleteSheet(folha);
    console.log("Folha deletada com sucesso!");
  } else {
    console.log("A folha não foi encontrada.");
  }
}

/** deletar pasta */
function deletarPastaPorId(folderId) {
  try {
    var pasta = DriveApp.getFolderById(folderId);
    var pastaPai = pasta.getParents().next(); // Obtém a pasta pai
    pastaPai.removeFolder(pasta);
    Logger.log(`Pasta com ID '${folderId}' deletada com sucesso.`);
  } catch (error) {
    Logger.log(`Erro ao deletar a pasta com ID '${folderId}': ${error}`);
  }
}

function authenticationError() {
  return outputError('Usuário não está logado', 'Falha na autenticação');
}

function findByEventoId(id) {
  const sheet = spreadSheet.getSheetByName(env().SHEETNAME_EVENTOS);
  const col = "A";
  const textFinder = sheet.getRange(col + ":" + col).createTextFinder(id);
  textFinder.matchEntireCell(true);
  const encontrado = textFinder.findNext();
  if (!encontrado) return {evento: false};
  const evento = sheet.getRange(encontrado.getRow(), 1, 1, sheet.getLastColumn()).getValues().flat()
  return {evento: evento, positionRow: encontrado.getRow()};
}

/** Listar todos os Eventos do usuário  */
function listarEventosDoUsuario(atok, textToFind, column = 'K', sheet = env().SHEETNAME_EVENTOS) {
  if(!validarToken(atok)) return outputError('token expirado ou inválido');
  const sh = folhaDaPlanilha(sheet);
  coluna = sh.getRange(`${column}:${column}`);
  const textFinder = coluna.createTextFinder(textToFind);
  textFinder.matchEntireCell(true);
  const result = textFinder.findAll();
  if (result.length === 0)
    return outputSuccess('Nenhum evento encontrado',{ 'size': 0, 'itens': '' });
  const eventos = [];
  result.forEach((celula) => {
    const evento = sh.getRange(celula.getRow(), 10).getValues().flat() // 10 = coluna J
    let { id, titulo, local, data, hora, descricao, status, bRestritoParaInLoco, bObterLocalDoParticipante, coords } = JSON.parse(evento[0]);
    eventoDTO = new EventoDTO(id, data, hora, local, titulo, descricao, status, bRestritoParaInLoco, bObterLocalDoParticipante, coords);
    eventos.push(eventoDTO);
  });
  return outputSuccess(`${textToFind}`, { 'size': result.length, 'itens': eventos });
}

function folhaDaPlanilha(sheetName) {
  return SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName(sheetName);
};

/** Encontrar Todos ParticipantesDTO */
function encontrarTodosParticipantesColunaParticipantesDTO(eventoId) {
  const sh = spreadSheet.getSheetByName(eventoId);
  if(!sh || eventoId == 'EVENTOS')
    return outputError('evento não encontrado', 'erro ao buscar todos os participantes');
  const values = sh.getRange(2, 10, sh.getLastRow()-1, 1).getValues(); // coluna 10 - ParticipantesDTO
  const items = values.flat();
  // let data = [];
  // items.forEach(i => {
  //   let d = JSON.parse(i);
  //   data.push(d);
  // })
  return outputSuccess({'eventoId': eventoId}, items);
}

/** Encontrar Participantes Por Matrícula */
function encontrarParticipantePorMatricula(valorPesquisado, eventoId) {
  if (eventoId === 'EVENTOS')
    return outputError('evento id inválido', 'erro na pesquisa por matrícula')
  const coluna = 4 // coluna que estão as matrículas
  const planilha = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName(eventoId);
  if(!planilha)
    return outputError('evento não encontrado', 'erro ao buscar participante');
  const dados = planilha.getDataRange().getValues();
  const indiceColuna = coluna - 1; // Índice da coluna ajustado para 0 (ex: Coluna 1 = índice 0)
  for (let i = 0; i < dados.length; i++) {
    if (dados[i][indiceColuna] == valorPesquisado) {
      const idParticipante = dados[i][1]
      return outputSuccess(`Valor "${valorPesquisado}" encontrado!` ,idParticipante);
    }
  }
  return outputError(`Valor "${valorPesquisado}" não encontrado.`, 'Nenhum valor encontrado');
}

/** Adicionar Participante no Evento */
function addParticipanteNoEvento(dados) {
  if (dados.status === 'ABERTO') {
  const folder = DriveApp.getFolderById(dados.folderId);
  const imageBlob = processImageBlob(dados.base64File);
  const id = Utilities.getUuid();
  const file = folder.createFile(imageBlob.setName(`${id}_image.png`));
  const timeStamp = new Date();
  const _sheet = spreadSheet.getSheetByName(dados.sheetPageId); // alterar atributo para sheetNameId
  const participanteDTO = {
      id: id,
      startLetter: dados.startLetter,
      hiddenMat: dados.hiddenMat
   }
  _sheet.appendRow([
    timeStamp, 
    id, 
    dados.userName, 
    dados.matricula, 
    dados.cpf, 
    dados.distrito, 
    dados.unidade, 
    dados.enderecoLocal, 
    file.getDownloadUrl(),
    JSON.stringify(participanteDTO)   
  ]);
  return outputSuccess('Arquivo enviado com sucesso!', {"sheetId": id, 'momento': timeStamp});
  } else {
    return outputError('Evento não está com status Aberto', '');
  }
}

function processImageBlob(base64Content) {
  const decodedContent = Utilities.base64Decode(base64Content); 
  const blob = Utilities.newBlob(decodedContent, 'image/png', 'uploaded_image.png');
  return blob;
}

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}

function gerarUuidParticionado() {
  var uuid = Utilities.getUuid();
  let parte = uuid.split('-');
  let uuidModificado = `${parte[0]}-${parte[1]}-${parte[4]}`
  return uuidModificado;
}

function criarPastaParaEvento(nomeDaPasta) {
  var nomeDoSubdiretorio = "ata-online";
  var nomeDaSubPasta = "ata-online_imagens";
  var pastas = DriveApp.getFoldersByName(nomeDoSubdiretorio);
  if (!pastas.hasNext()) {
    throw new Error(`A pasta '${nomeDoSubdiretorio}' não foi encontrada.`);
  }
  var pastaPai = pastas.next();
  
  var subPastas = pastaPai.getFoldersByName(nomeDaSubPasta);
  var pastaImagens;
  if (subPastas.hasNext()) {
    pastaImagens = subPastas.next();
  } else {
    pastaImagens = pastaPai.createFolder(nomeDaSubPasta);
  }
  var novaPasta = pastaImagens.createFolder(nomeDaPasta);
  return {
    "folderId": novaPasta.getId(),
    "folderUrl": novaPasta.getUrl()
  };
}

function criarFolhaNaPlanilhaParaNovoEvento(nomeDaFolha) {  
  var abasExistentes = spreadSheet.getSheets().map(function(sh) {
    return sh.getName();
  });  
  if (abasExistentes.includes(nomeDaFolha)) {
    Logger.log("Uma folha com o nome '" + nomeDaAba + "' já existe.");
    return;
  }
  var novaAba = spreadSheet.insertSheet(nomeDaFolha);  
  if (novaAba) {
    Logger.log("A folha '" + nomeDaFolha + "' foi criada com sucesso!");
    return nomeDaFolha;
  } else {
    //throw  error = {'status': 'error', 'details': `Não foi possível criar a folha na planilha.`};
    throw new Error(`Não foi possível criar a folha na planilha.`);
  }
}

function dublicarAbaModeloParaNovoEvento(nomeDaFolha) {
  let abaModelo = spreadSheet.getSheetByName('ATA_MODELO');
  if (abaModelo) {
    let novaAba = abaModelo.copyTo(spreadSheet);
    novaAba.setName(nomeDaFolha);
  } else {
    //throw  error = {"status": 'error', "details": `Não foi possível duplicar a aba`};
    throw new Error(`Não foi possível duplicar a aba`);
  }
  return nomeDaFolha;
}

function salvarNovoEventoNaPlanilha(e) {
  try {
    const sheetEventos = spreadSheet.getSheetByName(env().SHEETNAME_EVENTOS);
    sheetEventos.appendRow(
      [e.id, e.data, e.hora, e.local, e.titulo, e.descricao, e.status, e.idFolder, e.urlFolder, JSON.stringify(e), e.dono]
    );
    return outputSuccess('evento criado com sucesso!', {"id": e.id});
  } catch(e) {
    return outputError('erro ao salvar na planilha', e.message );
  }  
}

// GET E POST
function renovarToken(refreshToken, deviceId) {
  let rt = renewToken(refreshToken, deviceId);
  if(!rt.success)
    return outputError('erro ao atualizar', rt)
  return outputSuccess('token atualizado', rt.content);
}

// POST - CHECK CREDENCIAIS
function login(username, password, deviceid) {
  let data = checkAuthCredentials(username, password, deviceid);
  if(!data.success)
    return outputError('Erro na autenticação', data.content);
  return outputSuccess('Sucesso na autenticação', data.content);
}

function logoutApagaSessao(deviceId) {
  let data = deleteUserSession(undefined, deviceId);
  if (!data.success)
    return outputError(data.message, 'Erro ao apagar sessão de usuário');
  return outputSuccess(data.message, data.result)
};

function logoutDesativaSessao(deviceId) {
  const data = updateSessionStatus(deviceId);
  if (!data.success)
    return outputError(data.message, 'Erro ao desativar sessão de usuário');
  return outputSuccess(data.message, `sessão do dispositivo ${deviceId} desativado`)
}

function validarToken(accessToken) {
  const resultado = validateToken(accessToken, env().KEY_ACCESS_TOKEN)
  if (resultado.auth) return true;
  return false
}

function outputSuccess(message, content) {
  let output = ContentService.createTextOutput(), data = {};
  data = {
    "success": true,
    "message": message,
    "content": content
  };  
  output.setContent(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  return output;
}

function outputError(message, error = 'erro') {
  let output = ContentService.createTextOutput();
  let res = {
    "success": false,
    "message": message,
    "error": error
  };
  output.setContent(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  return output;
}

function politicaDePrivacidade() {
  try {
    const docId = env().DOCUMENT_ID_POLITICA_DE_PRIVACIDADE;
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const text = body.getText();
    // return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
    return ContentService.createTextOutput(JSON.stringify({ content: text })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput("Erro: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function termosDeUso() {
  try {
    const docId = env().DOCUMENT_ID_TERMOS_DE_USO;
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const text = body.getText();
    return ContentService.createTextOutput(JSON.stringify({ content: text })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput("Erro: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function env_example() {
  const ENV_SPREADSHEET_ID = '';
  const ENV_FOLDER_ID = '';
  const SHEETNAME_EVENTOS = '';
  const PRIVATE_KEY_HASH = '';
  const SHEETNAME_USER = '';
  const ENV_CRYPTO_KEY_SECRET = '';
  const KEY_ACCESS_TOKEN = '';
  const KEY_REFRESH_TOKEN = '';
  const SHEETNAME_REFRESH ='';
  const DOCUMENTO_ID_POLITICA_DE_PRIVACIDADE = '';
  const DOCUMENTO_ID_TERMOS_DE_USO = '';
  return {
    ENV_SPREADSHEET_ID, 
    ENV_FOLDER_ID, 
    SHEETNAME_EVENTOS, 
    PRIVATE_KEY_HASH, 
    SHEETNAME_USER, 
    ENV_CRYPTO_KEY_SECRET,
    KEY_ACCESS_TOKEN,
    KEY_REFRESH_TOKEN,
    SHEETNAME_REFRESH,
    DOCUMENTO_ID_POLITICA_DE_PRIVACIDADE,
    DOCUMENTO_ID_TERMOS_DE_USO
  };
}

/**
 *  Projeto Google Apps Script
 * 
 * criar o projeto do tipo: web app
 * permissão de acesso: qualquer pessoa
 * 
 * ENV_FOLDER_ID = id da pasta que será salva no google drive
 * ENV_SPREADSHEET_ID: id da panilha google
 * 
 * renomear função env_example() para env()
 * 
 * projeto usa CryptoJS v3.1.2 na função decrypt()
 * 
 * */
 