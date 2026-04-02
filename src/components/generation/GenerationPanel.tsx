import PromptInput from './PromptInput'
import ModelSelector from './ModelSelector'
import AspectRatioSelector from './AspectRatioSelector'
import ImageSizeSelector from './ImageSizeSelector'

export default function GenerationPanel() {
  return (
    <div className="space-y-5">
      <PromptInput />
      <div className="flex flex-wrap gap-6">
        <ModelSelector />
        <AspectRatioSelector />
        <ImageSizeSelector />
      </div>
    </div>
  )
}
