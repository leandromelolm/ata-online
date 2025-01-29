class Evento {
  constructor(
    id,
    data,
    hora,
    local,
    titulo,
    descricao,
    status,
    bCoordenadasParaAutorizarRegistro,
    idFolder,
    urlFolder,
    coords
  ) {
    this.setId(id);
    this.setData(data);
    this.setHora(hora);
    this.setLocal(local);
    this.setTitulo(titulo);
    this.setDescricao(descricao);
    this.setStatus(status);
    this.setBCoordenadasParaAutorizarRegistro(bCoordenadasParaAutorizarRegistro);
    this.setIdFolder(idFolder);
    this.setUrlFolder(urlFolder);
    this.setCoords(coords);
  }

  setId(id) {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('ID deve ser uma string não vazia.');
    }
    this.id = id;
  }

  setData(data) {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(data)) {
      throw new Error('Data deve estar no formato DD-MM-YYYY.');
    }
    this.data = data;
  }

  setHora(hora) {
    if (!/^\d{2}:\d{2}$/.test(hora)) {
      throw new Error('Hora deve estar no formato HH:MM.');
    }
    this.hora = hora;
  }

  setLocal(local) {
    if (typeof local !== 'string' || local.trim() === '' || local.length > 50) {
      throw new Error('Local deve ser uma string não vazia.');
    }
    this.local = local;
  }

  setTitulo(titulo) {
    if (typeof titulo !== 'string' || titulo.trim() === '' || titulo.length > 50) {
      throw new Error('Título deve ser uma string não vazia e ter no máximo 50 caracteres.');
    }
    this.titulo = titulo;
  }

  setDescricao(descricao) {
    if (typeof descricao !== 'string' || descricao.length > 80) {
      throw new Error('Descrição deve ser uma string.');
    }
    this.descricao = descricao;
  }

  setStatus(status) {
    const validStatuses = ['ABERTO', 'FECHADO', 'PAUSADO', 'ENCERRADO', 'CANCELADO'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido. Opções válidas: ${validStatuses.join(', ')}`);
    }
    this.status = status;
  }

  setBCoordenadasParaAutorizarRegistro(value) {
    if (typeof value !== 'boolean') {
      throw new Error('bCoordenadasParaAutorizarRegistro deve ser um booleano.');
    }
    this.bCoordenadasParaAutorizarRegistro = value;
  }

  setIdFolder(idFolder) {
    if (typeof idFolder !== 'string' || idFolder.trim() === '') {
      throw new Error('ID Folder deve ser uma string não vazia.');
    }
    this.idFolder = idFolder;
  }

  setUrlFolder(urlFolder) {
    if (typeof urlFolder !== 'string' || !urlFolder.startsWith('http')) {
      throw new Error('URL Folder deve ser uma URL válida.');
    }
    this.urlFolder = urlFolder;
  }

  setCoords(coords) {
    if (
      typeof coords !== 'object' ||
      coords === null ||
      typeof coords.lat !== 'string' ||
      typeof coords.long !== 'string'
    ) {
      throw new Error('Coords deve ser um objeto com propriedades lat e long do tipo string.');
    }
    this.coords = coords;
  }

}

// TESTE

function _test_eventoclass() {
  try {
    const evento = new Evento(
      '123abc',
      '20-02-2025',
      '14:30',
      'Auditório Central',
      'Reunião de Planejamento',
      'Discussão sobre novas estratégias para o ano',
      'ABERTO',
      true,
      'folder_001',
      'https://example.com/folder',
      { lat: '-23.5505', long: '-46.6333' }
    );
    console.log(evento);
  } catch (error) {
    console.error(error.message);
  }
}
