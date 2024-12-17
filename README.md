# ata-online-angular

Configuração do projeto

### Comandos
```sh

#limpar cache do npm (opcional)
npm cache clean --force

# instalar versão Angular 17
npm install -g @angular/cli@17

# ver versão angular
ng version

# criar projeto
ng new ata-online --no-standalone

# executar projeto
ng serve -o
ng serve --host {HOST_LOCAL_PARA_ABRIR_NO_MOBILE}

# instalar boostrap
npm install bootstrap@5.3.3

# instalar material angular
ng add @angular/material

# para adicionar máscaras de input
npm install ngx-mask --save

### comandos angular

# criar componente
ng generate component components/button
ng generate component components/location
ng generate component pages/login


### implantar projeto no firebase
npm install firebase
npm install -g firebase-tools
firebase login
firebase init
# dar o build no projeto
ng build
# escolher a opcão App Hosting
# usar um projeto existente que ja foi criado no firebase
# configurar arquivo firebase.json para localizar pasta index
firebase deploy --only hosting:sindatsb


### Outros comandos úteis

# listar versões node
nvm ls
nvm ls-remote

# instalar versão compatível com Angular 17
nvm install v18.20.5

# usar uma versão node
nvm use v18.20.5

# matar projeto executado na porta 4200
sudo kill -9 `sudo lsof -t -i:4200
```