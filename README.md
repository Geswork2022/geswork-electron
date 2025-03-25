# Geswork Electron

Une application desktop pour Geswork, enveloppant l'interface web de Geswork dans une application Electron.

## Description

Geswork Electron permet d'accéder à l'interface web pro.geswork.fr dans une application native, offrant une meilleure intégration avec le système d'exploitation.

## Fonctionnalités

- Interface native macOS/Windows
- Barre de menu personnalisée pour macOS
- Navigation via la sidebar
- Expérience utilisateur optimisée pour desktop

## Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm (inclus avec Node.js)

### Installation des dépendances

```bash
# Cloner le dépôt
git clone https://github.com/Geswork2022/geswork-electron.git
cd geswork-electron

# Installer les dépendances
npm install
```

### Démarrage de l'application en mode développement

```bash
npm start
```

### Création du package de l'application

Pour macOS :

```bash
npx electron-packager . "Geswork" --platform=darwin --arch=x64 --icon=./assets/icon.icns --overwrite
```

Pour Windows (nécessite Wine sur macOS) :

```bash
npx electron-packager . "Geswork" --platform=win32 --arch=x64 --icon=./assets/icon.ico --overwrite
```

## Structure du projet

- `main.js` - Point d'entrée de l'application Electron
- `preload.js` - Script préchargé pour l'intégration avec le contenu web
- `assets/` - Ressources graphiques comme les icônes
- `package.json` - Configuration du projet et dépendances

## Licence

ISC 