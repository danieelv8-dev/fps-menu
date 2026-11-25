shared_script '@ElectronAC/src/include/shared.lua'
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'project_nashville_fps'
author 'Project Nashville'
description 'Project Nashville — polskie menu grafiki i FPS bez przypisanych klawiszy'
version '1.0.2'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

shared_script 'config.lua'
client_script 'client/main.lua'

-- Ogranicza wywoływanie callbacków NUI przez inne zasoby (gdy obsługiwane).
nui_callback_strict_mode 'true'
