import type { AssetPreset, AssetCategory } from '@/types'

/** Prompt suffix injected when "asset mode" is enabled */
export const ASSET_MODE_PROMPT_SUFFIX =
  '必须使用纯绿色背景(颜色代码#00FF00)。非背景元素不可使用#00FF00颜色，如需绿色使用墨绿、深绿等替代。主体边缘清晰锐利，无阴影投射到背景上，居中构图。'

export const ASSET_PRESETS: readonly AssetPreset[] = [
  {
    id: 'pixel-sprite-sheet',
    name: '像素角色 Sprite Sheet',
    description: '64x64 像素风格角色动画帧',
    category: 'character',
    promptSuffix: `创建一个像素艺术风格的2D游戏角色sprite sheet，包含完整的动画帧序列。

## 整体画布
- 最终图片尺寸：正好 384×256 像素（6列×4行，每帧64×64）
- 纯绿色背景(#00FF00)覆盖整张图
- 非背景不可以使用#00FF00颜色
- 角色朝向：侧视角（面向右侧）

## 网格布局（严格64×64像素网格，无间距无边框）
- 第1行（Y:0-63）：Idle待机动画 - 前5格有内容，第6格为纯绿色空格
- 第2行（Y:64-127）：Run跑步动画 - 6帧
- 第3行（Y:128-191）：Dash冲刺动画 - 6帧
- 第4行（Y:192-255）：Die死亡动画 - 6帧

## 关键对齐规则（最重要）
1. 脚底锚点固定：每个64×64格子内，角色脚底始终紧贴格子底边，所有帧脚底线完全一致
2. 水平居中：每个格子内角色水平方向严格居中
3. 统一体型：所有帧角色高度、宽度、头身比完全一致，约占格子高度的80%
4. 角色不超出格子边界：头顶、手臂、武器不能碰到或超出64×64的格子范围
5. 无偏移：不同帧之间角色躯干位置锁定，只有动作部位有差异

## 像素风格
- 清晰锐利的像素轮廓，鲜明颜色对比，不要抗锯齿模糊`,
  },
  {
    id: 'game-prop',
    name: '游戏道具图标',
    description: '单个道具/物品，适合背包UI',
    category: 'prop',
    promptSuffix: `绿色背景(#00FF00)，单个游戏道具物品，居中放置，清晰边缘，无阴影。适合游戏UI使用的道具图标风格。非背景不可以使用#00FF00颜色。`,
  },
  {
    id: 'scene-element',
    name: '场景元素',
    description: '树木、石头、建筑等场景装饰物',
    category: 'scene',
    promptSuffix: `绿色背景(#00FF00)，单个场景装饰元素，清晰轮廓，无投射阴影。适合2D游戏场景使用。非背景不可以使用#00FF00颜色。`,
  },
  {
    id: 'ui-element',
    name: 'UI 元素',
    description: '按钮、图标、面板等UI素材',
    category: 'ui',
    promptSuffix: `绿色背景(#00FF00)，游戏UI元素，扁平化风格，清晰边缘，适合游戏界面使用。非背景不可以使用#00FF00颜色。`,
  },
  {
    id: 'effect',
    name: '特效素材',
    description: '火焰、闪电、爆炸等特效',
    category: 'effect',
    promptSuffix: `绿色背景(#00FF00)，游戏特效元素，适合叠加使用。非背景不可以使用#00FF00颜色。`,
  },
] as const

export const ASSET_CATEGORIES: readonly { value: AssetCategory; label: string }[] = [
  { value: 'character', label: '角色' },
  { value: 'prop', label: '道具' },
  { value: 'scene', label: '场景' },
  { value: 'ui', label: 'UI' },
  { value: 'effect', label: '特效' },
  { value: 'other', label: '其他' },
] as const
