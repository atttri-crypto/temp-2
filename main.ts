// =====================================================================
//  ChemLab: The Chemical Crisis  —  main.ts
//  Game flow: title -> story -> briefing -> level -> results -> ...
//  Score, stats, chem-lock doors, saving, achievements.
//  This is the ONLY file with top-level code (the last line).
// =====================================================================
namespace Game {
    export const PLAY = 1
    export const PAUSED = 2
    export const MENU = 0
    export let state: number
    export let level: number
    export let score: number
    export let stats: number[]          // 0 wrong, 1 hits, 2 flasks, 3 rare, 4 logs, 5 stomps
    export let totalFlasks: number
    export let unlocked: number
    export let best: number[]
    export let stars: number[]
    export let ach: number
    let doorsOpened: boolean[]
    let used: number[]
    let doorCool: number
    let lastT: number
    let startT: number
    let wave: number

    // ---------------- boot ----------------
    export function boot() {
        state = MENU; level = 0; score = 0; stats = [0, 0, 0, 0, 0, 0]; totalFlasks = 0
        doorsOpened = []; used = []; doorCool = 0; lastT = game.runtime(); startT = 0; wave = 0
        load()
        Art.initSprites()
        Art.setTheme(0)
        Levels.build(0)
        UI.initRenderers()
        game.onUpdate(update)
        game.onUpdateInterval(140, () => { if (Art.tiles != null) { wave++; Art.animateTiles(wave) } })
        scene.setBackgroundColor(C.Black)
        showTitle()
    }

    // ---------------- save data ----------------
    function load() {
        unlocked = settings.exists("cl_unlocked") ? settings.readNumber("cl_unlocked") : 0
        ach = settings.exists("cl_ach") ? settings.readNumber("cl_ach") : 0
        best = []; stars = []
        for (let i = 0; i < 5; i++) {
            best.push(settings.exists("cl_best" + i) ? settings.readNumber("cl_best" + i) : 0)
            stars.push(settings.exists("cl_stars" + i) ? settings.readNumber("cl_stars" + i) : 0)
        }
    }
    function save() {
        settings.writeNumber("cl_unlocked", unlocked)
        settings.writeNumber("cl_ach", ach)
        for (let i = 0; i < 5; i++) { settings.writeNumber("cl_best" + i, best[i]); settings.writeNumber("cl_stars" + i, stars[i]) }
    }
    export function unlockAll() { unlocked = 4; save() }
    export function unlock(i: number) {
        if (((ach >> i) & 1) != 0) return
        ach = ach | (1 << i); save()
        UI.toast("TROPHY: " + Data.achName(i))
    }
    export function achCount(): number { let n = 0; for (let i = 0; i < 6; i++) if (((ach >> i) & 1) != 0) n++; return n }
    export function totalBest(): number { let n = 0; for (let i = 0; i < 5; i++) n += best[i]; return n }
    export function totalStars(): number { let n = 0; for (let i = 0; i < 5; i++) n += stars[i]; return n }

    // ---------------- menus ----------------
    function showTitle() {
        state = MENU
        Art.setTheme(0)
        UI.title((choice: number) => {
            if (choice == 0) UI.dialog(Data.intro(), () => showBrief(0))
            else if (choice == 1) showSelect()
            else UI.dialog(["", "MOVE: LEFT / RIGHT.  JUMP: A or UP (hold to jump higher). DROP DOWN: DOWN + A on a platform.",
                "", "Walk into a CHEM LOCK door to get a question. Right answers open it. Wrong answers explain why, then you try again.",
                "", "Stomp slimes and drones. Avoid fumes, flames, drips, shards and liquids. Falling in costs a heart.",
                "", "Collect flasks, 3 RARE ELEMENTS, med-kits and LAB LOGS. Safety showers are checkpoints. Reach the EXIT LIFT!"], showTitle)
        })
    }
    function showSelect() {
        state = MENU
        Art.setTheme(Math.min(unlocked, 4))
        UI.select((lv: number) => showBrief(lv), showTitle)
    }
    function showBrief(lv: number) {
        state = MENU
        Art.setTheme(lv)
        UI.brief(lv, () => startLevel(lv), showSelect)
    }

    // ---------------- level ----------------
    export function levelSub(): string { return ["CHEMICAL IDENTIFICATION", "THE pH CHALLENGE", "CHEMICAL REACTIONS", "SEPARATION MISSION", "LABORATORY RESCUE"][level] }
    export function startLevel(lv: number) {
        level = lv
        Art.setTheme(lv)
        Levels.build(lv)
        Ents.clear()
        const W = Levels.w, H = Levels.Dim.H
        const buf = control.createBuffer(4 + W * H)
        buf.setNumber(NumberFormat.UInt16LE, 0, W)
        buf.setNumber(NumberFormat.UInt16LE, 2, H)
        const walls = image.create(W, H)
        for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
            const v = Levels.get(c, r)
            buf.setUint8(4 + c + r * W, v)
            if (Art.isSolid(v)) walls.setPixel(c, r, 2)
        }
        tiles.setCurrentTilemap(tiles.createTilemap(buf, walls, Art.tiles, TileScale.Sixteen))
        Ents.spawnAll()
        Player.create(24, 11 * 16 - 12)
        score = 0; stats = [0, 0, 0, 0, 0, 0]; used = []; doorCool = 0
        doorsOpened = []; for (let i = 0; i < Levels.doorCols.length; i++) doorsOpened.push(false)
        totalFlasks = 0; for (let i = 0; i < Levels.sk.length; i++) if (Levels.sk[i] == S.Flask) totalFlasks++
        lastT = game.runtime(); startT = lastT
        state = PLAY
        UI.banner(["STORAGE WING", "ACID BASIN", "REACTION HALL", "SEPARATION PLANT", "CORE REACTOR"][lv])
        UI.radio("HALDEN", lv < 4 ? "Open all 3 chem locks and reach the exit lift. Good luck!" : "Reach the Core and stop M.I.X. Stay in the light!")
    }
    export function putTile(c: number, r: number, t: number) {
        Levels.map[r * Levels.Dim.MaxW + c] = t
        const loc = tiles.getTileLocation(c, r)
        tiles.setTileAt(loc, Art.tiles[t])
        tiles.setWallAt(loc, Art.isSolid(t))
    }
    export function doorOpen(i: number): boolean { return doorsOpened[i] }

    function update() {
        const t = game.runtime()
        let dt = (t - lastT) / 1000
        lastT = t
        if (dt > 0.05) dt = 0.05
        if (dt < 0) dt = 0
        if (state != PLAY) return
        UI.tick(dt)
        Player.update(dt, t)
        if (state != PLAY) return
        Ents.update(dt, t)
        if (state != PLAY) return
        const hero = Player.hero
        // chem-lock doors
        if (doorCool > 0) doorCool -= dt * 1000
        const ac = Math.idiv(hero.right + 2, 16)
        const v1 = Levels.get(ac, Math.idiv(hero.y, 16)), v2 = Levels.get(ac, Math.idiv(hero.bottom - 2, 16))
        const isDoor = (v: number) => v == Art.T.DoorTop || v == Art.T.DoorMid || v == Art.T.DoorBot
        if (doorCool <= 0 && (isDoor(v1) || isDoor(v2))) openDoorQuiz(ac)
        // exit lift
        if (Levels.get(Math.idiv(hero.x, 16), Math.idiv(hero.y, 16)) == Art.T.Exit) levelComplete()
    }

    // ---------------- questions ----------------
    function topic(): string { return ["IDENTIFY", "pH CHECK", "REACTIONS", "SEPARATION", "FINAL EXAM"][level] }
    function answered(correct: boolean, firstTry: boolean) {
        if (correct) score += firstTry ? 150 : 100
        else stats[0]++
    }
    function openDoorQuiz(col: number) {
        const idx = Levels.doorCols.indexOf(col)
        state = PAUSED
        UI.quiz("CHEM LOCK " + (idx + 1) + "/3: " + topic(), Data.bank(level), used, answered, (ok: boolean) => {
            state = PLAY; lastT = game.runtime(); Player.ignoreA = true
            if (ok) {
                for (let r = 0; r < Levels.Dim.H; r++) {
                    const v = Levels.get(col, r)
                    if (v == Art.T.DoorTop || v == Art.T.DoorMid || v == Art.T.DoorBot) putTile(col, r, 0)
                }
                if (idx >= 0) doorsOpened[idx] = true
                scene.cameraShake(3, 300); music.magicWand.play()
                UI.toast("DOOR UNLOCKED!")
            } else {
                doorCool = 1200
                Player.hero.x -= 14
            }
        })
    }
    export function bossQuiz(c: Ent) {
        state = PAUSED
        UI.quiz("M.I.X. CONSOLE: OVERLOAD!", Data.bank(4), used, answered, (ok: boolean) => {
            state = PLAY; lastT = game.runtime(); Player.ignoreA = true
            Ents.consoleResult(c, ok)
        })
    }

    // ---------------- pickups & events ----------------
    export function addScore(n: number, x: number, y: number) { score += n; Ents.popup("+" + n, x, y, C.Yellow) }
    export function gotFlask(x: number, y: number) { stats[2]++; score += 10; music.baDing.play() }
    export function gotRare(x: number, y: number) {
        stats[3]++; score += 250; music.magicWand.play()
        Ents.popup("+250", x, y - 8, C.LBlue)
        UI.toast("RARE ELEMENT " + stats[3] + "/3: " + Data.rareSymbols(level)[Math.min(2, stats[3] - 1)])
    }
    export function gotHeart(x: number, y: number) {
        music.powerUp.play()
        if (Player.hearts < Player.maxHearts) { Player.hearts++; Ents.popup("+1 HEART", x, y - 6, C.Pink) }
        else addScore(100, x, y - 6)
    }
    export function gotLog(n: number) {
        stats[4]++; score += 50; music.sonar.play()
        const lg = Data.log(level, n)
        state = PAUSED
        UI.dialog([lg[0].indexOf("M.I.X.") >= 0 ? "M.I.X." : "", lg[0] + ": " + lg[1]], () => { state = PLAY; lastT = game.runtime(); Player.ignoreA = true })
    }
    export function stomped(x: number, y: number) { stats[5]++; addScore(50, x, y) }
    export function toast(msg: string) { UI.toast(msg) }
    export function radio(who: string, text: string) { UI.radio(who, text) }

    // ---------------- end of level ----------------
    export function gameOver() {
        state = PAUSED
        UI.gameOver(() => {
            score = Math.max(0, score - 250)
            Player.respawnAtCheckpoint()
            state = PLAY; lastT = game.runtime(); Player.ignoreA = true
        }, () => { Ents.clear(); showSelect() })
    }
    export function levelComplete() {
        if (state != PLAY) return
        state = MENU
        music.powerUp.play()
        const secs = Math.idiv(game.runtime() - startT, 1000)
        const par = Data.parTime(level)
        const timeBonus = Math.max(0, (par - secs) * 5)
        const heartBonus = Player.hearts * 50
        score += timeBonus + heartBonus
        const st = 1 + (stats[2] * 10 >= totalFlasks * 8 ? 1 : 0) + (stats[0] == 0 ? 1 : 0)
        if (level == 0) unlock(0)
        if (stats[0] == 0) unlock(1)
        if (stats[1] == 0) unlock(2)
        if (stats[3] >= 3) unlock(3)
        if (stats[4] >= 2) unlock(4)
        if (score > best[level]) best[level] = score
        if (st > stars[level]) stars[level] = st
        unlocked = Math.max(unlocked, Math.min(4, level + 1))
        save()
        const mm = Math.idiv(secs, 60), ss = secs % 60
        const rows = ["TIME", "FLASKS", "RARE ELEMENTS", "LAB LOGS", "WRONG ANSWERS", "BONUS", "SCORE"]
        const vals = [mm + ":" + (ss < 10 ? "0" : "") + ss, stats[2] + "/" + totalFlasks, stats[3] + "/3", stats[4] + "/2", "" + stats[0], "+" + (timeBonus + heartBonus), "" + score]
        const lv = level
        Ents.clear()
        UI.results(lv < 4 ? "SECTOR RESTORED!" : "M.I.X. DEFEATED!", rows, vals, st, Data.debrief(lv), () => {
            if (lv < 4) showBrief(lv + 1)
            else UI.dialog(Data.ending(), () => UI.finale(showTitle))
        }, showSelect)
    }
}

Game.boot()
