import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private dbName = 'ImageStorageDB';  // Nome do banco de dados
  private storeName = 'images';       // Nome da store onde as imagens serão armazenadas

  private db!: IDBDatabase;           // Variável para armazenar a instância do banco de dados

  constructor() {
    this.openDb();
  }

  // Abre o banco de dados IndexedDB
  private openDb(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    };

    request.onerror = (event: any) => {
      console.error('Erro ao abrir IndexedDB:', event);
    };
  }

  // Função para salvar a imagem no IndexedDB
  saveImage(imageBlob: Blob): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const imageData = {
        blob: imageBlob,
        createdAt: new Date(),
      };

      const request = store.add(imageData);

      request.onsuccess = () => {
        resolve('Imagem salva com sucesso!');
      };

      request.onerror = (event) => {
        reject('Erro ao salvar a imagem no IndexedDB.');
      };
    });
  }

  // Função para recuperar todas as imagens armazenadas
  getAllImages(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        reject('Erro ao recuperar as imagens do IndexedDB.');
      };
    });
  }

  // Recupera uma imagem pelo ID (ou qualquer outro critério único que você usar)
getImageById(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    const request = store.get(id);  // Aqui você pode usar qualquer critério de pesquisa
    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = () => {
      reject('Erro ao recuperar a imagem do IndexedDB.');
    };
  });
}

}
