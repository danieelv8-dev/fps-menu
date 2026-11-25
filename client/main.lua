local czyOtwarte = false
local filtrZajety = false
local aktualne = {}
local ostatnieFps = 0

local function ograniczLod(value)
    value = tonumber(value) or 1.0
    if value < Config.LodMin then value = Config.LodMin end
    if value > Config.LodMax then value = Config.LodMax end
    return math.floor(value * 100 + 0.5) / 100
end

local function domyslneUstawienia()
    local p = Config.Profile[Config.DomyslnyProfil] or Config.Profile.default
    return {
        profil = Config.DomyslnyProfil,
        filtr = Config.DomyslnyFiltr,
        lod = p.lod,
        pedBudget = p.pedBudget,
        vehicleBudget = p.vehicleBudget,
        hideDecals = p.hideDecals
    }
end

local function zatwierdzUstawienia(surowe)
    local wynik = domyslneUstawienia()
    if type(surowe) ~= 'table' then return wynik end

    if type(surowe.profil) == 'string' and (Config.Profile[surowe.profil] or surowe.profil == 'custom') then
        wynik.profil = surowe.profil
    end
    if type(surowe.filtr) == 'string' and Config.Filtry[surowe.filtr] then
        wynik.filtr = surowe.filtr
    end
    wynik.lod = ograniczLod(surowe.lod)
    wynik.pedBudget = surowe.pedBudget == true
    wynik.vehicleBudget = surowe.vehicleBudget == true
    wynik.hideDecals = surowe.hideDecals == true
    return wynik
end

local function zapisz()
    SetResourceKvp(Config.KluczZapisu, json.encode(aktualne))
end

local function wyslijStan()
    if not czyOtwarte then return end
    SendNUIMessage({ action = 'state', settings = aktualne })
end

local function odswiezFiltr()
    local f = Config.Filtry[aktualne.filtr]
    if not f or not f.modifier then
        if filtrZajety then
            ClearTimecycleModifier()
            filtrZajety = false
        end
        return
    end
    SetTimecycleModifier(f.modifier)
    SetTimecycleModifierStrength(f.sila)
    filtrZajety = true
end

local function odswiezBudzet()
    SetReducePedModelBudget(aktualne.pedBudget == true)
    SetReduceVehicleModelBudget(aktualne.vehicleBudget == true)
end

local function ustawProfil(id)
    local p = type(id) == 'string' and Config.Profile[id] or nil
    if not p then return false end
    aktualne.profil = id
    aktualne.lod = p.lod
    aktualne.pedBudget = p.pedBudget
    aktualne.vehicleBudget = p.vehicleBudget
    aktualne.hideDecals = p.hideDecals
    odswiezBudzet()
    zapisz()
    wyslijStan()
    return true
end

local function ustawFiltr(id)
    if type(id) ~= 'string' or not Config.Filtry[id] then return false end
    aktualne.filtr = id
    odswiezFiltr()
    zapisz()
    wyslijStan()
    return true
end

local function ustawZaawansowane(dane)
    if type(dane) ~= 'table' then return false end
    aktualne.profil = 'custom'
    aktualne.lod = ograniczLod(dane.lod)
    aktualne.pedBudget = dane.pedBudget == true
    aktualne.vehicleBudget = dane.vehicleBudget == true
    aktualne.hideDecals = dane.hideDecals == true
    odswiezBudzet()
    zapisz()
    wyslijStan()
    return true
end

local function resetUstawien()
    aktualne = domyslneUstawienia()
    odswiezBudzet()
    odswiezFiltr()
    zapisz()
    wyslijStan()
    return true
end

local function zamknijMenu()
    if not czyOtwarte then return end
    czyOtwarte = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end

local function otworzMenu()
    if czyOtwarte then return false end
    czyOtwarte = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open', settings = aktualne, fps = ostatnieFps })
    return true
end

RegisterCommand(Config.Komenda, function()
    if czyOtwarte then zamknijMenu() else otworzMenu() end
end, false)

RegisterCommand(Config.KomendaProfil, function(_, args)
    if not ustawProfil(args and args[1] or '') then
        print('^3[Project Nashville FPS]^7 Profile: default, balanced, performance, potato')
    end
end, false)

RegisterCommand(Config.KomendaFiltr, function(_, args)
    if not ustawFiltr(args and args[1] or '') then
        print('^3[Project Nashville FPS]^7 Filtry: none, cinematic, vivid, mono, cold')
    end
end, false)

RegisterCommand(Config.KomendaReset, function()
    resetUstawien()
end, false)

RegisterNUICallback('zamknij', function(_, cb)
    zamknijMenu()
    cb({ ok = true })
end)

RegisterNUICallback('profil', function(dane, cb)
    local ok = czyOtwarte and ustawProfil(dane and dane.id)
    cb({ ok = ok == true, settings = aktualne })
end)

RegisterNUICallback('filtr', function(dane, cb)
    local ok = czyOtwarte and ustawFiltr(dane and dane.id)
    cb({ ok = ok == true, settings = aktualne })
end)

RegisterNUICallback('zaawansowane', function(dane, cb)
    local ok = czyOtwarte and ustawZaawansowane(dane)
    cb({ ok = ok == true, settings = aktualne })
end)

RegisterNUICallback('reset', function(_, cb)
    local ok = czyOtwarte and resetUstawien()
    cb({ ok = ok == true, settings = aktualne })
end)

CreateThread(function()
    local zapis = GetResourceKvpString(Config.KluczZapisu)
    if zapis then
        local ok, wynik = pcall(json.decode, zapis)
        aktualne = zatwierdzUstawienia(ok and wynik or nil)
    else
        aktualne = domyslneUstawienia()
    end
    odswiezBudzet()
    odswiezFiltr()
end)

-- Natywy z końcówką ThisFrame wymagają wywołania co klatkę.
-- Przy domyślnym profilu wątek pozostaje w uśpieniu.
CreateThread(function()
    while true do
        if aktualne.profil and (aktualne.lod < 1.0 or aktualne.hideDecals) then
            Wait(0)
            if aktualne.lod < 1.0 then
                OverrideLodscaleThisFrame(aktualne.lod)
            end
            if aktualne.hideDecals then
                SetDisableDecalRenderingThisFrame()
            end
        else
            Wait(750)
        end
    end
end)

-- FPS liczone tylko podczas otwartego menu, bez stałego obciążenia interfejsem.
CreateThread(function()
    local licznik = 0
    local poprzedniCzas = GetGameTimer()
    while true do
        if czyOtwarte then
            Wait(0)
            licznik = licznik + 1
            local teraz = GetGameTimer()
            if teraz - poprzedniCzas >= 1000 then
                ostatnieFps = math.floor(licznik * 1000 / math.max(1, teraz - poprzedniCzas))
                SendNUIMessage({ action = 'fps', fps = ostatnieFps })
                licznik = 0
                poprzedniCzas = teraz
            end
        else
            Wait(750)
            licznik = 0
            poprzedniCzas = GetGameTimer()
        end
    end
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    if czyOtwarte then SetNuiFocus(false, false) end
    if filtrZajety then ClearTimecycleModifier() end
    SetReducePedModelBudget(false)
    SetReduceVehicleModelBudget(false)
end)

-- Exporty do wykorzystania w innych skryptach Project Nashville.
exports('OtworzMenu', otworzMenu)
exports('ZamknijMenu', zamknijMenu)
exports('UstawProfil', ustawProfil)
exports('PobierzProfil', function() return aktualne.profil end)
exports('UstawFiltr', ustawFiltr)
exports('PobierzFiltr', function() return aktualne.filtr end)
exports('ZresetujUstawienia', resetUstawien)
exports('PobierzUstawienia', function() return zatwierdzUstawienia(aktualne) end)
