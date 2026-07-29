# 《嫌疑犯X的献身》互动 VN — 图像生成提示词（29 张）

> 画风：暗调半写实动漫 VN（参考《人狼村之谜》Raging Loop）。
> 用法：出图后按各自**文件名**存入 `assets/images/`，运行 `node scripts/sync-manifest.mjs` 回填，刷新浏览器即顶替占位。
> 下方每条 prompt 已拼成可直接粘贴的成品；负面词所有图共用。

**通用负面词（negative，所有图共用）：**

```
moe, chibi, cute, glossy cel-shading, oversaturated, neon, 3D CG render, photorealistic photo, text, captions, watermark, signature, UI elements, frame border, extra fingers, deformed hands, lowres, too dark, underexposed, pitch black, crushed blacks, murky, low visibility
```

**尺寸（务必按此出图）：**
- 场景背景 / 事件 CG / 封面 = **1920×1080**（16:9 横图）
- 线索图标 = **768×1024**（3:4 竖图，与卡片相框一致）

> ⚠️ 封面 `title_keyvisual` 必须出成 **16:9 横图**，不要出成竖图。

---

## 一、场景背景 ×10（1920×1080 · 16:9）

### `bg_tentei_day.png` — 天亭便当店·清晨
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a single warm light source, muted desaturated palette of soft warm grey tones and warm amber highlights, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, interior of a small cramped downtown Tokyo bento lunch shop in early morning, a glass sliding door, photos of lunch boxes pinned on the wall, a service counter with an old register, warm fluorescent light, lived-in working-class atmosphere, empty and quiet with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_yasuko_apt_night.png` — 靖子的公寓·夜
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a single warm light source, muted desaturated palette of soft warm grey tones and warm amber highlights, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, interior of a modest cramped Japanese apartment at night, a low kotatsu heated table in the center under cold fluorescent light, a small kitchenette to the side, tidy but poor furnishings, a wall clock, tense quiet emptiness with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_ishigami_apt_night.png` — 石神的公寓·夜
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a single warm light source, muted desaturated palette of soft warm grey tones and warm amber highlights, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, interior of a cramped cluttered apartment at night, the floor and shelves stacked with old mathematics textbooks and loose papers, sparse worn furniture, one dim desk lamp, lonely scholarly gloom with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_sumida_bank_dawn.png` — 隅田川河岸·清晨
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility, muted desaturated palette of soft warm grey tones and faint warm light, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, the Sumida riverbank at overcast dawn, a long row of homeless shelters built from blue plastic tarpaulin under a massive elevated expressway, a weathered bench, murky grey river water, cold bleak desolate mood with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_apartment_stairs_night.png` — 公寓楼梯·夜
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a single warm bulb, muted desaturated palette of soft warm grey tones and warm amber, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, the dim narrow concrete stairwell of an old shabby two-story apartment block at night, peeling patched walls, a single weak bare bulb, deep shadows, melancholic emptiness with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_interrogation_room.png` — 侦讯室
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a single hanging lamp, muted desaturated palette of soft warm grey tones and warm amber pool of light, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, a dark police interrogation room, a bare metal table with two chairs, a single hanging pendant lamp casting a tight pool of light, a large one-way mirror on the wall, a few photos pinned beside it, heavy surrounding shadows, oppressive cold mood with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_university_lab.png` — 帝都大学物理研究室
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft directional afternoon light through window blinds, muted desaturated palette of charcoal teal-grey and warm amber, melancholic intellectual atmosphere, soft film grain, subtle depth of field, a university physics research laboratory in the afternoon, a chess board mid-game on a cluttered desk, a large coffee mug, scattered papers and instruments, a wall clock, quiet intellectual stillness with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_family_restaurant_dusk.png` — 家庭餐厅·黄昏
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility, muted desaturated palette of charcoal teal-grey shadows and fading warm amber, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, a window booth inside a suburban Japanese family restaurant at dusk, a coffee cup on the laminate table, a quiet city street visible through the rain-flecked window, fading amber light, subtle unease with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_river_kiyosu_dawn.png` — 清洲桥河边·清晨
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, flat cold dawn light, muted desaturated palette of charcoal teal-grey and pale cold sky, melancholic noir mystery atmosphere, soft film grain, subtle depth of field, the riverside walkway near Kiyosu Bridge over the Sumida river at cold dawn, an empty bench, distant blue-tarp homeless shelters, flat grey water, an office building glass door faintly reflecting the pale sky, somber decisive atmosphere with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `bg_apartment_exterior_rain_night.png` — 公寓外观·雨夜
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a lone streetlight, muted desaturated palette of charcoal teal-grey shadows and cold amber, rainy melancholic noir mystery atmosphere, soft film grain, subtle depth of field, exterior of an old shabby two-story apartment building on a rainy night, a few dim half-lit windows, a wet external staircase, glistening rain streaks under a lone streetlight, moody watchful loneliness with no people, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

---

## 二、含人物高潮 CG ×10（1920×1080 · 16:9）

### `cg_murder_strangling.png` — 命案·四只手
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility, muted desaturated palette of soft warm grey tones with a faint blood-red tension, melancholic horror atmosphere, soft film grain, in a cramped apartment beside a low kotatsu table at night, a desperate beautiful tired Japanese single mother in her late 30s with large dark eyes pulls an electrical cord tight around the neck of a sleazy puffy-faced middle-aged man who claws at it, while her thin timid fourteen-year-old daughter in a dark school uniform pins down his arm, four straining hands together, faces half hidden in shadow, restrained and not graphic, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_ishigami_examines_body.png` — 石神验尸
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility with a single dim overhead light, muted desaturated palette of charcoal teal-grey and warm amber, eerie composed atmosphere, soft film grain, a stocky heavy-set plain Japanese man in his early 40s with a large round face and very small narrow eyes wearing a dark navy judo-club tracksuit and work gloves, kneeling on one knee beside a blanket-covered body on the floor of a cramped apartment strewn with mathematics books, calmly and coldly observing and deducing, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_stairs_passing.png` — 楼梯擦身
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, dim soft lighting, muted desaturated palette of charcoal teal-grey and faint warm amber, restrained melancholic atmosphere, soft film grain, on a dim old apartment stairwell at night a stocky plain expressionless middle-aged man descends with his head deliberately lowered to avoid eye contact, passing a beautiful tired woman with large dark eyes who is ascending, unspoken emotion between them, soft shadow, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_umbrella_rain_watcher.png` — 雨夜撑伞
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility, muted desaturated palette of charcoal teal-grey shadows and cold amber, rainy melancholic noir atmosphere, soft film grain, seen from a distance on a rainy night a stocky plain middle-aged man stands beneath a black umbrella at the foot of an apartment stairwell, his face hidden in shadow, slowly turning to leave, blurred red taxi tail-lights in the rain, jealousy longing and surveillance condensed into one lonely image, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_yukawa_reunion_night.png` — 汤川夜访解题
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, dim desk-lamp lighting with pale dawn at the window, muted desaturated palette of charcoal teal-grey and warm amber, quiet intellectual atmosphere, soft film grain, late night in a cluttered apartment a stocky plain man hunched over a desk covered in dense handwritten mathematical equations while a youthful handsome bespectacled physics professor dozes nearby under a draped coat, the window just beginning to pale with dawn, weary friendship, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_river_confrontation.png` — 河边对峙
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, flat cold dawn light, muted desaturated palette of charcoal teal-grey and pale cold sky, tense melancholic atmosphere, soft film grain, cold overcast dawn on the Sumida riverbank by the bridge, a stocky plain man holding a briefcase stands facing a composed handsome bespectacled professor, among blue-tarp homeless shelters and an empty bench, a tense final intellectual standoff with a sorrowful undertone, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_park_truth_reveal.png` — 公园揭真相
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, dim dusk lighting, muted desaturated palette of charcoal teal-grey shadows and faint warm amber, oppressive devastating atmosphere, soft film grain, on a bench in a small park beneath a looming elevated concrete expressway at dusk a composed bespectacled professor speaks quietly while a beautiful woman beside him goes rigid with one hand pressed over her mouth, drained of color and on the verge of collapse, a devastating revelation, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_interrogation_climax.png` — 侦讯室对峙（= 参考图）
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, soft natural lighting with clear visibility from a single hanging lamp, muted desaturated palette of charcoal teal-grey shadows and warm amber pool, charged sorrowful atmosphere, soft film grain, in a dark interrogation room under a single hanging lamp a stocky plain man in a dark suit and a beautiful tearful woman with a ponytail sit facing each other across a bare table, a one-way mirror and pinned photos behind them, a silent emotional confrontation, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_ishigami_breakdown.png` — 结局崩溃（封面级）
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, stark low-key lighting, muted desaturated palette of charcoal teal-grey shadows and cold light, harrowing emotional climax atmosphere, soft film grain, in a stark police corridor a beautiful woman has collapsed to her knees with her forehead pressed to the floor weeping in confession, nearby a stocky plain man with an ashen face and bloodshot eyes staggers backward clutching his head and howling like a wounded beast as if vomiting out his soul, while a handsome bespectacled professor grips his shoulders from behind to restrain him, devastating, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

### `cg_rescue_flashback.png` — 一年前救赎
```
Cinematic semi-realistic anime visual-novel illustration in the style of a mature mystery game like Raging Loop, painterly detailed rendering, dim interior with a warm shaft of doorway light, muted desaturated palette of charcoal teal-grey and warm amber, atmosphere of despair meeting salvation, soft film grain, one year earlier in a dim apartment a lonely stocky plain man stands on a stool with a noose hanging from a nail in the wall about to end his life, frozen as the doorbell rings, the door opening to reveal silhouetted in a warm shaft of doorway light a beautiful mother and her daughter with striking eyes, the noose and nail against the warm light, high detail, atmospheric, somber mood, key-visual quality, no text, no UI, no watermark
```

---

## 三、线索图标 ×8（768×1024 · 3:4 竖图，物件居中占满 ¾ 画面、中性灰底）

### `icon_green_bicycle.png` — 绿色脚踏车
```
Semi-realistic painterly inventory item icon for a mature mystery game, a single green ladies commuter bicycle seen from the side, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, somber mood, portrait 3:4, no text, no watermark
```

### `icon_kotatsu_cord.png` — 暖桌电线
```
Semi-realistic painterly inventory item icon for a mature mystery game, a single black electrical kotatsu cord neatly coiled, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, ominous, somber mood, portrait 3:4, no text, no watermark
```

### `icon_room_key_305.png` — 旅馆钥匙 305
```
Semi-realistic painterly inventory item icon for a mature mystery game, a single old inn room key with a round metal tag stamped 305, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, somber mood, portrait 3:4, no watermark
```

### `icon_movie_tickets.png` — 电影票根
```
Semi-realistic painterly inventory item icon for a mature mystery game, two used cinema ticket stubs fanned and slightly overlapping, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, somber mood, portrait 3:4, no watermark
```

### `icon_math_notebook.png` — 算式报告纸
```
Semi-realistic painterly inventory item icon for a mature mystery game, a small stack of report papers densely covered in handwritten mathematical equations, slightly angled, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, somber mood, portrait 3:4, no watermark
```

### `icon_wiretap.png` — 窃听器
```
Semi-realistic painterly inventory item icon for a mature mystery game, a small radio receiver listening bug with a coiled earphone wire, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, sinister, somber mood, portrait 3:4, no text, no watermark
```

### `icon_diamond_ring.png` — 钻戒
```
Semi-realistic painterly inventory item icon for a mature mystery game, an open velvet ring box with a single diamond ring catching a faint glint of light, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, somber mood, portrait 3:4, no text, no watermark
```

### `icon_blue_tarp.png` — 蓝色塑胶布
```
Semi-realistic painterly inventory item icon for a mature mystery game, a single folded square of blue plastic tarpaulin, centered and filling about three quarters of a vertical 3:4 frame, fully visible, clean soft even studio lighting, muted desaturated palette, plain smooth dark slate-grey gradient background, subtle vignette, crisp and legible, ominous, somber mood, portrait 3:4, no text, no watermark
```

---

## 四、标题主视觉 ×1（1920×1080 · 16:9 横图）

### `title_keyvisual.png` — 封面主视觉
```
Cinematic semi-realistic anime visual-novel key visual, painterly highly detailed, melancholic overcast dusk with a low break of pale golden light on the horizon over a distant hazy city skyline, muted desaturated palette of charcoal teal-grey with a faint warm glow, soft film grain, subtle depth of field, wide establishing shot: a lone stocky ordinary man seen from behind standing on a wet paved riverside walkway in the foreground left, messy short dark hair, plain dark short-sleeve shirt, looking across the calm reflective river toward a long arched truss bridge and the far city, a metal railing and a bench beside him; on the right a massive elevated concrete expressway recedes into the distance with a long row of homeless shelters draped in blue plastic tarpaulin beneath it, puddles on the wet path; far down the walkway a small distant woman in a long skirt stands still and looks back toward him; immense moody cloudy sky, lonely sorrowful atmosphere, cinematic composition, high detail, key-visual quality, no text, no UI, no watermark
```

---

## 角色一致性备忘（含人物 CG 用）

为保证同一角色跨图一致，可在对应 CG 里固定这些外貌描述（已内嵌在上方 prompt 中）：

- **石神 ishigami**：stocky heavy-set Japanese man, early 40s but looks near 50, large round face, very small narrow eyes, short thin sparse hair, plain features, expressionless
- **靖子 yasuko**：slender petite beautiful Japanese woman, late 30s, small face, large dark eyes, tired gentle single-mother air
- **美里 misato**：thin timid Japanese girl ~14, large dark eyes, dark school uniform
- **汤川 yukawa**：youthful handsome physics professor, thick neat hair, thin metal-frame glasses, cool composed
- **草薙 kusanagi**：seasoned mid-career detective, sharp gaze, turned-up-collar coat
- **富坚 togashi**：middle-aged man, once handsome now puffy, sleazy oily air
- **工藤 kudo**：well-groomed fashionable businessman, neat handsome face

> 若 Image2 支持参考图/img2img：建议先各出 1 张主角定妆参考，再以其为 reference + 固定 seed 出对应 CG。

## 出图流程

1. 按上方 prompt 逐张生成，宽高比照标注（场景/CG/封面 16:9；线索图标 3:4）。
2. 保存为对应**文件名**：
   - 场景背景、事件 CG → `assets/images/`
   - **封面 `title_keyvisual.png` 与 8 个 `icon_*.png` → `assets/images/cover_icons/`**（单独文件夹）
3. 运行 `node scripts/sync-manifest.mjs` 回填 `assets/manifest.json`（已支持子文件夹递归）。
4. 刷新浏览器（`localhost:8099`，文件名不变时用 `Cmd+Shift+R` 硬刷新），占位自动替换为正式美术。

建议先出 `cg_interrogation_climax`、`cg_murder_strangling`、`cg_ishigami_examines_body`、`bg_yasuko_apt_night`、`title_keyvisual` 这 5 张校准画风，统一后再批量出全。
