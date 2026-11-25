# Project Nashville — Grafika & FPS (wersja 1.0.3)

Menu wydajności FiveM z polskim interfejsem NUI, wzorowanym na koncepcji Project Nashville.

**Brak keybindów i `RegisterKeyMapping`.** Menu otwiera się przez `/fps`, zamyka przyciskiem **X** lub ponownie `/fps`. Nie dodajemy F7 ani innych przypisań klawiszy.

## Instalacja

1. Wgraj katalog `project_nashville_fps` do `resources/[local]/`.
2. W `server.cfg` dodaj `ensure project_nashville_fps`.
3. Wejdź na serwer i wpisz `/fps`.

Nie wymaga ESX, ox_lib ani serwerowej bazy danych. Ustawienia są przechowywane lokalnie dla klienta w KVP zasobu.

## Komendy

| Komenda | Działanie |
| --- | --- |
| `/fps` | Otwórz lub zamknij menu |
| `/fpsprofil default` | Domyślne ustawienia gry |
| `/fpsprofil balanced` | Zbalansowany boost |
| `/fpsprofil performance` | Wysoka wydajność |
| `/fpsprofil potato` | Minimalne detale |
| `/fpsfiltr none` | Usuń filtr |
| `/fpsfiltr cinematic` | Filmowy |
| `/fpsfiltr vivid` | Żywe kolory |
| `/fpsfiltr mono` | Czerń i biel |
| `/fpsfiltr cold` | Chłodny klimat |
| `/fpsreset` | Przywróć ustawienia domyślne |

## Exporty (client-side)

```lua
exports['project_nashville_fps']:OtworzMenu()
exports['project_nashville_fps']:ZamknijMenu()
exports['project_nashville_fps']:UstawProfil('balanced')
local profil = exports['project_nashville_fps']:PobierzProfil()
exports['project_nashville_fps']:UstawFiltr('none')
local filtr = exports['project_nashville_fps']:PobierzFiltr()
local ustawienia = exports['project_nashville_fps']:PobierzUstawienia()
exports['project_nashville_fps']:ZresetujUstawienia()
```

## Jak to działa

- Niższy `LOD` wymuszany lokalnie co klatkę przez `OverrideLodscaleThisFrame`.
- Profile wydajności mogą zmniejszyć budżety modeli NPC i pojazdów za pomocą `SetReducePedModelBudget` i `SetReduceVehicleModelBudget`.
- Tryb Potato opcjonalnie ogranicza lokalnie rendering decalów (śladów).
- Filtry używają klientowego `SetTimecycleModifier`, bez modyfikowania plików gry.
- FPS pokazuje przybliżony, aktualny pomiar tylko kiedy panel jest otwarty.

**Uwaga:** liczby +5–10 / +15–25 / +30–45 FPS w panelu są jedynie orientacyjnymi ilustracjami; realnego przyrostu nie da się zagwarantować. Żaden skrypt FiveM nie zastąpi wszystkich ustawień graficznych GTA V. Ten zasób nie wyłącza globalnie cieni, oświetlenia miasta czy pojazdów. Inne skrypty korzystające z `SetTimecycleModifier` mogą nadpisywać filtry lub być przez nie nadpisane. W razie konfliktów użyj filtru `none`.

## Dostosowanie

- `config.lua` — komendy, profile, LOD, filtry.
- `html/style.css` — kolory, odstępy, pozycję panelu i wygląd.
- Wersja 1.0.3 domyślnie otwiera menu w prawym górnym rogu i w bardziej kompaktowym rozmiarze.
- `html/app.js` — widok, interakcje, dane profili wyświetlane w NUI.

## Testowanie

Sprawdź w FiveM działanie `/fps`, przełączanie profili, reset, filtr, KVP po ponownym wejściu oraz integrację z innymi zasobami pogodowymi/timecycle. Podgląd z przeglądarki nie jest testem działania w GTA V.
