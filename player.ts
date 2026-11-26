// =====================================================================
//  ChemLab: The Chemical Crisis  —  player.ts
//  The young scientist: acceleration, variable-height jump, coyote time,
//  jump buffering, one-way platforms, moving/crumbling platforms,
//  conveyors, steam updrafts, springs, damage, checkpoints, camera.
//  (No top-level code: Player.create() at level start.)
// =====================================================================
namespace Player {
    export let hero: Sprite
    export let hearts: number
    export let maxHearts: number
    export let ignoreA: boolean
    let inv: number           // invincibility (ms)
    let coyote: number
    let buffer: number
    let dropT: number
    let aPrev: boolean
    let facing: number
    let lastBottom: number
    let onPlat: boolean
    let standEnt: Ent
    let safeX: number
    let safeY: number
    let cpX: number
    let cpY: number
    let look: number
    let kick: number          // knockback velocity that fades out
    let noCut: boolean        // spring launches ignore the short-hop rule
    let animT: number

    enum P { MaxSpeed = 72, Gravity = 380, Jump = 172 }

    export function create(x: number, y: number) {
        hero = sprites.create(Art.heroR[0], K.Hero)
        hero.z = 10
        hero.ay = P.Gravity
        hero.setPosition(x, y)
        hearts = 5; maxHearts = 5; inv = 0; coyote = 0; buffer = 0; dropT = 0
        aPrev = true; ignoreA = true; facing = 1; lastBottom = hero.bottom; onPlat = false; standEnt = null
        safeX = x; safeY = y; cpX = x; cpY = y; look = 20; kick = 0; noCut = false; animT = 0
    }
    export function setCheckpoint(x: number, y: number) { cpX = x; cpY = y; safeX = x; safeY = y }
    export function respawnAtCheckpoint() {
        hero.setPosition(cpX, cpY); hero.vx = 0; hero.vy = 0; kick = 0
        safeX = cpX; safeY = cpY; inv = 2000; hearts = maxHearts; lastBottom = hero.bottom
        hero.setFlag(SpriteFlag.Invisible, false)
    }
    export function launch(vy: number) { hero.vy = vy; noCut = true; onPlat = false; standEnt = null; coyote = 0 }
    // true if the hero lands on top of s (and bounces)
    export function stomp(s: Sprite): boolean {
        if (hero.vy > 20 && hero.bottom - s.top < 7) {
            hero.vy = controller.A.isPressed() ? -190 : -140
            noCut = true
            music.thump.play()
            return true
        }
        return false
    }
    export function hurt(srcX: number) {
        if (inv > 0 || Game.state != Game.PLAY) return
        hearts--; inv = 1500; Game.stats[1]++
        kick = hero.x < srcX ? -110 : 110
        hero.vy = -120
        scene.cameraShake(3, 250)
        music.zapped.play()
        if (hearts <= 0) Game.gameOver()
    }
    function fallOut(liquid: boolean) {
        if (Game.state != Game.PLAY) return
        hearts--; Game.stats[1]++
        scene.cameraShake(4, 300)
        music.smallCrash.play()
        if (liquid) Ents.popup("SPLASH!", hero.x, hero.top, Art.th.liquid)
        if (hearts <= 0) { Game.gameOver(); return }
        hero.setPosition(safeX, safeY); hero.vx = 0; hero.vy = 0; kick = 0; inv = 1600; lastBottom = hero.bottom
    }

    export function update(dt: number, t: number) {
        const left = controller.left.isPressed(), right = controller.right.isPressed()
        const aNow = controller.A.isPressed() || controller.up.isPressed()
        const down = controller.down.isPressed()
        if (ignoreA && !aNow) ignoreA = false
        const pressed = aNow && !aPrev && !ignoreA
        aPrev = aNow

        // carried by moving platform
        if (standEnt != null && (standEnt.t == S.Mover || standEnt.t == S.Lift)) { hero.x += standEnt.dx; hero.y += standEnt.dy }

        // ---- horizontal: acceleration + friction + knockback ----
        const dir = (right ? 1 : 0) - (left ? 1 : 0)
        const grounded = hero.isHittingTile(CollisionDirection.Bottom) || onPlat
        let vx = hero.vx - kick
        const acc = grounded ? 620 : 420
        if (dir != 0) {
            facing = dir
            if (vx * dir < 0 && grounded) vx += dir * 900 * dt
            vx += dir * acc * dt
            if (vx * dir > P.MaxSpeed) vx = dir * P.MaxSpeed
        } else {
            const f = (grounded ? 700 : 160) * dt
            vx = Math.abs(vx) <= f ? 0 : vx - (vx > 0 ? f : -f)
        }
        kick = Math.abs(kick) < 8 ? 0 : kick * 0.9
        // conveyor belts
        const under = Levels.get(Math.idiv(hero.x, 16), Math.idiv(hero.bottom + 1, 16))
        if (hero.isHittingTile(CollisionDirection.Bottom)) {
            if (under == Art.T.ConvL) hero.x -= 30 * dt
            else if (under == Art.T.ConvR) hero.x += 30 * dt
        }
        hero.vx = vx + kick

        // ---- jump (buffer + coyote time) ----
        if (pressed) buffer = 140
        buffer -= dt * 1000; dropT -= dt * 1000
        coyote = grounded ? 90 : coyote - dt * 1000
        if (buffer > 0 && coyote > 0) {
            if (down && onPlat) { dropT = 260; hero.y += 3; onPlat = false; standEnt = null }
            else { hero.vy = -P.Jump; music.jumpUp.play(); noCut = false }
            buffer = 0; coyote = 0; onPlat = false; standEnt = null
        }
        // short hop when the button is released early
        if (!aNow && hero.vy < -40 && !noCut) hero.vy += P.Gravity * 1.4 * dt
        if (hero.vy >= 0) noCut = false

        // ---- steam updrafts ----
        let inUp = false
        for (let i = 0; i < Ents.zones.length; i++) {
            const z = Ents.zones[i]
            if (hero.x > z.x0 && hero.x < z.x0 + z.a && hero.bottom > z.y0 && hero.top < z.y0 + z.b) inUp = true
        }
        if (inUp) { hero.vy -= 600 * dt; if (hero.vy < -70) hero.vy = -70 }
        if (hero.vy > 260) hero.vy = 260

        // ---- one-way platforms (tiles + moving/crumbling) ----
        onPlat = false; standEnt = null
        if (hero.vy >= 0 && dropT <= 0) {
            const r = Math.idiv(hero.bottom, 16), top = r * 16
            if (lastBottom <= top + 1 && hero.bottom >= top) {
                const c0 = Math.idiv(hero.left + 2, 16), c1 = Math.idiv(hero.right - 2, 16)
                if (Levels.get(c0, r) == Art.T.Plat || Levels.get(c1, r) == Art.T.Plat) { hero.bottom = top; hero.vy = 0; onPlat = true }
            }
            for (let i = 0; i < Ents.plats.length && !onPlat; i++) {
                const e = Ents.plats[i]
                if (e.t == S.Crumble && e.st >= 2) continue
                const s = e.s
                if (hero.right - 2 > s.left && hero.left + 2 < s.right && lastBottom <= s.top - e.dy + 2 && hero.bottom >= s.top - 1 && hero.bottom <= s.top + 8) {
                    hero.bottom = s.top; hero.vy = 0; onPlat = true; standEnt = e
                    if (e.t == S.Crumble && e.st == 0) { e.st = 1; e.tm = 450; e.s.setImage(Art.crumble[1]) }
                }
            }
        }
        lastBottom = hero.bottom

        // ---- hazards ----
        const cx = Math.idiv(hero.x, 16)
        const feet = Levels.get(cx, Math.idiv(hero.bottom - 3, 16))
        if (feet == Art.T.LiqTop || feet == Art.T.Liq) { fallOut(true); return }
        if (feet == Art.T.Shards) { hurt(cx * 16 + 8); if (inv > 1400) hero.vy = -150 }
        if (hero.top > 15 * 16) { fallOut(false); return }

        // ---- remember a safe spot (solid floor, nothing nasty nearby) ----
        if (hero.isHittingTile(CollisionDirection.Bottom)) {
            const rr = Math.idiv(hero.bottom + 1, 16)
            const a = Levels.get(Math.idiv(hero.left - 8, 16), rr), b = Levels.get(Math.idiv(hero.right + 8, 16), rr)
            const nearBad = Levels.get(cx - 1, rr - 1) == Art.T.Shards || Levels.get(cx + 1, rr - 1) == Art.T.Shards
            if (a == Art.T.Top && b == Art.T.Top && under != Art.T.ConvL && under != Art.T.ConvR && !nearBad) { safeX = hero.x; safeY = hero.y }
        }

        // ---- animation ----
        if (inv > 0) { inv -= dt * 1000; hero.setFlag(SpriteFlag.Invisible, Math.idiv(t, 80) % 2 == 0 && inv > 0) }
        else hero.setFlag(SpriteFlag.Invisible, false)
        const frames = facing > 0 ? Art.heroR : Art.heroL
        let f = 0
        if (!grounded && !onPlat) f = 3
        else if (Math.abs(hero.vx) > 12) { animT += dt * 1000; const step = Math.idiv(animT, 110) % 4; f = step == 1 ? 1 : step == 3 ? 2 : 0 }
        if (hero.image != frames[f]) hero.setImage(frames[f])

        // ---- camera: keep the hero low on screen so more of the lab shows ----
        look += ((facing * 22) - look) * Math.min(1, dt * 3)
        scene.centerCameraAt(hero.x + look, hero.y - 18)
    }
}
