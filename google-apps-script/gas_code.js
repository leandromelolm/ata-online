const spreadsheetId = env().envSpreadsheetId;
const folderId = env().envFolderId;
const spreadSheet = SpreadsheetApp.openById(spreadsheetId);
const sheet = spreadSheet.getSheetByName('test'); // nome da Aba da planilha
const sheetInfoReuniao = spreadSheet.getSheetByName(env().sheetNameInfoAta);

/** GET **/
const doGet = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {    
    const ata = e.parameter['ata'] || '';
    if (ata) {      
      return findByMeeting(ata);
    } else {
      throw  error = {"status": 404, "details": `url não encontrada`};
    }
  } catch (error) {
    return outputError(false, 'erro na requisição', error);
  } finally {
    lock.releaseLock();
  } 
}

/** POST **/
const doPost = (e) => {
 try {
    let data = JSON.parse(e.postData.contents);
    let op = data.action || '';
    if (op === 'addParticipante')
      return addParticipanteNoEvento(data);    
  } catch (error) {
    return outputError(false, error.message, e);
  }
}

// GET
function findByMeeting(txtBuscado) {
  try { 
    let guia = sheetInfoReuniao;  
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
    throw  error = {"details": `Erro ao buscar evento: ${txtBuscado}, mensagem de erro: ${e}`};
  }  
}

// POST
function addParticipanteNoEvento(dados) {
  let folder;
  if (dados.status === 'ABERTO' || dados.status === 'TEST') {
    folder = DriveApp.getFolderById(dados.status === 'ABERTO' ? dados.folderId : folderId);
  }
  const imageBlob = processImageBlob(dados.base64File);
  const id = Utilities.getUuid();
  const file = folder.createFile(imageBlob.setName(`${id}_image.png`));
  const timeStamp = new Date();
  const _sheet = spreadSheet.getSheetByName(dados.sheetPageId);
  _sheet.appendRow([timeStamp, id, dados.userName, dados.matricula, dados.cpf, dados.distrito, dados.unidade, dados.enderecoLocal, file.getDownloadUrl()]);
  return outputSuccess(true, 'Arquivo enviado com sucesso!', {"sheetId": id, 'momento': timeStamp});
}

function processImageBlob(base64Content) {
  const decodedContent = Utilities.base64Decode(base64Content); 
  const blob = Utilities.newBlob(decodedContent, 'image/png', 'uploaded_image.png');
  return blob;
}

function outputSuccess(s, m, c) {
  let output = ContentService.createTextOutput(), data = {};
  data = {
    "success": s,
    "message": m,
    "content": c
  };  
  output.setContent(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  return output;
}

function outputError(s, m, e) {
  let output = ContentService.createTextOutput();
  let error = {
    "success": s,
    "message": m,
    "error": e
  };
  output.setContent(JSON.stringify(error)).setMimeType(ContentService.MimeType.JSON);
  return output;
}

function env_() {
  const envSpreadsheetId = '';
  const envFolderId = '';
  return {envSpreadsheetId, envFolderId};
}

/**
 *  Projeto Google Apps Script
 * 
 * criar o projeto do tipo: web app
 * permissão de acesso: qualquer pessoa
 * 
 * envFolderId = id da pasta que será salva no google drive
 * envSpreadsheetId: id da panilha google
 * 
 * renover função env_() para env()
 * 
 * */