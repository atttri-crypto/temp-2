// =====================================================================
//  ChemLab: The Chemical Crisis  —  entities.ts
//  Everything that moves or can be touched: platforms, hazards,
//  enemies, pickups, checkpoints, steam vents and the M.I.X. boss.
//  (No top-level code: Ents.spawnAll() after Levels.build().)
// =====================================================================

// sprite kinds (plain numbers, so no SpriteKind.create() is needed)
enum K { Hero = 201, Enemy = 202, Hazard = 203, Pickup = 204, Decor = 205, Plat = 206, Boss = 207, Fx = 208 }

class Ent {
    t: number
    s: Sprite
    x0: number
    y0: number
    a: number
    b: number
    c: number
    st: number
    tm: number
    ph: number
    dx: number
    dy: number
    alive: boolean

    constructor() {
        this.t = 0
        this.s = null
        this.x0 = 0
        this.y0 = 0
        this.a = 0
        this.b = 0
        this.c = 0
        this.st = 0
        this.tm = 0
        this.ph = 0
        this.dx = 0
        this.dy = 0
        this.alive = true
    }
}
namespace Ents {
    export let list: Ent[]
    export let plats: Ent[]
    export let zones: Ent[]
    export let consoles: Ent[]
    export let bossE: Ent
    export let bossHp: number
    export let bossActive: boolean
    export let bossDead: boolean
    let nextConsole: number
    let bossStun: number
    let bossFire: number
    let bossSpawn: number
    let bossHit: number
    let bossDying: number

    export function clear() {
        const kinds = [K.Hero, K.Enemy, K.Hazard, K.Pickup, K.Decor, K.Plat, K.Boss, K.Fx]
        for (let i = 0; i < kinds.length; i++) sprites.destroyAllSpritesOfKind(kinds[i])
        list = []; plats = []; zones = []; consoles = []
        bossE = null; bossHp = 3; bossActive = false; bossDead = false
        nextConsole = -1; bossStun = 0; bossFire = 2500; bossSpawn = 6000; bossHit = 0; bossDying = 0
    }
    function add(t: number, s: Sprite, x0: number, y0: number, a: number, b: number, c: number): Ent {
        const e = new Ent()
        e.t = t; e.s = s; e.x0 = x0; e.y0 = y0; e.a = a; e.b = b; e.c = c; e.ph = randint(0, 628) / 100
        list.push(e)
        return e
    }
    function mk(img: Image, kind: number, ghost: boolean): Sprite {
        const s = sprites.create(img, kind)
        if (ghost) s.setFlag(SpriteFlag.Ghost, true)
        return s
    }
    export function popup(text: string, x: number, y: number, col: number) {
        const im = image.create(text.length * 6 + 2, 8)
        im.print(text, 1, 1, C.Black, image.font5); im.print(text, 0, 0, col, image.font5)
        const s = mk(im, K.Fx, true)
        s.setPosition(x, y); s.vy = -24; s.z = 20; s.lifespan = 800
    }

    // ------------------------------------------------------------------
    export function spawnAll() {
        const lv = Game.level
        const syms = Data.rareSymbols(lv)
        for (let i = 0; i < Levels.sk.length; i++) {
            const k = Levels.sk[i], x = Levels.sx[i], y = Levels.sy[i], a = Levels.sa[i], b = Levels.sb[i], c = Levels.sc[i]
            let s: Sprite = null
            if (k == S.Mover || k == S.Lift) {
                s = mk(Art.mover, K.Plat, true); s.left = x; s.top = y; s.z = -0.4
                const e = add(k, s, x, y, a, b, c); plats.push(e)
            } else if (k == S.Crumble) {
                s = mk(Art.crumble[0], K.Plat, true); s.left = x; s.top = y; s.z = -0.4
                plats.push(add(k, s, x, y, a, b, c))
            } else if (k == S.Spring) {
                s = mk(Art.spring[0], K.Decor, true); s.left = x; s.bottom = y; s.z = -0.3
                add(k, s, x, y, a, b, c)
            } else if (k == S.Flame) {
                s = mk(Art.flame[0], K.Hazard, true); s.left = x; s.bottom = y; s.z = -0.3
                add(k, s, x, y, a, b, c)
            } else if (k == S.Drip) {
                const col = image.create(6, y + 4)
                col.fillRect(1, 0, 4, y, C.Gray); col.fillRect(1, 0, 1, y, C.White)
                col.drawTransparentImage(Art.pipe, -2, y - 4)
                s = mk(col, K.Decor, true); s.left = x - 3; s.top = 0; s.z = -0.5
                add(k, s, x, y, a, b, c).tm = randint(0, a)
            } else if (k == S.Spawner) {
                s = mk(Art.spawner, K.Decor, true); s.left = x - 4; s.bottom = y; s.z = -0.5
                add(k, s, x, y, a, b, c).tm = 600
            } else if (k == S.Slime) {
                s = mk(Art.slime[0], K.Enemy, false); s.x = x; s.bottom = y + 5; s.ay = 380; s.vx = -18
                add(k, s, x, y, a, b, c)
            } else if (k == S.Fume) {
                s = mk(Art.fume, K.Enemy, true); s.x = x; s.y = y; s.z = 2
                add(k, s, x, y, a, b, c)
            } else if (k == S.Drone) {
                s = mk(Art.drone[0], K.Enemy, true); s.x = x; s.y = y; s.z = 2
                add(k, s, x, y, a, b, c)
            } else if (k == S.Flask) {
                s = mk(Art.flasks[a % Art.flasks.length], K.Pickup, true); s.x = x; s.y = y
                add(k, s, x, y, a, b, c)
            } else if (k == S.Rare) {
                s = mk(Art.rareCard(syms[a % 3]), K.Pickup, true); s.x = x; s.y = y
                add(k, s, x, y, a, b, c)
            } else if (k == S.Log) {
                s = mk(Art.logPad, K.Pickup, true); s.x = x; s.y = y
                add(k, s, x, y, a, b, c)
            } else if (k == S.Heart) {
                s = mk(Art.medkit, K.Pickup, true); s.x = x; s.y = y
                add(k, s, x, y, a, b, c)
            } else if (k == S.Cp) {
                s = mk(Art.shower[0], K.Decor, true); s.left = x; s.bottom = y; s.z = -0.5
                add(k, s, x, y, a, b, c)
            } else if (k == S.Updraft) {
                const e = add(k, null, x, y, a, b, c); zones.push(e)
                for (let vx = 0; vx < a; vx += 16) { const v = mk(Art.vent, K.Decor, true); v.left = x + vx; v.bottom = 14 * 16; v.z = -0.5 }
            } else if (k == S.Prop) {
                s = mk(Art.props[a % Art.props.length], K.Decor, true); s.left = x; s.bottom = y; s.z = -0.6
            } else if (k == S.Lamp) {
                s = mk(Art.lampImage(a), K.Decor, true); s.left = x - 12; s.top = 0; s.z = -0.6
            } else if (k == S.Bubbles) {
                s = mk(image.create(16, 2), K.Decor, true); s.x = x; s.y = y; s.startEffect(effects.bubbles)
            } else if (k == S.Boss) {
                s = mk(Art.boss[0], K.Boss, true); s.x = x; s.y = y; s.z = 3
                bossE = add(k, s, x, y, a, b, c)
            } else if (k == S.Console) {
                s = mk(Art.consoleImg[0], K.Decor, true); s.x = x; s.bottom = y; s.z = -0.3
                consoles.push(add(k, s, x, y, a, b, c))
            }
        }
    }

    // ------------------------------------------------------------------
    //  per-frame update
    // ------------------------------------------------------------------
    export function update(dt: number, t: number) {
        const hero = Player.hero
        const hx = hero.x
        for (let i = list.length - 1; i >= 0; i--) {
            const e = list[i]
            if (!e.alive) { list.removeAt(i); continue }
            const near = Math.abs(e.x0 - hx) < 220 || e.t == S.Mover || e.t == S.Lift
            if (!near && e.t != S.Boss && e.t != S.Barrel) continue
            const s = e.s
            if (e.t == S.Mover || e.t == S.Lift) {
                const dist = e.t == S.Mover ? Math.abs(e.b - e.a) : Math.abs(e.b - e.a)
                e.ph += dt * 45 / Math.max(16, dist) * Math.PI
                const k = 0.5 - 0.5 * Math.cos(e.ph)
                const nx = e.t == S.Mover ? e.a + (e.b - e.a) * k : e.x0
                const ny = e.t == S.Lift ? e.a + (e.b - e.a) * k : e.y0
                e.dx = nx - s.left; e.dy = ny - s.top
                s.left = nx; s.top = ny
            } else if (e.t == S.Crumble) {
                if (e.st == 1) {
                    e.tm -= dt * 1000; s.left = e.x0 + randint(-1, 1)
                    if (e.tm <= 0) { e.st = 2; e.tm = 900; s.ay = 300; s.left = e.x0; music.thump.play() }
                } else if (e.st == 2) {
                    e.tm -= dt * 1000
                    if (e.tm <= 0) { e.st = 3; e.tm = 3500; s.ay = 0; s.vy = 0; s.setFlag(SpriteFlag.Invisible, true) }
                } else if (e.st == 3) {
                    e.tm -= dt * 1000
                    if (e.tm <= 0) {
                        s.top = e.y0; s.left = e.x0
                        if (!hero.overlapsWith(s)) { e.st = 0; s.setImage(Art.crumble[0]); s.setFlag(SpriteFlag.Invisible, false) }
                    }
                }
            } else if (e.t == S.Spring) {
                if (e.tm > 0) { e.tm -= dt * 1000; if (e.tm <= 0) s.setImage(Art.spring[0]) }
                if (hero.vy >= 0 && hero.right > s.left + 2 && hero.left < s.right - 2 && hero.bottom >= s.top - 1 && hero.bottom <= s.bottom + 2) {
                    Player.launch(-268); s.setImage(Art.spring[1]); e.tm = 220; music.jumpUp.play()
                }
            } else if (e.t == S.Flame) {
                const p = (t + e.a) % 3000
                if (p < 1100) { s.setImage(Art.flame[2 + Math.idiv(t, 90) % 2]); if (hero.overlapsWith(s) && hero.bottom < e.y0 + 2) Player.hurt(s.x) }
                else if (p > 2300) s.setImage(Art.flame[Math.idiv(t, 120) % 2 == 0 ? 1 : 0])
                else s.setImage(Art.flame[0])
                s.left = e.x0; s.bottom = e.y0
            } else if (e.t == S.Drip) {
                e.tm -= dt * 1000
                if (e.tm <= 0) { e.tm = e.a; const d = mk(Art.drop, K.Hazard, true); d.x = e.x0; d.top = e.y0 + 2; d.ay = 300; add(S.Drop, d, e.x0, e.y0, 0, 0, 0).x0 = e.x0 }
            } else if (e.t == S.Drop) {
                const v = Levels.get(Math.idiv(s.x, 16), Math.idiv(s.bottom, 16))
                if (Art.isSolid(v) || v == Art.T.Plat || v == Art.T.LiqTop || s.top > 240) { kill(e); continue }
                if (hero.overlapsWith(s)) { Player.hurt(s.x); kill(e); continue }
            } else if (e.t == S.Spawner) {
                e.tm -= dt * 1000
                if (e.tm <= 0) {
                    e.tm = e.a
                    const b = mk(Art.barrel[0], K.Hazard, false); b.x = e.x0 - 2; b.bottom = e.y0 - 1; b.vx = -45; b.ay = 380
                    const be = add(S.Barrel, b, e.x0, e.y0, 0, 0, 0); be.tm = 14000
                }
            } else if (e.t == S.Barrel) {
                e.tm -= dt * 1000; e.x0 = s.x
                s.setImage(Art.barrel[Math.idiv(t, 160) % 2])
                const under = Levels.get(Math.idiv(s.x, 16), Math.idiv(s.bottom - 2, 16))
                if (s.isHittingTile(CollisionDirection.Left) || e.tm <= 0 || s.top > 240 || under == Art.T.LiqTop) { s.destroy(effects.disintegrate, 200); e.alive = false; continue }
                s.vx = -45
                if (hero.overlapsWith(s)) {
                    if (Player.stomp(s)) { Game.addScore(25, s.x, s.top); s.destroy(effects.disintegrate, 200); e.alive = false; continue }
                    else Player.hurt(s.x)
                }
            } else if (e.t == S.Slime) {
                if (e.st == 1) { e.tm -= dt * 1000; if (e.tm <= 0) kill(e); continue }
                s.setImage(Art.slime[Math.idiv(t + e.a, 280) % 2])
                if (s.isHittingTile(CollisionDirection.Left)) s.vx = 18
                else if (s.isHittingTile(CollisionDirection.Right)) s.vx = -18
                if (s.isHittingTile(CollisionDirection.Bottom)) {
                    const fc = Math.idiv(s.vx > 0 ? s.right + 1 : s.left - 1, 16), fr = Math.idiv(s.bottom + 2, 16)
                    const v = Levels.get(fc, fr)
                    if (!Art.isSolid(v) && v != Art.T.Plat) s.vx = -s.vx
                }
                if (s.top > 240) { kill(e); continue }
                if (hero.overlapsWith(s)) {
                    if (Player.stomp(s)) { e.st = 1; e.tm = 300; s.vx = 0; s.setFlag(SpriteFlag.Ghost, true); s.setImage(squash(s.image)); Game.stomped(s.x, s.top) }
                    else Player.hurt(s.x)
                }
            } else if (e.t == S.Fume) {
                s.x = e.x0 + Math.sin(t * 0.0007 + e.ph) * e.a
                s.y = e.y0 + Math.sin(t * 0.0019 + e.ph) * 8
                if (hero.overlapsWith(s)) Player.hurt(s.x)
            } else if (e.t == S.Drone) {
                if (e.st == 1) { s.vy += 300 * dt; if (s.top > 240) kill(e); continue }
                const ang = t * 0.0009 + e.ph
                s.x = e.x0 + Math.sin(ang) * e.a
                s.y = e.y0 + Math.sin(t * 0.0026) * 4
                s.setImage(Art.drone[Math.cos(ang) > 0 ? 0 : 1])
                if (hero.overlapsWith(s)) {
                    if (Player.stomp(s)) { e.st = 1; Game.stomped(s.x, s.top) }
                    else Player.hurt(s.x)
                }
            } else if (e.t == S.Flask || e.t == S.Rare || e.t == S.Log || e.t == S.Heart) {
                s.y = e.y0 + Math.sin(t * 0.004 + e.ph) * 2
                if (hero.right > s.left && hero.left < s.right && hero.bottom > s.top && hero.top < s.bottom) {
                    if (e.t == S.Flask) Game.gotFlask(s.x, s.y)
                    else if (e.t == S.Rare) Game.gotRare(s.x, s.y)
                    else if (e.t == S.Log) Game.gotLog(e.a)
                    else Game.gotHeart(s.x, s.y)
                    kill(e); continue
                }
            } else if (e.t == S.Cp) {
                if (e.st == 0 && hx > e.x0 + 4 && Math.abs(hero.bottom - e.y0) < 24) {
                    for (let j = 0; j < list.length; j++) if (list[j].t == S.Cp && list[j].st == 1) { list[j].st = 0; list[j].s.setImage(Art.shower[0]) }
                    e.st = 1; s.setImage(Art.shower[1])
                    Player.setCheckpoint(e.x0 + 8, e.y0 - 10)
                    Game.toast("CHECKPOINT REACHED")
                    music.baDing.play()
                }
            } else if (e.t == S.Proj) {
                const v = Levels.get(Math.idiv(s.x, 16), Math.idiv(s.bottom, 16))
                if (hero.right > s.left && hero.left < s.right && hero.bottom > s.top && hero.top < s.bottom) { Player.hurt(s.x); shatter(e, false); continue }
                if (Art.isSolid(v) || v == Art.T.Plat || s.top > 240) { shatter(e, true); continue }
            } else if (e.t == S.Puddle) {
                e.tm -= dt * 1000
                if (e.tm <= 0) { kill(e); continue }
                if (hero.overlapsWith(s)) Player.hurt(s.x)
            }
        }
        if (bossE != null) updateBoss(dt, t)
    }
    function kill(e: Ent) { if (e.s != null) e.s.destroy(); e.alive = false }
    function squash(im: Image): Image {
        const out = image.create(im.width + 4, 4)
        for (let x = 0; x < out.width; x++) out.fillRect(x, 1 + (x % 3 == 0 ? 0 : 1), 1, 3, Art.th.slime)
        return out
    }
    function shatter(e: Ent, puddle: boolean) {
        const s = e.s
        music.smallCrash.play()
        if (puddle) {
            let r = Math.idiv(s.bottom, 16)
            const c = Math.idiv(s.x, 16)
            while (r < 15 && !Art.isSolid(Levels.get(c, r)) && Levels.get(c, r) != Art.T.Plat) r++
            if (r < 15) {
                const p = mk(Art.puddle, K.Hazard, true); p.x = s.x; p.bottom = r * 16 + 1; p.z = -0.2
                add(S.Puddle, p, s.x, r * 16, 0, 0, 0).tm = 3000
            }
        }
        s.destroy(effects.disintegrate, 200); e.alive = false
    }

    // ------------------------------------------------------------------
    //  M.I.X. — final boss
    // ------------------------------------------------------------------
    function updateBoss(dt: number, t: number) {
        const b = bossE.s
        const hero = Player.hero
        const a = Levels.arenaA
        const cx = (a + 12) * 16, base = (Levels.arenaG - 4) * 16
        if (bossDead) return
        if (!bossActive) {
            if (hero.x > (a + 2) * 16) {
                bossActive = true
                for (let r = 0; r < Levels.arenaG; r++) Game.putTile(a - 1, r, Art.T.Metal)
                scene.cameraShake(4, 500); music.bigCrash.play()
                Game.radio("M.I.X.", "INTRUDER DETECTED. EMERGENCY LIGHTS ON. YOU WILL NOT REACH THE CORE.")
                nextConsole = 2500
            }
            return
        }
        if (nextConsole > 0) {
            nextConsole -= dt * 1000
            if (nextConsole <= 0) {
                let pick: Ent = null
                for (let i = 0; i < consoles.length; i++) {
                    const c = consoles[i]
                    if (c.st == 0 && (pick == null || Math.abs(c.s.x - hero.x) > Math.abs(pick.s.x - hero.x))) pick = c
                }
                if (pick != null) { pick.st = 1; pick.s.setImage(Art.consoleImg[1]); Game.radio("HALDEN", "A console is lit! Answer it to overload M.I.X.!"); music.sonar.play() }
            }
        }
        // consoles
        for (let i = 0; i < consoles.length; i++) {
            const c = consoles[i]
            if (c.tm > 0) c.tm -= dt * 1000
            if (c.st == 1 && c.tm <= 0 && hero.overlapsWith(c.s)) Game.bossQuiz(c)
        }
        if (bossDying > 0) {
            bossDying += dt * 1000
            b.y += 12 * dt
            if (Math.idiv(t, 120) % 2 == 0) b.setImage(Art.boss[1]); else b.setImage(Art.boss[2])
            if (bossDying > 2600) {
                bossDead = true
                b.destroy(effects.fire, 600)
                for (let r = Levels.arenaG - 3; r < Levels.arenaG; r++) { Game.putTile(Levels.exitCol, r, Art.T.Exit); Game.putTile(Levels.exitCol + 1, r, Art.T.Exit) }
                const sl = sprites.allOfKind(K.Enemy)
                for (let i = 0; i < sl.length; i++) sl[i].destroy(effects.disintegrate, 300)
                Game.radio("HALDEN", "M.I.X. is down! The exit lift is open. Come to the Core!")
                Game.unlock(5)
            }
            return
        }
        if (bossHit > 0) bossHit -= dt * 1000
        if (bossStun > 0) {
            bossStun -= dt * 1000
            b.setImage(Art.boss[bossHit > 0 ? 1 : 2])
            b.y += ((base + 18) - b.y) * Math.min(1, dt * 2)
            return
        }
        b.setImage(Art.boss[0])
        const tx = cx + Math.sin(t * 0.00045) * 130
        const ty = base + Math.sin(t * 0.0016) * 6
        b.x += (tx - b.x) * Math.min(1, dt * 1.5)
        b.y += (ty - b.y) * Math.min(1, dt * 2)
        const rage = 3 - bossHp
        bossFire -= dt * 1000
        if (bossFire <= 0) {
            bossFire = 2300 - rage * 500
            const shots = rage >= 2 ? 2 : 1
            for (let k = 0; k < shots; k++) {
                const tt = 1 + k * 0.25
                const tgx = hero.x + (k == 0 ? hero.vx * 0.4 : randint(-40, 40)), tgy = hero.bottom
                const p = mk(Art.proj, K.Hazard, true)
                p.x = b.x; p.y = b.y + 14; p.ay = 300
                p.vx = (tgx - p.x) / tt; p.vy = (tgy - p.y - 0.5 * 300 * tt * tt) / tt
                add(S.Proj, p, p.x, p.y, 0, 0, 0)
            }
            music.pewPew.play()
        }
        bossSpawn -= dt * 1000
        if (bossSpawn <= 0) {
            bossSpawn = 8000 - rage * 1000
            if (sprites.allOfKind(K.Enemy).length < 2) {
                const s = mk(Art.slime[0], K.Enemy, false); s.x = b.x; s.y = b.y + 20; s.ay = 380; s.vx = randint(0, 1) == 0 ? -24 : 24
                add(S.Slime, s, b.x, b.y, 0, 0, 0)
            }
        }
        if (hero.overlapsWith(b)) Player.hurt(b.x)
    }
    // called by Game after a console question
    export function consoleResult(c: Ent, ok: boolean) {
        if (!ok) { c.tm = 2000; return }
        c.st = 2; c.s.setImage(Art.consoleImg[2])
        bossHp--; bossStun = 3000; bossHit = 500
        scene.cameraShake(5, 500); music.bigCrash.play()
        if (bossHp > 0) {
            nextConsole = 3200
            Game.radio("M.I.X.", bossHp == 2 ? "ERROR. CORRECT ANSWER DETECTED. RECALIBRATING..." : "LOGIC CORE CRITICAL! STOP ANSWERING CORRECTLY!")
        } else {
            bossDying = 1
            Game.radio("HALDEN", "You did it! M.I.X. is shutting down!")
        }
    }
}