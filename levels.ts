// =====================================================================
//  ChemLab: The Chemical Crisis  —  levels.ts
//  Map builder + the five level layouts. Each level is 230-290 tiles
//  wide (3700-4600 px): 50+ seconds of non-stop running at full speed.
//  (No top-level code: call Levels.build(level).)
// =====================================================================

// entity spawn kinds
enum S { Mover = 0, Lift = 1, Crumble = 2, Spring = 3, Flame = 4, Drip = 5, Spawner = 6, Slime = 7, Fume = 8, Drone = 9, Flask = 10, Rare = 11, Log = 12, Heart = 13, Cp = 14, Updraft = 15, Arena = 16, Boss = 17, Console = 18, Lamp = 19, Prop = 20, Bubbles = 21, Barrel = 22, Drop = 23, Proj = 24, Puddle = 25 }

namespace Levels {
    export enum Dim { MaxW = 320, H = 15 }
    export let map: number[]
    export let w: number          // real width in tiles
    export let cur: number        // build cursor (column)
    export let g: number          // current ground row
    export let sk: number[]       // spawn kind
    export let sx: number[]       // spawn x (px)
    export let sy: number[]       // spawn y (px)
    export let sa: number[]       // params
    export let sb: number[]
    export let sc: number[]
    export let doorCols: number[]
    export let exitCol: number
    export let arenaA: number     // boss arena first column (0 = none)
    export let arenaB: number
    export let arenaG: number
    let level: number
    let rareN: number
    let logN: number
    let seed: number

    function rnd(n: number): number { seed = (seed * 75 + 74) % 65537; return seed % n }
    export function get(c: number, r: number): number {
        if (c < 0 || c >= Dim.MaxW || r < 0 || r >= Dim.H) return 0
        return map[r * Dim.MaxW + c]
    }
    function set(c: number, r: number, t: number) { if (c >= 0 && c < Dim.MaxW && r >= 0 && r < Dim.H) map[r * Dim.MaxW + c] = t }
    function col(c: number, top: number, t: number) { for (let r = top; r < Dim.H; r++) set(c, r, t) }
    function spawn(k: number, x: number, y: number, a: number, b: number, c: number) { sk.push(k); sx.push(x); sy.push(y); sa.push(a); sb.push(b); sc.push(c) }
    function flaskAt(c: number, r: number) { if (r < 1) r = 1; spawn(S.Flask, c * 16 + 8, r * 16 + 8, (c * 7 + r) % 7, 0, 0) }

    // ---------------- terrain pieces ----------------
    function G(n: number) { for (let i = 0; i < n; i++) col(cur + i, g, Art.T.Top); for (let i = 0; i < n; i++) for (let r = g + 1; r < Dim.H; r++) set(cur + i, r, Art.T.Fill); cur += n }
    function up(k: number) { g = Math.max(7, g - k) }
    function down(k: number) { g = Math.min(13, g + k) }
    function gap(n: number) {
        for (let i = 0; i < n; i++) flaskAt(cur + i, g - 2 - (i > 0 && i < n - 1 ? 1 : 0))
        cur += n
    }
    function steps(k: number, len: number, dir: number) { for (let j = 0; j < k; j++) { if (dir > 0) up(1); else down(1); G(len) } }
    // stones: 0 none, 1 platforms, 2 crumbling, 3 moving platform, 4 mixed
    function pool(n: number, stones: number, fume: boolean, rare: boolean) {
        const x0 = cur
        for (let i = 0; i < n; i++) { set(x0 + i, g, Art.T.LiqTop); set(x0 + i, g + 1, Art.T.Liq); for (let r = g + 2; r < Dim.H; r++) set(x0 + i, r, Art.T.Fill) }
        for (let i = 1; i < n - 1; i += (stones == 1 ? 4 : 3)) {
            const kind = stones == 4 ? (Math.idiv(i, 3) % 2 == 0 ? 1 : 2) : stones
            if (kind == 1) { set(x0 + i, g - 1, Art.T.Plat); if (stones == 1 && i + 1 < n - 1) set(x0 + i + 1, g - 1, Art.T.Plat) }
            else if (kind == 2) { spawn(S.Crumble, (x0 + i) * 16, (g - 1) * 16, 0, 0, 0); if (i + 1 < n - 1) spawn(S.Crumble, (x0 + i + 1) * 16, (g - 1) * 16, 0, 0, 0) }
        }
        if (stones == 3) spawn(S.Mover, x0 * 16, (g - 1) * 16, x0 * 16, (x0 + n) * 16 - 32, 0)
        if (fume) spawn(S.Fume, (x0 + Math.idiv(n, 2)) * 16, (g - 4) * 16, (Math.idiv(n, 2) - 1) * 16, 0, 0)
        if (rare) rareAt(x0 + Math.idiv(n, 2), g - 4)
        for (let i = 2; i < n - 1; i += 3) flaskAt(x0 + i, g - 3)
        spawn(S.Bubbles, (x0 + Math.idiv(n, 2)) * 16 + 8, g * 16 + 4, 0, 0, 0)
        cur += n
    }
    function mover(n: number) {
        spawn(S.Mover, cur * 16, g * 16, cur * 16, (cur + n) * 16 - 32, 0)
        for (let i = 2; i < n - 1; i += 2) flaskAt(cur + i, g - 2)
        cur += n
    }
    function lift(k: number) {
        spawn(S.Lift, cur * 16, g * 16, g * 16, (g - k) * 16, 0)
        flaskAt(cur + 1, g - k - 2)
        cur += 2; up(k)
    }
    function crumbles(n: number) {
        for (let i = 0; i < n; i++) { spawn(S.Crumble, (cur + i) * 16, g * 16, 0, 0, 0); if (i % 2 == 1) flaskAt(cur + i, g - 2) }
        cur += n
    }
    function spring(k: number) {
        G(2); spawn(S.Spring, (cur - 2) * 16 + 1, g * 16, 0, 0, 0)
        up(k); G(1)
        for (let i = 0; i < 3; i++) flaskAt(cur - 3, g - 1 - i * 2)
    }
    function flames(n: number, every: number) {
        const x0 = cur; G(n)
        let k = 0
        for (let i = 2; i < n - 1; i += every) { spawn(S.Flame, (x0 + i) * 16 + 3, g * 16, k * 700, 0, 0); k++ }
    }
    function conv(n: number, dir: number) {
        for (let i = 0; i < n; i++) { col(cur + i, g + 1, Art.T.Fill); set(cur + i, g, dir < 0 ? Art.T.ConvL : Art.T.ConvR) }
        for (let i = 1; i < n; i += 2) flaskAt(cur + i, g - 1)
        cur += n
    }
    function updraft(n: number, rise: number) {
        for (let i = 0; i < n; i++) set(cur + i, Dim.H - 1, Art.T.Metal)
        const top = (g - rise - 4) * 16
        spawn(S.Updraft, cur * 16, top, n * 16, Dim.H * 16 - top, 0)
        for (let i = 1; i < n; i += 2) flaskAt(cur + i, g - rise - 2)
        cur += n; up(rise)
    }
    function shards(n: number) { G(n); for (let i = 2; i < n - 2; i++) { set(cur - n + i, g - 1, Art.T.Shards); flaskAt(cur - n + i, g - 4) } }
    function crates(w2: number, h: number) {
        for (let i = 0; i < w2; i++) { col(cur + i, g, Art.T.Fill); set(cur + i, g, Art.T.Top); for (let j = 1; j <= h; j++) set(cur + i, g - j, Art.T.Crate) }
        flaskAt(cur, g - h - 1); cur += w2
    }
    function plats(n: number, dcs: number[], drs: number[]) {
        for (let k = 0; k < dcs.length; k++) { set(cur + dcs[k], g - drs[k], Art.T.Plat); set(cur + dcs[k] + 1, g - drs[k], Art.T.Plat); flaskAt(cur + dcs[k], g - drs[k] - 1) }
        cur += n
    }
    function cp() { G(3); spawn(S.Cp, (cur - 2) * 16, g * 16, 0, 0, 0) }
    function door() {
        const c = cur; G(1)
        set(c, g - 1, Art.T.DoorBot); set(c, g - 2, Art.T.DoorMid); set(c, g - 3, Art.T.DoorTop)
        for (let r = 0; r < g - 3; r++) set(c, r, Art.T.Metal)
        doorCols.push(c)
        G(2)
    }
    function exit() {
        G(4)
        for (let r = g - 3; r < g; r++) { set(cur, r, Art.T.Exit); set(cur + 1, r, Art.T.Exit) }
        exitCol = cur
        G(5)
        for (let r = 0; r < Dim.H; r++) set(cur, r, Art.T.Metal)
        cur++
    }
    function arena() {
        while (g < 11) { down(1); G(2) }
        cp(); G(2)
        const a = cur
        G(24)
        for (let r = 0; r < Dim.H; r++) set(cur, r, Art.T.Metal)
        cur++
        set(a + 7, g - 2, Art.T.Plat); set(a + 8, g - 2, Art.T.Plat); set(a + 15, g - 2, Art.T.Plat); set(a + 16, g - 2, Art.T.Plat)
        arenaA = a; arenaB = a + 24; arenaG = g
        spawn(S.Boss, (a + 12) * 16, (g - 4) * 16, 0, 0, 0)
        spawn(S.Console, (a + 3) * 16 + 8, g * 16, 0, 0, 0)
        spawn(S.Console, (a + 12) * 16 + 8, g * 16, 1, 0, 0)
        spawn(S.Console, (a + 21) * 16 + 8, g * 16, 2, 0, 0)
        exitCol = a + 17
    }
    // ---------------- creatures & items ----------------
    function slime(dc: number) { spawn(S.Slime, (cur + dc) * 16 + 8, g * 16 - 5, 0, 0, 0) }
    function fume(dc: number, dr: number) { spawn(S.Fume, (cur + dc) * 16, (g - dr) * 16, 40, 0, 0) }
    function drone(dc: number, dr: number, range: number) { spawn(S.Drone, (cur + dc) * 16, (g - dr) * 16, range * 16, 0, 0) }
    function drip(dc: number) { spawn(S.Drip, (cur + dc) * 16 + 8, Math.max(1, g - 6) * 16, 1300 + rnd(700), 0, 0) }
    function barrels(dc: number, ms: number) { spawn(S.Spawner, (cur + dc) * 16, g * 16, ms, 0, 0) }
    function flaskRow(dc: number, n: number, dr: number) { for (let i = 0; i < n; i++) flaskAt(cur + dc + i, g - dr) }
    function rareAt(c: number, r: number) { spawn(S.Rare, c * 16 + 8, r * 16 + 8, rareN, 0, 0); rareN++ }
    function rare(dc: number, dr: number) { rareAt(cur + dc, g - dr) }
    function log(dc: number) { spawn(S.Log, (cur + dc) * 16 + 8, (g - 1) * 16 + 6, logN, 0, 0); logN++ }
    function heart(dc: number) { spawn(S.Heart, (cur + dc) * 16 + 8, (g - 1) * 16 + 8, 0, 0, 0) }

    // ------------------------------------------------------------------
    export function build(lv: number) {
        level = lv; seed = 99 + lv * 31
        map = []
        for (let i = 0; i < Dim.MaxW * Dim.H; i++) map.push(0)
        sk = []; sx = []; sy = []; sa = []; sb = []; sc = []
        doorCols = []; exitCol = 0; arenaA = 0; arenaB = 0; arenaG = 0
        cur = 0; g = 11; rareN = 0; logN = 0
        if (lv == 0) level1()
        else if (lv == 1) level2()
        else if (lv == 2) level3()
        else if (lv == 3) level4()
        else level5()
        w = cur
        decorate()
    }

    // ---- 1: STORAGE WING — barrels, sludge, slimes, crates ----
    function level1() {
        G(12); log(-7); flaskRow(-4, 3, 2)
        crates(2, 1); G(5); slime(-3)
        gap(3); G(5); flaskRow(-4, 3, 1)
        steps(3, 3, 1); G(4); slime(-3)
        gap(3); G(3)
        pool(9, 1, false, true); G(4)
        cp(); door(); G(4)
        steps(2, 3, 1); G(10); barrels(-1, 2800); G(2)
        down(3); G(7); slime(-2); slime(-5)
        mover(9); G(4); heart(-2)
        crates(1, 1); crates(1, 2); G(3)
        G(10); drip(-8); drip(-5); drip(-2)
        gap(3); G(2); gap(3); G(5); log(-3)
        pool(12, 1, true, false); G(4)
        cp(); door(); G(4)
        plats(12, [1, 4, 7, 10], [1, 2, 2, 1]); rare(-6, 5); G(6); slime(-2); slime(-5)
        shards(8); G(3)
        up(2); G(12); barrels(-1, 2300); G(2)
        down(2); G(3); mover(10); G(5); slime(-3)
        crates(1, 1); G(2); crates(2, 2); rare(-1, 4); G(3)
        cp(); door(); G(4)
        pool(12, 3, true, false); G(4)
        steps(2, 3, 1); G(6); slime(-3); gap(3); G(4); slime(-2)
        exit()
    }
    // ---- 2: ACID BASIN — acid lakes, crumbling walkways, acid rain, fumes ----
    function level2() {
        G(12); log(-6); flaskRow(-4, 3, 2)
        pool(6, 1, false, false); G(4); slime(-2)
        crumbles(6); G(4)
        G(10); drip(-9); drip(-6); drip(-3)
        pool(10, 2, false, true); G(3)
        steps(2, 3, 1); gap(3); G(4); fume(-2, 3)
        cp(); door(); G(4)
        mover(10); G(3); slime(-1)
        pool(8, 1, true, false); G(2); pool(8, 1, false, false); G(4)
        crumbles(8); G(5); slime(-2); slime(-4)
        lift(4); G(6); rare(-3, 3); steps(2, 3, -1); G(3); log(-2)
        gap(3); G(3); heart(-2)
        cp(); door(); G(4)
        pool(18, 4, true, false); G(4)
        G(8); drip(-7); drip(-4); drip(-1)
        crumbles(5); G(2); crumbles(5); G(3)
        shards(8); G(2); mover(10); G(4); slime(-2)
        cp(); door(); G(4)
        crumbles(9); G(3)
        pool(12, 2, true, true); G(4)
        steps(2, 3, 1); G(5); slime(-2); fume(-3, 3); gap(3); G(4)
        exit()
    }
    // ---- 3: REACTION HALL — flame jets, springs, drones, lifts, slag ----
    function level3() {
        G(12); log(-6); flaskRow(-4, 3, 2)
        flames(9, 3); G(3)
        spring(4); G(6); drone(-3, 3, 2)
        gap(3); G(3); gap(3); G(4); rare(-2, 4)
        flames(13, 3); G(2)
        cp(); door(); G(4)
        down(4); G(4); lift(4); G(5); slime(-2); steps(2, 3, -1); G(2)
        gap(3); drone(-2, 4, 2); G(3); gap(3); G(3)
        pool(10, 1, false, false); G(3); heart(-1)
        spring(4); G(4); flames(9, 3); log(-2)
        cp(); door(); G(4)
        mover(11); drone(-6, 3, 3); G(3)
        crumbles(6); G(4)
        flames(15, 2); G(2)
        down(4); G(3); spring(4); G(3); rare(-2, 3); G(4); slime(-3)
        steps(2, 3, -1); G(3)
        cp(); door(); G(4)
        pool(12, 3, true, true); G(4); drone(-2, 3, 3)
        flames(10, 3); gap(3); G(6)
        exit()
    }
    // ---- 4: SEPARATION PLANT — conveyors, steam updrafts, centrifuge drones ----
    function level4() {
        G(12); log(-6); flaskRow(-4, 3, 2)
        conv(10, -1); G(3); slime(-2)
        updraft(8, 3); G(6); drone(-3, 3, 2)
        conv(6, 1); gap(3); conv(6, 1); G(3)
        cp(); door(); G(4)
        pool(10, 1, true, false); G(3)
        updraft(9, 3); G(5); drone(-3, 3, 2); rare(-2, 4)
        down(3); G(3); conv(10, -1); slime(-3); slime(-7); G(3)
        mover(11); G(4); heart(-2); log(-3)
        cp(); door(); G(4)
        steps(2, 3, 1); crates(2, 2); G(3)
        updraft(11, 2); drone(-6, 4, 4); G(4)
        crumbles(6); G(3); conv(8, -1); G(2)
        down(3); G(4); pool(10, 4, true, true); G(3)
        cp(); door(); G(4)
        conv(14, -1); drone(-7, 3, 4); G(3)
        pool(12, 3, false, true); G(4); updraft(8, 3); G(5); slime(-2)
        gap(3); G(4)
        exit()
    }
    // ---- 5: CORE REACTOR — everything, in the dark, then M.I.X. ----
    function level5() {
        G(12); log(-6); flaskRow(-4, 3, 2)
        flames(9, 3); G(2)
        pool(9, 2, true, false); G(3)
        conv(10, -1); G(3); slime(-2)
        cp(); door(); G(4)
        updraft(9, 3); G(4); drone(-2, 3, 2)
        spring(4); G(5); flames(9, 3); rare(-4, 4)
        mover(11); drone(-6, 3, 3); G(4)
        cp(); door(); G(4); log(-1)
        crumbles(8); G(3); slime(-1)
        pool(12, 1, true, false); G(3)
        lift(4); G(10); barrels(-1, 2400); G(2); steps(2, 3, -1); G(3); heart(-2)
        shards(8); gap(3); G(3); rare(-2, 4)
        cp(); door(); G(4)
        conv(10, -1); updraft(9, 2); G(3); drone(-2, 3, 2)
        flames(12, 3); crumbles(6); G(4); slime(-2); rare(-3, 2)
        arena()
    }

    // ---- background props on flat floor + hanging lamps ----
    function decorate() {
        for (let c = 2; c < w - 4; c++) {
            let top = -1
            for (let r = 0; r < Dim.H; r++) { const v = get(c, r); if (v == Art.T.Metal) continue; if (v != 0) { top = r; break } }
            if (top < 0 || get(c, top) != Art.T.Top || get(c + 1, top) != Art.T.Top || get(c + 2, top) != Art.T.Top) continue
            if (get(c, top - 1) != 0 || get(c + 2, top - 1) != 0) continue
            if (doorCols.indexOf(c - 1) >= 0 || doorCols.indexOf(c + 3) >= 0 || (c >= exitCol - 2 && c <= exitCol + 3)) continue
            if (rnd(100) < 28) { spawn(S.Prop, c * 16 + 2, top * 16, rnd(6), 0, 0); c += 3 + rnd(3) }
        }
        for (let c = 8; c < w - 4; c += 14 + rnd(10)) spawn(S.Lamp, c * 16, 0, 18 + rnd(28), 0, 0)
    }
}
