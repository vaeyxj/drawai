import PromptInput from './PromptInput'
import ModelSelector from './ModelSelector'
import AspectRatioSelector from './AspectRatioSelector'
import ImageSizeSelector from './ImageSizeSelector'
import AssetModeToggle from './AssetModeToggle'
import QuickPromptPanel from './QuickPromptPanel'

export default function GenerationPanel() {
  return (
    <div className="space-y-5">
      <PromptInput />
      <div className="flex flex-wrap items-start gap-6">
        <ModelSelector />
        <AspectRatioSelector />
        <ImageSizeSelector />
        <AssetModeToggle />
      </div>
      <QuickPromptPanel />
    </div>
  )
}
