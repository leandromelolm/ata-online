const spreadSheet = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID);

/** 
 * GET
 * **/
const doGet = (e) => {
//  const lock = LockService.getScriptLock();
//  lock.tryLock(10000);
  try {
    const { parameter } = e;
    const {ata, eventoid, matricula, action, novostatus, user, deviceid, atok, rtok} = parameter;
    const eventos = e.parameters.ev;

    if(action === 'politica-de-privacidade') {
      return politicaDePrivacidade();
    }

    if(action === 'termos-de-uso') {
      return termosDeUso();
    }

    if(action === 'userEventDelete') {
      return deletarEvento(atok, eventos);
    }

    if (e.pathInfo == 'index')
      return HtmlService.createHtmlOutputFromFile("index")
      .setTitle('AtaOnline | Doc');

    if (action === 'userEventList')
      if(!validarToken(atok))
        return outputError('token expirado ou inválido')
      else
        return listarEventosDoUsuario(user)
      // ?action=userEventList&user={USERNAME}&atok=${ACCESS_TOKEN}
    
    if (action === 'refreshToken')
      return renovarToken(rtok, deviceid);
      // ?rtok={REFRESH_TOKEN}&deviceid={DEVICE_ID}&action=refreshToken
    
    if (action === 'logout')
      return logoutDesativaSessao(deviceid)
      // ?logoutdeviceid={DEVICE_ID}&action=logout

    if (ata)
      return findByEvento(ata); 
      // ?ata={ID_EVENTO}

    if (action === 'todosParticipantes' && eventoid)
      return encontrarTodosParticipantesColunaParticipantesDTO(eventoid); 
      // ?eventoid={ID_EVENTO}&action=todosParticipantes

    if (action === 'participantePorMatricula' && matricula && eventoid)
      return encontrarParticipantePorMatricula(matricula, eventoid); 
      // ?matricula={MATRICULA}&eventoid={ID_EVENTO}&action=participantePorMatricula

    if (action === 'editarstatusevento' && eventoid && novostatus && validarToken(atok))
      return editStatusEvento(eventoid, novostatus, 'A');
       // ?eventoid={ID_EVENTO}&novostatus={NOVO_STATUS}&atok={ACCESS_TOKEN}&action=editarstatusevento

    throw  error = {"status": 'error', "details": `parâmetros não encontrada`};    
  } catch (error) {
    return outputError('erro na função doGet', {erro: error, messagem: error.message});
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

    if (data.action === 'createEvento')
      if(!validarToken(data.atok))
        return outputError('token expirado ou inválido')
      else
        return createEvento(data);

    if (data.action === 'authCredentials')
      return login(data.username, data.password, data.deviceid);
    
    if (data.action === 'refreshToken')
      return renovarToken(data.rtok, data.deviceid);

  throw  error = {"status": 'error', "details": `parâmetros não encontrada`};
  } catch (error) {
    return outputError('erro na requisicao post' , error.message);
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
        e.id, e.data, e.hora, e.local, e.titulo, e.descricao, e.status, e.bCoordenadasParaAutorizarRegistro,
        e.idFolder, 'http***',{ lat: e.coords.lat, long: e.coords.long }, e.dono
      )
    };    
    return outputSuccess('Objeto encontrado', eventoEncontrado);

  } catch(e) {
    throw  error = {'status': 'error', 'details': `erro ao buscar evento: ${txtBuscado} - erro: ${e}`};
  }  
}

/** Criar Evento */
function createEvento(d){
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
      d.bCoordenadasParaAutorizarRegistro, 
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
function editStatusEvento(idEvento, statusNovo, letraColuna) {
  const aba = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName('EVENTOS');
  coluna = aba.getRange(`${letraColuna}:${letraColuna}`);
  var textFinder = coluna.createTextFinder(idEvento);
  textFinder.matchEntireCell(true);
  var resultados = textFinder.findAll();
  let flag = false;
  let evEdit = {};
  resultados.forEach(function(celula) {
    aba.getRange(celula.getRow(), 7).setValue(statusNovo);
    let colEventoJson = aba.getRange(celula.getRow(), 10).getValue();
    evEdit = JSON.parse(colEventoJson);

    const eventoEditadoStatus = new Evento(
      evEdit.id,
      evEdit.data,
      evEdit.hora,
      evEdit.local,
      evEdit.titulo,
      evEdit.descricao,
      statusNovo,
      evEdit.bCoordenadasParaAutorizarRegistro,
      evEdit.idFolder,
      evEdit.urlFolder,
      { lat: evEdit.coords.lat, long: evEdit.coords.long },
      evEdit.dono
    );

    aba.getRange(celula.getRow(), 10).setValue(JSON.stringify(eventoEditadoStatus));
    flag = true;
  });
  if(flag) {
    eventoEditadodeResposta = {
      id: evEdit.id,
      data: evEdit.data,
      hora: evEdit.hora,
      titulo: evEdit.titulo,
      status: evEdit.statusNovo,
      bCoordenadasParaAutorizarRegistro: evEdit.bCoordenadasParaAutorizarRegistro
    }
    return outputSuccess('Edição executada com sucesso', eventoEditadodeResposta);
  } else
    return outputError('Evento não encontrado', 'Edição de evento não foi executada' );    
}

/** 
 * Deletar Eventos do usuário 
 * ?action=userEventDelete&user={USERNAME}&atok={ACCESS_TOKEN}&ev={EVENTO_ID}&ev={EVENTO_ID}&ev={EVENTO_ID}
 * 
**/
function deletarEvento(atok, eventos) {
  if(!validarToken(atok)) return authenticationError();
  const user = extrairUsuarioDoToken(atok);
  const eventosDeletado = [];
  eventos.forEach((evento) => {
    const eventoEncontrado = findByEventoId(evento);
    if (eventoEncontrado.evento !== false) {
      if (eventoEncontrado.evento[10] === user.username) { // evento[10] = Coluna K (Proprietario)
        const sheet = spreadSheet.getSheetByName(env().SHEETNAME_EVENTOS);
        sheet.deleteRow(eventoEncontrado.positionRow);
        deletarAba(eventoEncontrado.evento[0]);
        eventosDeletado.push(eventoEncontrado.evento[0]);
      }
    }
  })
  const response = {
    eventos: eventos,
    numberOfDeletedEvents: eventosDeletado.length,
    deletedEvents: eventosDeletado,
    username: user.username
  }
  return outputSuccess('Evento deletado com sucesso', response);
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

function authenticationError() {
  return outputError('Usuário não está logado');
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
function listarEventosDoUsuario(textToFind, column = 'K', sheet = env().SHEETNAME_EVENTOS) {
  const sh = folhaDaPlanilha(sheet);
  coluna = sh.getRange(`${column}:${column}`);
  const textFinder = coluna.createTextFinder(textToFind);
  textFinder.matchEntireCell(true);
  const result = textFinder.findAll();
  if (result.length === 0)
    return { success: false, result: 'Nenhum objeto encontrado' };
  const eventos = [];
  result.forEach((celula) => {
    const evento = sh.getRange(celula.getRow(), 10).getValues().flat() // 10 = coluna J
    let { id, titulo, local, data, hora, descricao, status, bCoordenadasParaAutorizarRegistro, coords } = JSON.parse(evento[0]);
    eventoDTO = new EventoDTO(id, data, hora, local, titulo, descricao, status, bCoordenadasParaAutorizarRegistro, coords);
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
    throw  error = {'status': 'error', 'details': `Não foi possível criar a folha na planilha.`};
  }
}

function dublicarAbaModeloParaNovoEvento(nomeDaFolha) {
  let abaModelo = spreadSheet.getSheetByName('ATA_MODELO');
  if (abaModelo) {
    let novaAba = abaModelo.copyTo(spreadSheet);
    novaAba.setName(nomeDaFolha);
  } else {
    throw  error = {"status": 'error', "details": `Não foi possível duplicar a aba`};
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
 