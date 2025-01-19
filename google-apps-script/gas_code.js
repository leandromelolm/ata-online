const spreadsheetId = env().ENV_SPREADSHEET_ID;
const spreadSheet = SpreadsheetApp.openById(spreadsheetId);
const sheetEventos = spreadSheet.getSheetByName(env().SHEETNAME_EVENTOS);

/** GET **/
const doGet = (e) => {
//  const lock = LockService.getScriptLock();
//  lock.tryLock(10000);
  try {
    const { parameter } = e;
    const { ata, participante, eventoid, matricula, action, novostatus, user, pw, teste } = parameter;

    if(teste)
      return outputSuccess(true, e);

    if (ata)
      return findByEvento(ata); 
      // ?ata={ID_EVENTO}

    if (participante === 'all' && eventoid)
      return todosValoresDaColunaParticipantesDTO(eventoid); 
      // ?participante=all&eventoid={ID_EVENTO}

    if (participante === 'matricula' && matricula && eventoid)
      return encontrarParticipantePorMatricula(matricula, eventoid); 
      // ?participante=matricula&matricula={MATRICULA}&eventoid={ID_EVENTO}

      if(action === 'editarstatusevento' && eventoid && novostatus)
        if(authUser(user, pw))
          return editStatusEvento(eventoid, novostatus, 'A');
          // ?user={USER}&pw={PW}&action=editarstatusevento&eventoid={ID_EVENTO}&novostatus={NOVO_STATUS}

    throw  error = {"status": 'error', "details": `parâmetros não encontrada`};    
  } catch (error) {
    return outputError(false, 'erro na requisição get', error.message);
  }
//   finally {
//    lock.releaseLock();
//  }
}

/** POST **/
const doPost = (e) => {
//  const lock = LockService.getScriptLock();
//  if (!lock.tryLock(10000))
//   return outputError(false, 'Serviço ocupado, tente novamente mais tarde.', 'lock.tryLock' ) 
  try {
    let data = JSON.parse(e.postData.contents);

    if (data.action === 'addParticipante')
      return addParticipanteNoEvento(data);

    if (data.action === 'addEvento')
      return addEvento(data);

  throw  error = {"status": 'error', "details": `parâmetros não encontrada`};
  } catch (error) {
    return outputError(false, 'erro na requisicao post' , error.message);
  } 
//  finally {
//    lock.releaseLock();
//  }
}

// GET
function findByEvento(txtBuscado) {
  try { 
    let guia = sheetEventos;  
    let colunaParaPesquisar = "A";
    let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar).createTextFinder(txtBuscado);
    let resultados = textFinder.findAll();

    if (resultados.length == 0 || resultados[0].getValue() !== txtBuscado){
      return outputError(false, `Nenhum resultado encontrado. Pesquisa: ${txtBuscado}`, "Object Not Found");
    }

    let evento;
    for (let i = 0; i < resultados.length; i++) {
      let resultado = resultados[i];
      let linha = resultado.getRow();      
      let colunaJ = guia.getRange("J" + linha).getValue();
      let e = JSON.parse(colunaJ);

      evento = {
        id: e.id,
        data: e.data,
        hora: e.hora,
        local: e.local,
        titulo: e.titulo,
        descricao: e.descricao,
        status: e.status,
        idFolder: e.idFolder
      };

    };    
    return outputSuccess(true, 'Objeto encontrado com sucesso', evento);

  } catch(e) {
    throw  error = {'status': 'error', 'details': `erro ao buscar evento: ${txtBuscado} - erro: ${e.message}`};
  }  
}

function todosValoresDaColunaParticipantesDTO(eventoId) {
  const sh = spreadSheet.getSheetByName(eventoId);
  if(!sh || eventoId == 'EVENTOS')
    return outputError(false, 'evento não encontrado', 'erro ao buscar todos os participantes');
  const values = sh.getRange(2, 10, sh.getLastRow()-1, 1).getValues(); // coluna 10 - ParticipantesDTO
  const items = values.flat();
  // let data = [];
  // items.forEach(i => {
  //   let d = JSON.parse(i);
  //   data.push(d);
  // })
  return outputSuccess(true, {'eventoId': eventoId}, items);
}

function encontrarParticipantePorMatricula(valorPesquisado, eventoId) {
  if (eventoId === 'EVENTOS')
    return outputError(false, 'evento id inválido', 'erro na pesquisa por matrícula')
  const coluna = 4 // coluna que estão as matrículas
  const planilha = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName(eventoId);
  if(!planilha)
    return outputError(false, 'evento não encontrado', 'erro ao buscar participante');
  const dados = planilha.getDataRange().getValues();
  const indiceColuna = coluna - 1; // Índice da coluna ajustado para 0 (ex: Coluna 1 = índice 0)
  for (let i = 0; i < dados.length; i++) {
    if (dados[i][indiceColuna] == valorPesquisado) {
      const idParticipante = dados[i][1]
      return outputSuccess(true, `Valor "${valorPesquisado}" encontrado!` ,idParticipante);
    }
  }
  return outputError(false, `Valor "${valorPesquisado}" não encontrado.`, 'Nenhum valor encontrado');
}

// POST
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
  return outputSuccess(true, 'Arquivo enviado com sucesso!', {"sheetId": id, 'momento': timeStamp});
  } else {
    return outputError(false, 'Evento não está com status Aberto', '');
  }
}

function processImageBlob(base64Content) {
  const decodedContent = Utilities.base64Decode(base64Content); 
  const blob = Utilities.newBlob(decodedContent, 'image/png', 'uploaded_image.png');
  return blob;
}

// POST
function addEvento(d){
  let uuid = gerarUuidParticionado();
  let dt = new Date(d.data).toISOString().split('T')[0].replaceAll('-','');
  let pasta = criarPasta(`${dt}_${uuid}`);
  // let idPlanilha = criarFolhaNaPlanilha(`${dt}_${uuid}`);
  let idPlanilha = dublicarAbaModelo(`${dt}_${uuid}`);
  return salvaNaPlanilha(idPlanilha, formatDate(d.data), d.hora, d.local, d.titulo, d.descricao, 'ABERTO', pasta.folderId, pasta.folderUrl);
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

function criarPasta(nomeDaPasta) {
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

function criarFolhaNaPlanilha(nomeDaFolha) {  
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

function dublicarAbaModelo(nomeDaFolha) {
  let abaModelo = spreadSheet.getSheetByName('ATA_MODELO');
  if (abaModelo) {
    let novaAba = abaModelo.copyTo(spreadSheet);
    novaAba.setName(nomeDaFolha);
  } else {
    throw  error = {"status": 'error', "details": `Não foi possível duplicar a aba`};
  }
  return nomeDaFolha;
}

function salvaNaPlanilha(id, data, hora, local, titulo, descricao, status, idPasta, urlPasta) {
  try {
    const sheet = sheetEventos;
    let obj = {
      id: id,
      data: data,
      hora: hora,
      local: local,
      titulo: titulo,
      descricao: descricao,
      status: status,
      idFolder: idPasta
    } 
    sheet.appendRow([id, data, hora, local, titulo, descricao, status, idPasta, urlPasta, JSON.stringify(obj)]);
    return outputSuccess(true, 'evento criado com sucesso!', {"id": id});
  } catch(e) {
    return outputError(false, 'erro ao salvar na planilha', e.message );
  }  
}

// GET - EDITAR STATUS DO EVENTO
function editStatusEvento(idEvento, statusNovo, letraColuna) {
  const aba = SpreadsheetApp.openById(env().ENV_SPREADSHEET_ID).getSheetByName('EVENTOS');
  coluna = aba.getRange(`${letraColuna}:${letraColuna}`);
  var textFinder = coluna.createTextFinder(idEvento);
  textFinder.matchEntireCell(true);
  var resultados = textFinder.findAll();
  let flag = false;
  let novoObj = {};
  let obj = {};
  resultados.forEach(function(celula) {
    aba.getRange(celula.getRow(), 7).setValue(statusNovo);
    let colEventoJson = aba.getRange(celula.getRow(), 10).getValue();
    obj = JSON.parse(colEventoJson);
    novoObj = {
      id: obj.id,
      data: obj.data,
      hora: obj.hora,
      local: obj.local,
      titulo: obj.titulo,
      descricao: obj.descricao,
      status: statusNovo,
      idFolder: obj.idFolder,
      urlFolder: obj.urlFolder
    }
    aba.getRange(celula.getRow(), 10).setValue(JSON.stringify(novoObj));
    flag = true;
  });
  if(flag) {
    objResponse = {
      id: obj.id,
      data: obj.data,
      hora: obj.hora,
      titulo: obj.titulo,
      status: obj.statusNovo
    }
    return outputSuccess(true, 'edição executada com sucesso', objResponse);
  } else
    return outputError(false, 'evento não encontrado', 'edição de evento não foi executada' );    
}

function outputSuccess(success, message, content) {
  let output = ContentService.createTextOutput(), data = {};
  data = {
    "success": success, // boolean
    "message": message,
    "content": content
  };  
  output.setContent(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  return output;
}

function outputError(success, message, error) {
  let output = ContentService.createTextOutput();
  let res = {
    "success": success, // boolean
    "message": message,
    "error": error
  };
  output.setContent(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  return output;
}

function env_example() {
  const ENV_SPREADSHEET_ID = '';
  const ENV_FOLDER_ID = '';
  const SHEETNAME_EVENTOS = '';
  const PRIVATE_KEY_HASH = '';
  const SHEETNAME_USER = '';
  const ENV_CRYPTO_KEY_SECRET = '';
  return {
    ENV_SPREADSHEET_ID, 
    ENV_FOLDER_ID, 
    SHEETNAME_EVENTOS, 
    PRIVATE_KEY_HASH, 
    SHEETNAME_USER, 
    ENV_CRYPTO_KEY_SECRET
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
 * versão CryptoJS no projeto: CryptoJS v3.1.2
 * 
 * */
 