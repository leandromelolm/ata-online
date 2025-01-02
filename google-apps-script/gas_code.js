const spreadsheetId = env().envSpreadsheetId;
const folderId = env().envFolderId;
const spreadSheet = SpreadsheetApp.openById(spreadsheetId);
const sheet = spreadSheet.getSheetByName('test'); // nome da Aba da planilha
const sheetInfoReuniao = spreadSheet.getSheetByName(env().sheetNameInfoAta);


const doGet = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {    
    const reuniao = e.parameter['reuniao'] || '';
    let infoMeeting;
    if (reuniao) {
      infoMeeting = buscarInfoReuniao(reuniao);
    } else {
      throw  error = {statusCode: 404, message: `Pagina não encontrada`, status: "Error", details: reuniao};
    }

    let response = ContentService
      .createTextOutput(JSON.stringify({
        "reuniao": reuniao,        
        "result": infoMeeting
      }));
    
    return response.setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
         'result': 'error', 
         'message': error 
      })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  } 
}

function buscarInfoReuniao(reuniao) {
  return findByColumn(reuniao);
}

function findByColumn(txtBuscado) {
  try { 
    let guia = sheetInfoReuniao;  
    let colunaParaPesquisar = "A";
    let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar).createTextFinder(txtBuscado);
    let resultados = textFinder.findAll();

    if (resultados.length == 0 || resultados[0].getValue() !== txtBuscado){
      return error = {
        statusCode: 404,
        message: `Nenhum resultado encontrado. Pesquisa: ${txtBuscado}`,
        status: "Object Not Found",
        details: ""
      };
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
    return evento;

  } catch(e) {
    throw  error = {
      statusCode: 404,
      message: `Nenhum resultado encontrado: ${txtBuscado}`,
      status: "Error",
      details: ""
    };
  }  
}

const doPost = (e) => {
 try {
    let dados = JSON.parse(e.postData.contents);
    const imageBlob = processImageBlob(dados.base64File);
    let id;
    let file;
    if (dados.status === 'ABERTO') {
      const folder = DriveApp.getFolderById(dados.folderId);
      const _sheet = spreadSheet.getSheetByName(dados.sheetPageId);
      // id = _sheet.getLastRow() + 1;
      id = Utilities.getUuid();
      file = folder.createFile(imageBlob.setName(`${id}_image.png`));
      _sheet.appendRow([new Date(), id, dados.userName, dados.matricula, dados.cpf, dados.distrito, dados.unidade, dados.enderecoLocal ,file.getDownloadUrl()]);
    } 
    if (dados.status === 'TEST') {
      const folder = DriveApp.getFolderById(folderId);
      const _sheet = spreadSheet.getSheetByName(dados.sheetPageId);
      // id = _sheet.getLastRow() + 1;
      id = Utilities.getUuid();
      file = folder.createFile(imageBlob.setName(`${id}_image.png`));
      _sheet.appendRow([new Date(), id, dados.userName, dados.matricula, dados.cpf, dados.distrito, dados.unidade, dados.enderecoLocal ,file.getDownloadUrl()]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      // fileId: file.getId(),
      sheetId: id,
      message: "Arquivo enviado com sucesso!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function processImageBlob(base64Content) {
  const decodedContent = Utilities.base64Decode(base64Content); 
  const blob = Utilities.newBlob(decodedContent, 'image/png', 'uploaded_image.png');
  return blob;
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