// =====================================================================
//  ChemLab: The Chemical Crisis  —  ui.ts
//  Screens and HUD: parallax renderer, HUD, radio messages, title,
//  story dialogs, briefings, the chemistry QUIZ, sector select,
//  results, game over and the ending. Each screen is its own scene
//  (game.pushScene / popScene) so gameplay freezes underneath.
//  (No top-level code: UI.initRenderers() once, in the game scene.)
// =====================================================================
namespace UI {
    let toastMsg: string
    let toastT: number
    let radioWho: string
    let radioText: string[]
    let radioT: number
    let bannerText: string
    let bannerT: number
    let flash: number
    let nextThunder: number

    // ------------------------------------------------------------------
    //  text helpers
    // ------------------------------------------------------------------
    export function wrap(text: string, n: number): string[] {
        const words = text.split(" ")
        const lines: string[] = []
        let line = ""
        for (let i = 0; i < words.length; i++) {
            let w = words[i]
            while (w.length > n) { if (line.length > 0) { lines.push(line); line = "" } lines.push(w.substr(0, n)); w = w.substr(n, w.length - n) }
            if (line.length == 0) line = w
            else if (line.length + 1 + w.length <= n) line = line + " " + w
            else { lines.push(line); line = w }
        }
        if (line.length > 0) lines.push(line)
        return lines
    }
    function center(target: Image, text: string, y: number, col: number, font: image.Font) {
        target.print(text, Math.idiv(160 - text.length * font.charWidth, 2), y, col, font)
    }
    function panel(target: Image, x: number, y: number, w: number, h: number, border: number) {
        target.fillRect(x, y, w, h, C.Black)
        target.drawRect(x, y, w, h, border)
        target.drawRect(x + 1, y + 1, w - 2, h - 2, C.DPurple)
    }
    function hint(target: Image, text: string) {
        target.fillRect(0, 112, 160, 8, C.DPurple)
        center(target, text, 113, C.White, image.font5)
    }
    function open() { game.pushScene(); scene.setBackgroundColor(C.Black) }

    // ------------------------------------------------------------------
    //  world renderers (created once, in the game scene)
    // ------------------------------------------------------------------
    export function initRenderers() {
        toastT = 0; radioT = 0; bannerT = 0; flash = 0; nextThunder = 6000; radioText = []; radioWho = ""; toastMsg = ""; bannerText = ""
        // parallax lab behind the tilemap
        scene.createRenderable(-10, (target: Image, camera: scene.Camera) => {
            drawParallax(target, camera.drawOffsetX, camera.drawOffsetY, game.runtime())
        })
        // steam updraft streaks (in front of the tilemap, behind sprites)
        scene.createRenderable(-0.9, (target: Image, camera: scene.Camera) => {
            if (Game.state != Game.PLAY && Game.state != Game.PAUSED) return
            const t = game.runtime()
            for (let i = 0; i < Ents.zones.length; i++) {
                const z = Ents.zones[i]
                const sx = z.x0 - camera.drawOffsetX
                if (sx > 160 || sx + z.a < 0) continue
                for (let k = 0; k < Math.idiv(z.a, 6); k++) {
                    const x = sx + 3 + k * 6 + Math.round(Math.sin(t * 0.003 + k) * 2)
                    const y = z.y0 + z.b - ((t * 0.09 + k * 37) % z.b) - camera.drawOffsetY
                    target.fillRect(x, y, 1, 6, k % 2 == 0 ? C.White : C.LBlue)
                }
            }
        })
        // darkness of the Core Reactor
        scene.createRenderable(150, (target: Image, camera: scene.Camera) => {
            if (Art.th == null || !Art.th.dark || Ents.bossActive || Player.hero == null || (Game.state != Game.PLAY && Game.state != Game.PAUSED)) return
            target.drawTransparentImage(Art.darkness, Math.round(Player.hero.x - camera.drawOffsetX) - 160, Math.round(Player.hero.y - camera.drawOffsetY) - 120)
        })
        // HUD
        scene.createRenderable(200, (target: Image, camera: scene.Camera) => {
            if (Game.state != Game.PLAY && Game.state != Game.PAUSED) return
            drawHud(target)
        })
    }
    export function drawParallax(target: Image, camX: number, camY: number, t: number) {
        if (Art.far == null) return
        const fo = -(Math.idiv(camX, 4) % 256), fy = -Math.idiv(camY, 5)
        for (let x = fo; x < 160; x += 256) {
            target.drawImage(Art.far, x, fy)
            if (flash > 0) for (let k = 0; k < Art.windowX.length; k++) {
                target.fillRect(x + Art.windowX[k], fy + 22, 64, 52, flash % 2 == 0 ? C.White : C.LBlue)
                if (flash > 3) { let lx = x + Art.windowX[k] + 30, ly = fy + 22; while (ly < fy + 68) { const nx = lx + randint(-4, 4); target.drawLine(lx, ly, nx, ly + 6, C.Blue); lx = nx; ly += 6 } }
            }
        }
        const mo = -(Math.idiv(camX, 2) % 480), my = -Math.idiv(camY, 3)
        for (let x = mo; x < 160; x += 480) {
            target.drawTransparentImage(Art.mid, x, my)
            for (let i = 0; i < Art.animK.length; i++) {
                const ax = x + Art.animX[i], ay = my + Art.animY[i]
                if (ax < -60 || ax > 220) continue
                drawAnim(target, Art.animK[i], ax, ay, t / 1000)
            }
        }
        if (Art.th.windows && t > nextThunder) { flash = 7; nextThunder = t + 6000 + randint(0, 7000); if (Game.state == Game.PLAY) scene.cameraShake(2, 300) }
        if (flash > 0) flash--
    }
    function drawAnim(target: Image, k: number, x: number, y: number, t: number) {
        if (k == Art.A.Bubbles) {
            for (let i = 0; i < 6; i++) {
                const rise = (t * (10 + i * 3) + i * 17) % 52
                const bx = x + 4 + (i * 5) % 13 + Math.round(Math.sin(t * 3 + i)), by = y + 74 - Math.round(rise)
                target.setPixel(bx, by, C.White); if (i % 2 == 0) target.setPixel(bx + 1, by, C.White)
            }
        } else if (k == Art.A.Fan) {
            for (let b = 0; b < 4; b++) {
                const a = t * 7 + b * Math.PI / 2
                const ex = Math.round(Math.cos(a) * 12), ey = Math.round(Math.sin(a) * 12)
                target.drawLine(x, y, x + ex, y + ey, C.Gray); target.drawLine(x + 1, y, x + 1 + ex, y + ey, C.Gray)
            }
            target.fillCircle(x, y, 2, C.White)
        } else if (k == Art.A.Beacon) {
            target.fillRect(x, y, 6, 3, Math.floor(t * 3) % 2 == 0 ? C.Red : C.DPurple)
        } else if (k == Art.A.Monitor) {
            target.fillRect(x, y + Math.floor(t * 12) % 22, 34, 1, C.Teal)
        } else if (k == Art.A.Furnace) {
            const f = Math.floor(t * 10) % 3
            target.fillRect(x + 2, y + 10, 26, 10, f == 0 ? C.Red : C.Orange)
            target.fillRect(x + 6 + f * 2, y + 6, 14, 6, f == 1 ? C.Yellow : C.Orange)
            target.fillRect(x + 10, y + 3, 6, 4, C.Yellow)
        } else if (k == Art.A.Centrifuge) {
            for (let b = 0; b < 3; b++) {
                const a = t * 9 + b * 2.094
                target.drawLine(x, y, x + Math.round(Math.cos(a) * 12), y + Math.round(Math.sin(a) * 12), C.White)
                target.fillRect(x + Math.round(Math.cos(a) * 11) - 1, y + Math.round(Math.sin(a) * 11) - 1, 3, 3, [C.Pink, C.LBlue, C.Yellow][b])
            }
        } else if (k == Art.A.Leds) {
            for (let r = 0; r < 9; r++) for (let c = 0; c < 3; c++)
                if (Math.sin(t * 3 + r * 7.3 + c * 3.1 + x) > 0.2) target.setPixel(x + 2 + c * 5, y + 4 + r * 8, (r + c) % 4 == 0 ? C.Pink : C.Teal)
        } else if (k == Art.A.Ring) {
            for (let b = 0; b < 3; b++) {
                const a = t * (1.2 + b * 0.5) * (b % 2 == 0 ? 1 : -1)
                target.fillRect(x + Math.round(Math.cos(a) * (20 + b * 3)) - 1, y + Math.round(Math.sin(a) * (20 + b * 3)) - 1, 3, 3, b == 1 ? C.Pink : C.Teal)
            }
            target.fillCircle(x, y, 3 + Math.floor(t * 4) % 2, C.Teal)
        } else if (k == Art.A.MixEye) {
            const look = Math.round(Math.sin(t * 0.8) * 6)
            target.fillRect(x + 8 + look, y + 9, 6, 4, C.Red); target.fillRect(x + 20 + look, y + 9, 6, 4, C.Red)
            if (Math.floor(t * 2) % 5 == 0) { target.fillRect(x + 8 + look, y + 10, 6, 1, C.Black); target.fillRect(x + 20 + look, y + 10, 6, 1, C.Black) }
        } else if (k == Art.A.Drip) {
            const d = (t * 40) % 100
            target.fillRect(x, y + Math.round(d), 2, 3, Art.th.liquid)
        }
    }

    // ------------------------------------------------------------------
    //  HUD
    // ------------------------------------------------------------------
    export function toast(msg: string) { toastMsg = msg; toastT = 1800 }
    export function radio(who: string, text: string) { radioWho = who; radioText = wrap(text, 25); radioT = 4200 }
    export function banner(text: string) { bannerText = text; bannerT = 2400 }
    export function tick(dt: number) {
        const ms = dt * 1000
        if (toastT > 0) toastT -= ms
        if (radioT > 0) radioT -= ms
        if (bannerT > 0) bannerT -= ms
    }
    function drawHud(target: Image) {
        // hearts
        for (let i = 0; i < Player.maxHearts; i++) target.drawTransparentImage(i < Player.hearts ? Art.heartFull : Art.heartEmpty, 2 + i * 8, 2)
        // score (top right)
        const sc = "" + Game.score
        target.fillRect(158 - sc.length * 6 - 3, 1, sc.length * 6 + 4, 8, C.Black)
        target.print(sc, 158 - sc.length * 6, 2, C.White, image.font5)
        // flasks / rare elements / logs
        target.drawTransparentImage(Art.flaskIcon, 2, 10)
        target.print("" + Game.stats[2] + "/" + Game.totalFlasks, 11, 13, C.White, image.font5)
        for (let i = 0; i < 3; i++) {
            const got = i < Game.stats[3]
            target.drawRect(48 + i * 6, 12, 5, 6, got ? C.LBlue : C.DPurple)
            if (got) target.fillRect(49 + i * 6, 13, 3, 4, C.Teal)
        }
        target.fillRect(70, 12, 4, 6, Game.stats[4] > 0 ? Art.th.accent : C.DPurple)
        target.fillRect(75, 12, 4, 6, Game.stats[4] > 1 ? Art.th.accent : C.DPurple)
        // progress bar with the 3 chem locks
        const bx = 46, bw = 66
        target.fillRect(bx, 3, bw, 3, C.DPurple)
        const p = Math.max(0, Math.min(1, Player.hero.x / (Levels.w * 16 - 48)))
        target.fillRect(bx, 3, Math.round(bw * p), 3, Art.th.accent)
        for (let i = 0; i < Levels.doorCols.length; i++) {
            const dx = bx + Math.round(bw * Levels.doorCols[i] / Levels.w)
            target.fillRect(dx, 1, 2, 7, Game.doorOpen(i) ? C.Green : C.Yellow)
        }
        target.fillRect(bx + Math.round(bw * p) - 1, 2, 3, 5, C.White)
        // boss bar
        if (Ents.bossActive && !Ents.bossDead) {
            target.fillRect(40, 20, 80, 9, C.Black); target.print("M.I.X.", 42, 22, C.Red, image.font5)
            for (let i = 0; i < 3; i++) target.fillRect(80 + i * 13, 22, 11, 5, i < Ents.bossHp ? C.Red : C.DPurple)
        }
        // banner
        if (bannerT > 0) {
            panel(target, 10, 40, 140, 24, Art.th.accent)
            center(target, bannerText, 44, Art.th.accent, image.font8)
            center(target, Game.levelSub(), 55, C.White, image.font5)
        }
        // toast + radio
        let y = 110
        if (radioT > 0) {
            const h = 9 + radioText.length * 7
            y = 118 - h
            panel(target, 2, y, 156, h + 1, radioWho == "M.I.X." ? C.Red : Art.th.accent)
            target.print(radioWho, 6, y + 2, radioWho == "M.I.X." ? C.Red : Art.th.accent, image.font5)
            for (let i = 0; i < radioText.length; i++) target.print(radioText[i], 6, y + 9 + i * 7, C.White, image.font5)
            y -= 2
        }
        if (toastT > 0) {
            const w = toastMsg.length * 6 + 8
            target.fillRect(80 - Math.idiv(w, 2), y - 10, w, 9, C.Black)
            target.drawRect(80 - Math.idiv(w, 2), y - 10, w, 9, C.Yellow)
            center(target, toastMsg, y - 8, C.Yellow, image.font5)
        }
    }

    // ------------------------------------------------------------------
    //  TITLE
    // ------------------------------------------------------------------
    export function title(onPick: (choice: number) => void) {
        open()
        const items = ["NEW GAME", "SECTOR SELECT", "HOW TO PLAY"]
        let sel = 0
        let done = false
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            const t = game.runtime()
            drawParallax(target, Math.idiv(t, 40), 30, t)
            for (let i = 0; i < 10; i++) {
                const fx = (i * 37 + Math.idiv(t, 60 + i * 9)) % 180 - 10, fy = 120 - (Math.idiv(t, 30 + i * 7) + i * 23) % 140
                target.drawTransparentImage(Art.flasks[i % Art.flasks.length], fx, fy)
            }
            target.fillRect(0, 4, 160, 44, C.Black)
            target.drawTransparentImage(Art.titleBig, 32, 9)
            center(target, "THE CHEMICAL CRISIS", 32, C.Yellow, image.font8)
            for (let i = 0; i < items.length; i++) {
                const y = 60 + i * 15
                if (i == sel) { target.fillRect(30, y - 3, 100, 13, C.Teal); center(target, items[i], y, C.Black, image.font8) }
                else { target.fillRect(30, y - 3, 100, 13, C.Black); target.drawRect(30, y - 3, 100, 13, C.DPurple); center(target, items[i], y, C.White, image.font8) }
            }
            hint(target, "UP/DOWN  +  A")
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, () => { sel = (sel + items.length - 1) % items.length; music.footstep.play() })
        controller.down.onEvent(ControllerButtonEvent.Pressed, () => { sel = (sel + 1) % items.length; music.footstep.play() })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
            if (done) return
            done = true; music.baDing.play()
            game.popScene(); onPick(sel)
        })
    }

    // ------------------------------------------------------------------
    //  DIALOG (story pages with portrait + typewriter text)
    //  pages: who, text, who, text ...
    // ------------------------------------------------------------------
    export function dialog(pages: string[], onDone: () => void) {
        open()
        let page = 0
        let start = game.runtime()
        let lines = wrap(pages[1], 25)
        let total = pages[1].length
        let done = false
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            const who = pages[page * 2]
            target.fill(C.Black)
            panel(target, 2, 2, 156, 108, who == "M.I.X." ? C.Red : C.Teal)
            const pic = who == "HALDEN" ? Art.portraitHalden : who == "M.I.X." ? Art.portraitMix : Art.portraitNarrator
            target.drawImage(pic, 8, 8)
            target.print(who == "" ? "INCIDENT REPORT" : who == "HALDEN" ? "PROF. HALDEN" : who, 46, 10, who == "M.I.X." ? C.Red : C.Teal, image.font8)
            target.print(who == "HALDEN" ? "radio, Core room" : who == "M.I.X." ? "robot chemist" : "Helix Institute", 46, 22, C.Gray, image.font5)
            let shown = Math.idiv(game.runtime() - start, 25)
            for (let i = 0; i < lines.length; i++) {
                const ln = lines[i]
                if (shown <= 0) break
                target.print(shown >= ln.length ? ln : ln.substr(0, shown), 8, 46 + i * 10, C.White, image.font8)
                shown -= ln.length + 1
            }
            for (let i = 0; i < Math.idiv(pages.length, 2); i++) target.fillRect(8 + i * 6, 104, 4, 3, i == page ? C.Teal : C.DPurple)
            hint(target, "A: NEXT     B: SKIP")
        })
        const finish = () => { if (done) return; done = true; game.popScene(); onDone() }
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
            if (done) return
            if (Math.idiv(game.runtime() - start, 25) < total + lines.length) { start = -100000; return }
            page++
            if (page * 2 >= pages.length) { finish(); return }
            lines = wrap(pages[page * 2 + 1], 25); total = pages[page * 2 + 1].length; start = game.runtime()
            music.footstep.play()
        })
        controller.B.onEvent(ControllerButtonEvent.Pressed, finish)
    }

    // ------------------------------------------------------------------
    //  BRIEFING
    // ------------------------------------------------------------------
    export function brief(level: number, onStart: () => void, onBack: () => void) {
        open()
        const lines = wrap(Data.brief(level), 25)
        let done = false
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            const t = game.runtime()
            drawParallax(target, Math.idiv(t, 50), 30, t)
            panel(target, 4, 4, 152, 106, Art.th.accent)
            target.drawImage(Art.portraitHalden, 9, 9)
            target.print("PROF. HALDEN", 46, 10, Art.th.accent, image.font5)
            const tl = wrap(Data.briefTitle(level), 18)
            for (let i = 0; i < tl.length; i++) target.print(tl[i], 46, 19 + i * 10, C.White, image.font8)
            for (let i = 0; i < lines.length; i++) target.print(lines[i], 8, 46 + i * 9, C.White, image.font8)
            target.print("GOAL: 3 CHEM LOCKS + EXIT", 8, 101, C.Yellow, image.font5)
            hint(target, "A:START MISSION  B:BACK")
        })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => { if (done) return; done = true; game.popScene(); onStart() })
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => { if (done) return; done = true; game.popScene(); onBack() })
    }

    // ------------------------------------------------------------------
    //  QUIZ  —  header, question bank, list of used question indexes,
    //  onAnswer(correct, firstTry) for scoring, onClose(unlocked)
    // ------------------------------------------------------------------
    export function quiz(header: string, bank: string[][], used: number[], onAnswer: (correct: boolean, firstTry: boolean) => void, onClose: (ok: boolean) => void) {
        open()
        let mode = 0              // 0 choosing, 1 correct, 2 wrong
        let sel = 0
        let tries = 0
        let q: string[] = []
        let opts: string[] = []
        let correctIdx = 0
        let qLines: string[] = []
        let expLines: string[] = []
        let done = false
        const accent = Art.th.accent
        const pick = () => {
            let avail: number[] = []
            for (let i = 0; i < bank.length; i++) if (used.indexOf(i) < 0) avail.push(i)
            if (avail.length == 0) { while (used.length > 0) used.pop(); for (let i = 0; i < bank.length; i++) avail.push(i) }
            const k = avail[randint(0, avail.length - 1)]
            used.push(k)
            q = bank[k]
            opts = [q[1], q[2], q[3], q[4]]
            for (let i = 3; i > 0; i--) { const j = randint(0, i); const tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp }
            correctIdx = opts.indexOf(q[1])
            qLines = wrap(q[0], 25)
            expLines = wrap(q[5], 25)
            sel = 0; mode = 0
        }
        pick()
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            target.fill(C.Black)
            target.drawRect(0, 0, 160, 120, accent)
            target.print(header, 4, 3, accent, image.font5)
            if (mode == 0) {
                for (let i = 0; i < qLines.length; i++) target.print(qLines[i], 4, 12 + i * 10, C.White, image.font8)
                for (let i = 0; i < 4; i++) {
                    const y = 58 + i * 13
                    if (i == sel) { target.fillRect(3, y, 154, 12, accent); target.print(opts[i], 7, y + 2, C.Black, image.font8) }
                    else { target.drawRect(3, y, 154, 12, C.DPurple); target.print(opts[i], 7, y + 2, C.White, image.font8) }
                }
                hint(target, "UP/DOWN + A: ANSWER")
            } else {
                const ok = mode == 1
                target.fillRect(1, 11, 158, 12, ok ? C.Green : C.Red)
                center(target, ok ? (tries == 0 ? "CORRECT!  +150" : "CORRECT!  +100") : "NOT QUITE...", 13, C.White, image.font8)
                const al = wrap("ANSWER: " + q[1], 26)
                for (let i = 0; i < al.length; i++) target.print(al[i], 4, 27 + i * 8, C.Yellow, image.font5)
                const y0 = 29 + al.length * 8
                for (let i = 0; i < expLines.length; i++) target.print(expLines[i], 4, y0 + i * 8, C.White, image.font5)
                hint(target, ok ? "A: CONTINUE" : "A:NEW QUESTION  B:LEAVE")
            }
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, () => { if (mode == 0) { sel = (sel + 3) % 4; music.footstep.play() } })
        controller.down.onEvent(ControllerButtonEvent.Pressed, () => { if (mode == 0) { sel = (sel + 1) % 4; music.footstep.play() } })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
            if (done) return
            if (mode == 0) {
                if (sel == correctIdx) { mode = 1; music.powerUp.play(); onAnswer(true, tries == 0) }
                else { mode = 2; music.wawawawaa.play(); onAnswer(false, false) }
            } else if (mode == 1) { done = true; game.popScene(); onClose(true) }
            else { tries++; pick(); music.footstep.play() }
        })
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
            if (done || mode != 2) return
            done = true; game.popScene(); onClose(false)
        })
    }

    // ------------------------------------------------------------------
    //  SECTOR SELECT
    // ------------------------------------------------------------------
    export function select(onPick: (level: number) => void, onBack: () => void) {
        open()
        let sel = Math.min(Game.unlocked, 4)
        let done = false
        const names = ["STORAGE WING", "ACID BASIN", "REACTION HALL", "SEPARATION", "CORE REACTOR"]
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            const t = game.runtime()
            drawParallax(target, Math.idiv(t, 50), 30, t)
            panel(target, 4, 2, 152, 108, C.Teal)
            target.print("CHOOSE A SECTOR", 8, 6, C.Teal, image.font8)
            for (let i = 0; i < 5; i++) {
                const y = 18 + i * 16
                const lock = i > Game.unlocked
                if (i == sel) target.fillRect(7, y - 1, 146, 15, lock ? C.DPurple : C.Teal)
                else target.drawRect(7, y - 1, 146, 15, C.DPurple)
                const col = i == sel && !lock ? C.Black : lock ? C.Gray : C.White
                target.print((i + 1) + " " + names[i], 10, y + 1, col, image.font8)
                if (lock) target.print("LOCKED", 110, y + 5, C.Gray, image.font5)
                else {
                    for (let s = 0; s < 3; s++) drawStar(target, 112 + s * 9, y + 1, s < Game.stars[i] ? C.Yellow : (i == sel ? C.Black : C.DPurple))
                    target.print("" + Game.best[i], 10, y + 9, col, image.font5)
                }
            }
            target.print("ACHIEVEMENTS " + Game.achCount() + "/6", 8, 100, C.Yellow, image.font5)
            hint(target, "A:PLAY B:BACK RIGHT:ALL")
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, () => { sel = (sel + 4) % 5; music.footstep.play() })
        controller.down.onEvent(ControllerButtonEvent.Pressed, () => { sel = (sel + 1) % 5; music.footstep.play() })
        controller.right.onEvent(ControllerButtonEvent.Pressed, () => { Game.unlockAll(); music.magicWand.play() })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
            if (done) return
            if (sel > Game.unlocked) { music.buzzer.play(); return }
            done = true; game.popScene(); onPick(sel)
        })
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => { if (done) return; done = true; game.popScene(); onBack() })
    }
    export function drawStar(target: Image, x: number, y: number, col: number) {
        target.fillRect(x + 3, y, 1, 2, col); target.fillRect(x, y + 2, 7, 1, col); target.fillRect(x + 1, y + 3, 5, 1, col)
        target.fillRect(x + 2, y + 4, 3, 1, col); target.setPixel(x + 1, y + 5, col); target.setPixel(x + 5, y + 5, col)
    }

    // ------------------------------------------------------------------
    //  RESULTS / GAME OVER / ENDING
    // ------------------------------------------------------------------
    export function results(head: string, rows: string[], vals: string[], stars: number, msg: string, onNext: () => void, onSelect: () => void) {
        open()
        let done = false
        const ml = wrap(msg, 25)
        const start = game.runtime()
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            const t = game.runtime()
            drawParallax(target, Math.idiv(t, 50), 30, t)
            panel(target, 4, 2, 152, 108, Art.th.accent)
            center(target, head, 6, Art.th.accent, image.font8)
            for (let s = 0; s < 3; s++) {
                const on = s < stars && t - start > 400 + s * 300
                const sx = 56 + s * 18
                target.fillRect(sx, 17, 13, 11, C.Black)
                drawStar(target, sx + 3, 19, on ? C.Yellow : C.DPurple)
                if (on) target.drawRect(sx, 17, 13, 11, C.Yellow)
            }
            for (let i = 0; i < rows.length; i++) {
                const y = 32 + i * 8
                target.print(rows[i], 9, y, i == rows.length - 1 ? C.Yellow : C.White, image.font5)
                target.print(vals[i], 151 - vals[i].length * 6, y, i == rows.length - 1 ? C.Yellow : C.White, image.font5)
            }
            for (let i = 0; i < ml.length; i++) target.print(ml[i], 9, 34 + rows.length * 8 + i * 7, Art.th.accent, image.font5)
            hint(target, "A:CONTINUE  B:SECTORS")
        })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => { if (done || game.runtime() - start < 600) return; done = true; game.popScene(); onNext() })
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => { if (done || game.runtime() - start < 600) return; done = true; game.popScene(); onSelect() })
    }
    export function gameOver(onRetry: () => void, onQuit: () => void) {
        open()
        let done = false
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            target.fill(C.Black)
            panel(target, 10, 24, 140, 70, C.Red)
            center(target, "CONTAMINATED!", 32, C.Red, image.font8)
            const l = wrap("Your hazmat suit gave out. Back to the last safety shower!", 22)
            for (let i = 0; i < l.length; i++) center(target, l[i], 48 + i * 8, C.White, image.font5)
            center(target, "A: RETRY (-250 PTS)", 76, C.Yellow, image.font5)
            center(target, "B: SECTOR SELECT", 84, C.Gray, image.font5)
        })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => { if (done) return; done = true; game.popScene(); onRetry() })
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => { if (done) return; done = true; game.popScene(); onQuit() })
    }
    export function finale(onDone: () => void) {
        open()
        let done = false
        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            const t = game.runtime()
            drawParallax(target, Math.idiv(t, 40), 30, t)
            panel(target, 8, 8, 144, 96, C.Green)
            center(target, "THE CITY IS SAFE!", 14, C.Green, image.font8)
            const l = wrap("You stopped the Chemical Crisis with real chemistry.", 22)
            for (let i = 0; i < l.length; i++) center(target, l[i], 28 + i * 8, C.White, image.font5)
            center(target, "TOTAL BEST SCORE", 54, C.Gray, image.font5)
            center(target, "" + Game.totalBest(), 62, C.Yellow, image.font8)
            center(target, "STARS " + Game.totalStars() + "/15", 76, C.White, image.font5)
            center(target, "ACHIEVEMENTS " + Game.achCount() + "/6", 84, C.White, image.font5)
            for (let i = 0; i < 12; i++) { const fx = (i * 29 + Math.idiv(t, 20)) % 160, fy = 100 - (Math.idiv(t, 15) + i * 17) % 20; target.setPixel(fx, fy, [C.Yellow, C.Pink, C.Teal][i % 3]) }
            hint(target, "A: BACK TO TITLE")
        })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => { if (done) return; done = true; game.popScene(); onDone() })
    }
}
