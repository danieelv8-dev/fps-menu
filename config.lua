Config = {}

-- Bez bindów: nie ma RegisterKeyMapping, IsControlJustPressed ani skrótów.
Config.Komenda = 'fps'
Config.KomendaProfil = 'fpsprofil'
Config.KomendaFiltr = 'fpsfiltr'
Config.KomendaReset = 'fpsreset'

Config.DomyslnyProfil = 'default'
Config.DomyslnyFiltr = 'none'
Config.KluczZapisu = 'project_nashville_fps_ustawienia_v1'

-- LOD poniżej 1.0 może zwiększyć wydajność kosztem detali/zasięgu rysowania.
-- Są to indywidualne, lokalne ustawienia klienta; nie modyfikują plików GTA V.
Config.Profile = {
    default = {
        nazwa = 'Nashville Domyślne',
        lod = 1.00,
        pedBudget = false,
        vehicleBudget = false,
        hideDecals = false
    },
    balanced = {
        nazwa = 'Zbalansowany Boost',
        lod = 0.85,
        pedBudget = false,
        vehicleBudget = false,
        hideDecals = false
    },
    performance = {
        nazwa = 'Wysoka Wydajność',
        lod = 0.65,
        pedBudget = true,
        vehicleBudget = true,
        hideDecals = false
    },
    potato = {
        nazwa = 'Ultra Low / Potato',
        lod = 0.45,
        pedBudget = true,
        vehicleBudget = true,
        hideDecals = true
    }
}

-- Dostępne filtry GTA V. Filtry współdzielą slot timecycle z innymi zasobami;
-- jeżeli używasz własnej pogody/timecycle, rozważ wyłączenie filtrów (none).
Config.Filtry = {
    none = { nazwa = 'Bez filtra', modifier = nil, sila = 0.0 },
    cinematic = { nazwa = 'Filmowy', modifier = 'NG_filmic10', sila = 0.40 },
    vivid = { nazwa = 'Żywe kolory', modifier = 'MP_corona_tint', sila = 0.32 },
    mono = { nazwa = 'Czerń i biel', modifier = 'CAMERA_BW', sila = 0.75 },
    cold = { nazwa = 'Chłodny klimat', modifier = 'rply_saturation', sila = 0.32 }
}

Config.LodMin = 0.40
Config.LodMax = 1.00
