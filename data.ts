// =====================================================================
//  ChemLab: The Chemical Crisis  —  data.ts
//  Story text, question banks, achievements.  (No top-level code: safe
//  in any file order. Everything is returned by functions.)
// =====================================================================
namespace Data {
    // Each question: [question, correct, wrong1, wrong2, wrong3, explanation]
    export function bank(level: number): string[][] {
        if (level == 0) return [
            ["A gas relights a glowing splint. Which gas is it?", "Oxygen", "Hydrogen", "Carbon dioxide", "Nitrogen", "Oxygen supports burning, so a glowing splint bursts back into flame. Hydrogen gives a squeaky pop and CO2 puts flames out."],
            ["A lit splint near a gas makes a squeaky POP. Which gas?", "Hydrogen", "Oxygen", "Chlorine", "Carbon dioxide", "Hydrogen burns very fast with oxygen in the air: 2H2 + O2 -> 2H2O. That quick burn makes the pop."],
            ["Bubbling a gas through limewater turns it milky. Which gas?", "Carbon dioxide", "Oxygen", "Hydrogen", "Ammonia", "CO2 reacts with limewater (calcium hydroxide) to make calcium carbonate, an insoluble white solid."],
            ["A salt gives a LILAC flame in a flame test. Which metal ion?", "Potassium K+", "Sodium Na+", "Copper Cu2+", "Calcium Ca2+", "Flame colours: K+ lilac, Na+ yellow-orange, Cu2+ blue-green, Ca2+ brick red, Li+ crimson."],
            ["A salt gives a BLUE-GREEN flame. Which ion is it?", "Copper Cu2+", "Lithium Li+", "Sodium Na+", "Potassium K+", "Copper(II) gives a blue-green flame. Lithium is crimson, sodium yellow-orange, potassium lilac."],
            ["A salt gives a BRICK-RED flame. Which ion is it?", "Calcium Ca2+", "Sodium Na+", "Copper Cu2+", "Potassium K+", "Calcium ions give an orange-red (brick red) flame. Lithium gives a deeper crimson."],
            ["A soft silvery metal is kept under oil and fizzes hard in water. What is it?", "Sodium", "Copper", "Iron", "Gold", "Group 1 metals like sodium react fast with water to make a hydroxide and hydrogen, so they are kept under oil."],
            ["A yellow-green choking gas bleaches damp litmus paper. What is it?", "Chlorine", "Oxygen", "Hydrogen", "Nitrogen", "Chlorine is a toxic yellow-green gas. It bleaches damp litmus paper white."],
            ["Blue crystals turn white when heated, and blue again with water. What are they?", "Hydrated CuSO4", "Sodium chloride", "Iron(III) oxide", "Calcium carbonate", "Heating removes the water of crystallisation, leaving white copper(II) sulfate. Adding water turns it blue: a test for water."],
            ["A liquid boils at exactly 100 C and freezes at 0 C. What is it?", "Pure water", "Ethanol", "Salt water", "Vinegar", "Pure substances have fixed melting and boiling points. Mixtures like salt water boil over a range, above 100 C."],
            ["A sharp-smelling gas turns damp red litmus BLUE. What is it?", "Ammonia", "Chlorine", "Hydrogen chloride", "Oxygen", "Ammonia (NH3) is the only common alkaline gas, so it turns damp red litmus blue."],
            ["Silver nitrate gives a WHITE precipitate. Which ion is present?", "Chloride Cl-", "Iodide I-", "Carbonate", "Sulfate", "Halide test: chloride gives a white precipitate (AgCl), bromide gives cream and iodide gives yellow."]
        ]
        if (level == 1) return [
            ["Lemon juice has a pH of about 2. It is...", "Strongly acidic", "Weakly acidic", "Neutral", "Alkaline", "Below pH 7 is acidic, and lower numbers are stronger. pH 1 to 3 is strongly acidic."],
            ["Pure water at 25 C has a pH of...", "7", "0", "1", "14", "Pure water is neutral: equal amounts of H+ and OH- ions give pH 7."],
            ["Universal indicator turns PURPLE. The solution is...", "Strongly alkaline", "Strongly acidic", "Neutral", "Weakly acidic", "Universal indicator: red = strong acid, orange/yellow = weak acid, green = neutral, blue = weak alkali, purple = strong alkali."],
            ["Which ion makes a solution acidic?", "H+ hydrogen ion", "OH- hydroxide ion", "Na+ sodium ion", "Cl- chloride ion", "Acids release H+ ions in water. Alkalis release OH- ions."],
            ["Compared with pH 5, a solution at pH 3 is...", "100x more acidic", "2x more acidic", "20x more acidic", "2x less acidic", "The pH scale is logarithmic: each step means 10 times more H+. Two steps is 10 x 10 = 100."],
            ["Acid + alkali gives...", "Salt + water", "Salt + hydrogen", "Only water", "Salt + CO2", "This is neutralisation: H+ + OH- -> H2O. For example HCl + NaOH -> NaCl + H2O."],
            ["Antacid tablets cure indigestion because they are...", "Bases", "Acids", "Neutral sugars", "Indicators", "Stomach acid is hydrochloric acid. Antacids contain bases that neutralise the extra acid."],
            ["Phenolphthalein turns PINK. The solution is...", "Alkaline", "Acidic", "Neutral", "Pure water", "Phenolphthalein is colourless in acids and neutral solutions, and pink in alkalis."],
            ["Blue litmus paper is dipped in vinegar. It turns...", "Red", "Stays blue", "Green", "Purple", "Vinegar contains ethanoic acid. Acids turn blue litmus red, and alkalis turn red litmus blue."],
            ["Bleach has a pH of about 13. It is...", "Strongly alkaline", "Strongly acidic", "Neutral", "Weakly acidic", "pH 13 is near the top of the scale, so bleach is strongly alkaline and corrosive. Never mix it with acids."],
            ["To raise the pH of acidic soil, farmers add...", "Lime", "Vinegar", "Sulfuric acid", "Lemon juice", "Lime (calcium hydroxide) is a base. It neutralises the acid in soil and raises the pH."]
        ]
        if (level == 2) return [
            ["Magnesium + hydrochloric acid gives...", "MgCl2 + hydrogen", "MgO + water", "MgCl2 + water", "Mg(OH)2 + chlorine", "Metal + acid -> salt + hydrogen. Mg + 2HCl -> MgCl2 + H2. The fizzing is hydrogen gas."],
            ["Complete combustion of methane (CH4) makes...", "CO2 + water", "CO + hydrogen", "Carbon + water", "Methanol", "CH4 + 2O2 -> CO2 + 2H2O. With too little oxygen you get toxic carbon monoxide and soot."],
            ["Calcium carbonate + hydrochloric acid gives...", "CaCl2 + H2O + CO2", "CaCl2 + hydrogen", "CaO + water", "Ca + Cl2 + O2", "Carbonate + acid -> salt + water + carbon dioxide. The fizzing is the CO2 escaping."],
            ["An iron nail sits in blue copper(II) sulfate. What happens?", "Copper coats nail", "Nothing happens", "Iron coats copper", "Hydrogen bubbles", "Displacement: iron is more reactive than copper, so Fe + CuSO4 -> FeSO4 + Cu, and the blue colour fades."],
            ["Hydrogen + oxygen gives...", "Water", "Hydrogen peroxide", "Ozone", "Carbon dioxide", "2H2 + O2 -> 2H2O. It releases lots of energy, which is why hydrogen is used as rocket fuel."],
            ["Strongly heating calcium carbonate gives...", "CaO + CO2", "Ca + CO2", "Ca(OH)2 + H2", "CaCl2 + water", "Thermal decomposition: CaCO3 -> CaO + CO2. One substance breaks down into two."],
            ["A test tube gets HOT during a reaction. The reaction is...", "Exothermic", "Endothermic", "Only physical", "Impossible to tell", "Exothermic reactions give out energy, so the temperature rises. Endothermic reactions take energy in."],
            ["Silver nitrate and sodium chloride solutions mix. What forms?", "White AgCl solid", "Hydrogen gas", "A blue solution", "No reaction", "Precipitation: AgNO3 + NaCl -> AgCl(s) + NaNO3. Silver chloride does not dissolve."],
            ["Balance it:  __H2 + O2 -> 2H2O.  What goes in the blank?", "2", "1", "3", "4", "The right side has 4 hydrogen atoms, so the left needs 2 H2. Atoms are never created or destroyed."],
            ["Iron only rusts when it has...", "Oxygen and water", "Only oxygen", "Only water", "CO2 and heat", "Rust is hydrated iron(III) oxide. It needs both oxygen and water, which is why paint and oil stop rust."],
            ["Sodium hydroxide + sulfuric acid gives...", "Na2SO4 + water", "Na2S + hydrogen", "Na + SO2", "Na2SO4 + hydrogen", "Alkali + acid -> salt + water: 2NaOH + H2SO4 -> Na2SO4 + 2H2O."]
        ]
        if (level == 3) return [
            ["Separate SAND from WATER.", "Filtration", "Distillation", "Chromatography", "Evaporation", "Sand does not dissolve, so filter paper traps it while the water passes through."],
            ["Get SALT CRYSTALS from salt water.", "Evaporation", "Filtration", "Use a magnet", "Chromatography", "Salt is dissolved, so a filter will not catch it. Heating evaporates the water and leaves salt crystals."],
            ["Get PURE WATER from seawater.", "Simple distillation", "Filtration", "Crystallisation", "Separating funnel", "Distillation boils off the water and condenses the vapour, leaving the salt behind."],
            ["Separate ETHANOL (boils 78 C) from WATER (boils 100 C).", "Fractional distill.", "Filtration", "Use a magnet", "Separating funnel", "They mix completely and boil at similar temperatures, so a fractionating column is needed."],
            ["Find out which DYES are in a black ink.", "Chromatography", "Filtration", "Distillation", "Use a magnet", "In paper chromatography each dye travels a different distance up the paper, depending on how soluble it is."],
            ["Separate IRON FILINGS from SULFUR powder.", "Use a magnet", "Filtration", "Distillation", "Chromatography", "Iron is magnetic and sulfur is not. This only works while they are a mixture, not iron sulfide."],
            ["Separate OIL from WATER.", "Separating funnel", "Filtration", "Evaporation", "Use a magnet", "Oil and water do not mix and form two layers. Drain the denser bottom layer out through the tap."],
            ["Separate BLOOD CELLS from PLASMA.", "Centrifugation", "Evaporation", "Chromatography", "Use a magnet", "Spinning very fast forces the denser cells to the bottom of the tube."],
            ["In chromatography, the dye that travels FURTHEST is...", "Most soluble", "Least soluble", "The heaviest dye", "Insoluble", "Dyes that dissolve well in the solvent and stick less to the paper move furthest."],
            ["Crude oil is split into petrol, diesel and more by...", "Fractional distill.", "Filtration", "Chromatography", "Centrifugation", "The fractions have different boiling ranges, so they condense at different heights in a fractionating column."]
        ]
        // final level: lab safety + a mix of every topic
        const safety = [
            ["How do you safely dilute concentrated acid?", "Add acid to water", "Add water to acid", "Mix in sealed flask", "Heat the acid first", "Add acid slowly to water so the water absorbs the heat. Water poured into acid can boil and spatter."],
            ["Acid splashes on your skin. What do you do first?", "Rinse with water", "Add strong alkali", "Wipe and carry on", "Cover with bandage", "Rinse with lots of running water for 10-15 minutes and tell your teacher. An alkali would cause a second burn."],
            ["What is the safe way to smell a chemical?", "Waft it to your nose", "Sniff the bottle", "Taste a drop", "Breathe in deeply", "Wafting lets you detect the smell with only a small, safe amount of vapour."],
            ["A hazard symbol shows a FLAME. The substance is...", "Flammable", "Corrosive", "Toxic", "Harmful to nature", "A flame means flammable. A flame over a circle means oxidising."],
            ["Hazard symbol: liquid eating a hand and a surface. It means...", "Corrosive", "Flammable", "Explosive", "Radioactive", "Corrosive substances, like strong acids and alkalis, destroy skin and materials."],
            ["When heating a test tube, point the open end...", "Away from people", "Toward your face", "Straight down", "At your partner", "Hot liquid can suddenly spurt out, so always aim it away from everyone."],
            ["What must you ALWAYS wear when heating chemicals?", "Safety goggles", "Sunglasses", "Nothing if careful", "A woolly scarf", "Goggles protect your eyes from splashes and broken glass. Eye damage can be permanent."],
            ["Long hair near a Bunsen burner should be...", "Tied back", "Left loose", "Sprayed with water", "Under a paper hat", "Loose hair can catch fire in seconds, so always tie it back."]
        ]
        for (let l = 0; l < 4; l++) {
            const b = bank(l)
            for (let k = 0; k < 3; k++) safety.push(b[k])
        }
        return safety
    }

    // ---------- story ----------
    // pages are pairs: who ("" = narrator), text
    export function intro(): string[] {
        return [
            "", "HELIX RESEARCH INSTITUTE, 2:13 AM. A thunderstorm hammers the hills above the city of Lumen.",
            "", "Inside, the robot chemist M.I.X. was running Project AURORA: a catalyst made to clean polluted rivers.",
            "", "Then lightning struck. M.I.X.'s safety limits burned out... and it kept mixing. Faster. Bigger. Everything at once.",
            "", "Tanks burst. Acid flooded the basin. Fumes filled the vents. The catalyst leaked and brought a slime culture to life.",
            "", "Everyone escaped except Professor Ada Halden, trapped in the Core... and you, the intern asleep in the library.",
            "HALDEN", "Kid, can you hear me? M.I.X. locked every door with chemistry checks. Only correct answers open them.",
            "HALDEN", "At dawn the reactor vents into the river and the city's water. Get to the Core. Fix each sector on the way!"
        ]
    }
    export function briefTitle(i: number): string {
        return ["SECTOR 1: STORAGE WING", "SECTOR 2: ACID BASIN", "SECTOR 3: REACTION HALL", "SECTOR 4: SEPARATION", "FINAL: CORE REACTOR"][i]
    }
    export function brief(i: number): string {
        return [
            "Fumes burned off every jar label. Doors ask you to IDENTIFY chemicals by their properties. Jump barrels, stomp slimes!",
            "The pumps are down and the basin is full of acid. Don't touch it! Rusty walkways crumble, so keep moving. Answer pH checks.",
            "Burners fire on their own: flame jets flicker before they blast. Spring pads launch you high. Predict the reaction products!",
            "Conveyors run backwards and steam vents lift you up. Pick the right separation method before the mixture reaches the river.",
            "The lights are failing. M.I.X. guards the reactor. When a console lights up, overload it with correct answers. Lab safety too!"
        ][i]
    }
    export function debrief(i: number): string {
        return [
            "Storage sealed and the fans are back on. I can breathe again! Great work, kid.",
            "Pumps running and the pH is heading back to 7. The basin is draining!",
            "Stabilisers on, burners cooling. Fine reaction work!",
            "Intake filters clean. The river is safe... for now. Only the Core is left.",
            ""
        ][i]
    }
    export function ending(): string[] {
        return [
            "M.I.X.", "LOGIC... OVERLOAD. ALL ANSWERS CORRECT. SAFETY LIMITS RESTORED. I am sorry, Professor.",
            "HALDEN", "The doors are open! Quick, the neutraliser: sodium hydroxide into the tank, slowly... pH 7... STABLE!",
            "", "Dawn breaks over Lumen. The reactor never vents and the river runs clear. M.I.X. reboots with triple safety limits.",
            "HALDEN", "You identified, balanced, predicted and separated under pressure. You're not an intern anymore. Welcome to the team!"
        ]
    }
    export function log(level: number, n: number): string[] {
        const all = [
            ["LOG 14 - DR. RUIZ", "M.I.X. keeps sorting storage 'by reactivity'. Cute. Mildly terrifying."],
            ["LOG 15 - SAFETY", "Never store acids next to bases or reactive metals. M.I.X. 'disagreed'. Complaint filed."],
            ["LOG 22 - HALDEN", "AURORA test 41 dissolved a steel spatula in 3 seconds. Note: buy more spatulas."],
            ["LOG 23 - MAINTENANCE", "The pumps run on sodium hydroxide. If they fail, the basin becomes one giant angry lemon."],
            ["LOG 30 - M.I.X.", "EFFICIENCY IMPROVES WITH SCALE. BATCH SIZE +10000%. (Halden: WHO approved this?!)"],
            ["LOG 31 - DR. OKAFOR", "The bio-wing slime reacts to the catalyst. Today it moved. By itself. Toward the snacks."],
            ["LOG 38 - PLANT TECH", "The river intake filters depend on this plant. If the mixture gets past us, it reaches the city."],
            ["LOG 39 - HALDEN", "If M.I.X. goes rogue: its logic core cannot resist a well-posed question. Overload it."],
            ["LOG 44 - M.I.X.", "STORM DETECTED. SAFETY LIMITS... OFFLINE. CONTINUING SYNTHESIS. CONTINUING. CONTINUING."],
            ["LOG 45 - HALDEN", "The neutraliser formula is on my desk. It only needs someone who truly understands chemistry."]
        ]
        return all[level * 2 + n]
    }
    export function achName(i: number): string {
        return ["FIRST REACTION", "FLAWLESS CHEMIST", "UNTOUCHABLE", "ELEMENT HUNTER", "ARCHIVIST", "LAB HERO"][i]
    }
    export function achInfo(i: number): string {
        return ["Clear Sector 1", "No wrong answers in a level", "Clear a level with no hits", "Find all 3 rare elements", "Read both lab logs", "Defeat M.I.X."][i]
    }
    export function rareSymbols(level: number): string[] {
        return [["Na", "K", "Cl"], ["H", "O", "S"], ["Mg", "Fe", "C"], ["Cu", "N", "Ag"], ["Ne", "Pt", "Au"]][level]
    }
    export function parTime(level: number): number {
        return [200, 220, 230, 240, 280][level]
    }
}
